import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

export interface ProcessFeedbackJob {
  feedbackId: string;
  projectId: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface FeedbackProcessingStatus {
  status: "pending" | "processing" | "completed" | "failed" | "not_found";
  progress?: number;
  error?: string;
}

@Injectable()
export class FeedbackQueueService {
  private readonly logger = new Logger(FeedbackQueueService.name);

  constructor(
    @InjectQueue("feedback-processing") private readonly feedbackQueue: Queue
  ) {}

  async processFeedback(
    feedbackId: string,
    projectId: string,
    text: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    // Determine priority based on feedback characteristics
    const priority = this.calculatePriority(text);

    this.logger.log(
      `Adding feedback ${feedbackId} to processing queue with priority ${priority}`
    );

    const job = await this.feedbackQueue.add(
      "process-feedback",
      {
        feedbackId,
        projectId,
        text,
        metadata,
      },
      {
        priority,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    return job.id as string;
  }

  async getProcessingStatus(
    feedbackId: string
  ): Promise<FeedbackProcessingStatus> {
    // Check if feedback has been processed by looking at the database
    // This is a simplified implementation - in production you might want to track job IDs
    return {
      status: "pending",
    };
  }

  private calculatePriority(text: string): number {
    // High priority for negative feedback (smaller number = higher priority in BullMQ)
    const negativeKeywords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "disappointed",
      "frustrated",
      "angry",
      "broken",
      "error",
      "bug",
    ];

    const textLower = text.toLowerCase();
    const hasNegativeKeywords = negativeKeywords.some((keyword) =>
      textLower.includes(keyword)
    );

    return hasNegativeKeywords ? 1 : 5; // High priority for negative feedback
  }
}
