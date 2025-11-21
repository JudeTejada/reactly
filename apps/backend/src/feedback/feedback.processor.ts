import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { WebhookService } from "../webhook/webhook.service";
import { GlmAiService } from "../ai/glm-ai.service";
import { feedback, projects } from "../db/schema";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE_ASYNC_PROVIDER } from "../db/providers/drizzle.provider";
import { Inject } from "@nestjs/common";
import type { Feedback } from "../db/schema";

export interface ProcessFeedbackJob {
  feedbackId: string;
  projectId: string;
  text: string;
  metadata?: Record<string, any>;
}

@Processor("feedback-processing")
@Injectable()
export class FeedbackProcessor extends WorkerHost {
  private readonly logger = new Logger(FeedbackProcessor.name);

  constructor(
    private readonly aiService: GlmAiService,
    private readonly webhookService: WebhookService,
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<any>
  ) {
    super();
  }

  async process(job: Job<ProcessFeedbackJob>): Promise<void> {
    const { feedbackId, projectId, text, metadata } = job.data;
    const startTime = Date.now();

    this.logger.log(`Starting feedback processing for feedback ${feedbackId}`);

    try {
      // Update progress to 20%
      await job.updateProgress(20);

      // Run AI analysis
      this.logger.log(`Running AI analysis for feedback ${feedbackId}`);
      const [sentimentResult, analysisResult] = await Promise.all([
        this.aiService.analyzeSentiment(text),
        this.aiService.analyzeFeedback(text),
      ]);

      await job.updateProgress(60);

      // Update feedback with AI results
      await this.db
        .update(feedback)
        .set({
          rating: analysisResult.rating,
          category: analysisResult.category,
          sentiment: sentimentResult.sentiment,
          sentimentScore: sentimentResult.score,
          processingStatus: "completed",
          metadata: metadata || {},
          updatedAt: new Date(),
        })
        .where(eq(feedback.id, feedbackId));

      await job.updateProgress(90);

      // Check if we need to send notifications (for negative feedback)
      if (
        sentimentResult.sentiment === "negative" ||
        analysisResult.rating <= 2
      ) {
        const [project] = await this.db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);

        if (project?.webhookUrl) {
          // Get the updated feedback with AI analysis
          const [updatedFeedback] = await this.db
            .select()
            .from(feedback)
            .where(eq(feedback.id, feedbackId))
            .limit(1);

          if (updatedFeedback) {
            await this.webhookService.sendDiscordNotification(
              updatedFeedback,
              project.webhookUrl
            );
          }
        }
      }

      await job.updateProgress(100);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Completed feedback processing for feedback ${feedbackId} in ${processingTime}ms`
      );
    } catch (error) {
      this.logger.error(
        `Failed feedback processing for feedback ${feedbackId}`,
        error
      );

      // Update feedback status to failed
      await this.db
        .update(feedback)
        .set({
          processingStatus: "failed",
          updatedAt: new Date(),
        })
        .where(eq(feedback.id, feedbackId));

      throw error;
    }
  }
}
