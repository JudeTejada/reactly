import { Injectable, Logger, NotFoundException, Inject } from "@nestjs/common";
import { feedback, projects } from "../db/schema";
import {
  GET_USER_INTERNAL_ID,
  GET_USER_PROJECTS,
  CHECK_PROJECT_OWNERSHIP,
} from "../user/providers";
import type { SubmitFeedbackDto, PaginatedResponse } from "@reactly/shared";
import type { Feedback } from "../db/schema";
import { eq, and, desc, ilike, gte, lte, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../db/providers/drizzle.provider";
import { FeedbackQueueService } from "./feedback-queue.service";

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly feedbackQueueService: FeedbackQueueService,
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
    @Inject(GET_USER_INTERNAL_ID)
    private readonly getUserInternalId: any,
    @Inject(GET_USER_PROJECTS)
    private readonly getUserProjects: any,
    @Inject(CHECK_PROJECT_OWNERSHIP)
    private readonly checkProjectOwnership: any
  ) {}

  async submitFeedback(
    projectId: string,
    dto: SubmitFeedbackDto,
    metadata?: Record<string, any>
  ): Promise<Feedback> {
    this.logger.log(`Submitting feedback for project ${projectId}`);

    const [newFeedback] = await this.db
      .insert(feedback)
      .values({
        projectId,
        text: dto.text,
        userName: dto.name,
        userEmail: dto.email,
        rating: 0, // Will be set by AI processing
        category: "general", // Will be set by AI processing
        sentiment: "pending", // Will be set by AI processing
        sentimentScore: 0, // Will be set by AI processing
        processingStatus: "pending",
        metadata: metadata || dto.metadata,
      })
      .returning();

    // Queue the feedback for async AI processing
    await this.feedbackQueueService.processFeedback(
      newFeedback.id,
      projectId,
      dto.text,
      metadata || dto.metadata
    );

    this.logger.log(
      `Feedback created: ${newFeedback.id} and queued for processing`
    );
    return newFeedback;
  }

  async findAll(
    clerkUserId: string,
    options: {
      projectId?: string;
      sentiment?: string;
      category?: string;
      search?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      pageSize?: number;
    }
  ): Promise<PaginatedResponse<Feedback>> {
    const page = options.page || 1;
    const pageSize = Math.min(options.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    // Use centralized service to get user's project IDs
    const internalUserId = await this.getUserInternalId.execute(clerkUserId);
    const userProjects = await this.getUserProjects.execute(internalUserId);
    const projectIds = userProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }

    const conditions = [sql`${feedback.projectId} IN ${projectIds}`];

    if (options.projectId) {
      conditions.push(eq(feedback.projectId, options.projectId));
    }

    if (options.sentiment) {
      conditions.push(eq(feedback.sentiment, options.sentiment));
    }

    if (options.category) {
      conditions.push(eq(feedback.category, options.category));
    }

    if (options.search) {
      conditions.push(ilike(feedback.text, `%${options.search}%`));
    }

    if (options.startDate) {
      conditions.push(gte(feedback.createdAt, options.startDate));
    }

    if (options.endDate) {
      conditions.push(lte(feedback.createdAt, options.endDate));
    }

    const whereClause = and(...conditions);

    const [items, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(feedback)
        .where(whereClause)
        .orderBy(desc(feedback.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(feedback)
        .where(whereClause),
    ]);

    return {
      items,
      total: count,
      page,
      pageSize,
      hasMore: offset + items.length < count,
    };
  }

  async findOne(id: string, clerkUserId: string): Promise<Feedback> {
    // Use centralized service to check feedback ownership
    const [item] = await this.db
      .select()
      .from(feedback)
      .innerJoin(projects, eq(feedback.projectId, projects.id))
      .where(eq(feedback.id, id))
      .limit(1);

    if (!item) {
      throw new NotFoundException("Feedback not found");
    }

    // Verify user owns the project this feedback belongs to
    const internalUserId = await this.getUserInternalId.execute(clerkUserId);
    const ownsProject = await this.checkProjectOwnership.execute(
      internalUserId,
      item.feedback.projectId
    );
    if (!ownsProject) {
      throw new NotFoundException("Feedback not found");
    }

    return item.feedback;
  }

  async deleteFeedback(id: string, clerkUserId: string): Promise<void> {
    const feedbackItem = await this.findOne(id, clerkUserId);

    await this.db.delete(feedback).where(eq(feedback.id, feedbackItem.id));

    this.logger.log(`Feedback deleted: ${id}`);
  }

  async getProcessingStatus(
    id: string,
    clerkUserId: string
  ): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    feedback?: Feedback;
  }> {
    const feedbackItem = await this.findOne(id, clerkUserId);

    return {
      status: feedbackItem.processingStatus as any,
      feedback: feedbackItem,
    };
  }
}
