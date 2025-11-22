import { Injectable, Logger, NotFoundException, Inject } from "@nestjs/common";
import {
  GET_USER_INTERNAL_ID,
  GET_USER_PROJECTS,
  CHECK_PROJECT_OWNERSHIP,
} from "../user/providers";
import type { SubmitFeedbackDto, PaginatedResponse } from "@reactly/shared";
import type { Feedback } from "../db/schema";
import {
  CREATE_FEEDBACK,
  DELETE_FEEDBACK,
  ENQUEUE_FEEDBACK,
  FIND_ALL_FEEDBACK,
  FIND_ONE_FEEDBACK,
} from "./providers/tokens";
import type {
  CreateFeedbackProvider,
  DeleteFeedbackProvider,
  EnqueueFeedbackProvider,
  FindAllFeedbackProvider,
  FindOneFeedbackProvider,
} from "./providers";

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @Inject(CREATE_FEEDBACK)
    private readonly createFeedbackProvider: CreateFeedbackProvider,
    @Inject(DELETE_FEEDBACK)
    private readonly deleteFeedbackProvider: DeleteFeedbackProvider,
    @Inject(ENQUEUE_FEEDBACK)
    private readonly enqueueFeedbackProvider: EnqueueFeedbackProvider,
    @Inject(FIND_ALL_FEEDBACK)
    private readonly findAllFeedbackProvider: FindAllFeedbackProvider,
    @Inject(FIND_ONE_FEEDBACK)
    private readonly findOneFeedbackProvider: FindOneFeedbackProvider,
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

    const newFeedback = await this.createFeedbackProvider.execute(
      projectId,
      dto,
      metadata
    );

    // Queue the feedback for async AI processing
    await this.enqueueFeedbackProvider.execute(
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
    // Use centralized service to get user's project IDs
    const internalUserId = await this.getUserInternalId.execute(clerkUserId);
    const userProjects = await this.getUserProjects.execute(internalUserId);
    const projectIds = userProjects.map((p) => p.id);

    return this.findAllFeedbackProvider.execute(projectIds, options);
  }

  async findOne(id: string, clerkUserId: string): Promise<Feedback> {
    const feedbackItem = await this.findOneFeedbackProvider.execute(id);

    // Verify user owns the project this feedback belongs to
    const internalUserId = await this.getUserInternalId.execute(clerkUserId);
    const ownsProject = await this.checkProjectOwnership.execute(
      internalUserId,
      feedbackItem.projectId
    );
    if (!ownsProject) {
      throw new NotFoundException("Feedback not found");
    }

    return feedbackItem;
  }

  async deleteFeedback(id: string, clerkUserId: string): Promise<void> {
    const feedbackItem = await this.findOne(id, clerkUserId);

    await this.deleteFeedbackProvider.execute(feedbackItem.id);
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
