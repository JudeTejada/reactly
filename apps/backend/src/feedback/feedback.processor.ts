import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger, Inject } from "@nestjs/common";
import { Job } from "bullmq";
import { WebhookService } from "../webhook/webhook.service";
import { GlmAiService } from "../ai/glm-ai.service";
import {
  UPDATE_FEEDBACK,
  GET_PROJECT,
  FIND_ONE_FEEDBACK,
} from "./providers/tokens";
import type {
  UpdateFeedbackProvider,
  GetProjectProvider,
  FindOneFeedbackProvider,
} from "./providers";

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
    @Inject(UPDATE_FEEDBACK)
    private readonly updateFeedbackProvider: UpdateFeedbackProvider,
    @Inject(GET_PROJECT)
    private readonly getProjectProvider: GetProjectProvider,
    @Inject(FIND_ONE_FEEDBACK)
    private readonly findOneFeedbackProvider: FindOneFeedbackProvider
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
      await this.updateFeedbackProvider.execute(feedbackId, {
        rating: analysisResult.rating,
        category: analysisResult.category,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        processingStatus: "completed",
        metadata: metadata || {},
      });

      await job.updateProgress(90);

      // Check if we need to send notifications (for negative feedback)
      if (
        sentimentResult.sentiment === "negative" ||
        analysisResult.rating <= 2
      ) {
        const project = await this.getProjectProvider.execute(projectId);

        if (project?.webhookUrl) {
          // Get the updated feedback with AI analysis
          // We use findOneFeedbackProvider but need to be careful as it throws if not found
          // In this context, if feedback was just updated, it should exist.
          try {
            const updatedFeedback =
              await this.findOneFeedbackProvider.execute(feedbackId);

            if (updatedFeedback) {
              await this.webhookService.sendDiscordNotification(
                updatedFeedback,
                project.webhookUrl
              );
            }
          } catch (error) {
            this.logger.warn(
              `Could not find feedback ${feedbackId} for notification: ${error.message}`
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
      try {
        await this.updateFeedbackProvider.execute(feedbackId, {
          processingStatus: "failed",
        });
      } catch (updateError) {
        this.logger.error(
          `Failed to update feedback status to failed for ${feedbackId}`,
          updateError
        );
      }

      throw error;
    }
  }
}
