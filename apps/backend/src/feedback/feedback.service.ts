import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { db } from "../db";
import { feedback, projects, users } from "../db/schema";
import { AiService } from "../ai/ai.service";
import { WebhookService } from "../webhook/webhook.service";
import type { SubmitFeedbackDto, PaginatedResponse } from "@reactly/shared";
import type { Feedback } from "../db/schema";
import { eq, and, desc, ilike, gte, lte, sql } from "drizzle-orm";

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly webhookService: WebhookService
    
  ) {}

  private async getUserInternalId(clerkUserId: string): Promise<string> {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException("User not found");
    }

    return user[0].id;
  }

  async submitFeedback(
    projectId: string,
    dto: SubmitFeedbackDto,
    metadata?: Record<string, any>
  ): Promise<Feedback> {
    this.logger.log(`Submitting feedback for project ${projectId}`);

    const sentimentResult = await this.aiService.analyzeSentiment(dto.text);

    const [newFeedback] = await db
      .insert(feedback)
      .values({
        projectId,
        text: dto.text,
        rating: dto.rating,
        category: dto.category,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        metadata: metadata || dto.metadata,
      })
      .returning();

    if (sentimentResult.sentiment === "negative" || dto.rating <= 2) {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (project?.webhookUrl) {
        await this.webhookService.sendDiscordNotification(
          newFeedback,
          project.webhookUrl
        );
      }
    }

    this.logger.log(`Feedback created: ${newFeedback.id}`);
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
    const internalUserId = await this.getUserInternalId(clerkUserId);
    const page = options.page || 1;
    const pageSize = Math.min(options.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.userId, internalUserId));

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
      db
        .select()
        .from(feedback)
        .where(whereClause)
        .orderBy(desc(feedback.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
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
    const internalUserId = await this.getUserInternalId(clerkUserId);

    const [item] = await db
      .select()
      .from(feedback)
      .innerJoin(projects, eq(feedback.projectId, projects.id))
      .where(and(eq(feedback.id, id), eq(projects.userId, internalUserId)))
      .limit(1);

    if (!item) {
      throw new NotFoundException("Feedback not found");
    }

    return item.feedback;
  }

  async deleteFeedback(id: string, clerkUserId: string): Promise<void> {
    const feedbackItem = await this.findOne(id, clerkUserId);

    await db.delete(feedback).where(eq(feedback.id, feedbackItem.id));

    this.logger.log(`Feedback deleted: ${id}`);
  }
}
