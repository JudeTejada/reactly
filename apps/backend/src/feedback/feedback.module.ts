import { Module } from "@nestjs/common";
import { FeedbackController } from "./feedback.controller";
import { FeedbackService } from "./feedback.service";
import { FeedbackProcessor } from "./feedback.processor";
import { FeedbackQueueService } from "./feedback-queue.service";
import { AiModule } from "../ai/ai.module";
import { WebhookModule } from "../webhook/webhook.module";
import { AuthModule } from "../auth/auth.module";
import { queryProviders, authorizationProviders } from "../user/providers";
import { BullModule } from "@nestjs/bullmq";

@Module({
  imports: [
    AiModule,
    WebhookModule,
    AuthModule,
    BullModule.registerQueue({
      name: "feedback-processing",
    }),
  ],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    FeedbackProcessor,
    FeedbackQueueService,
    ...queryProviders,
    ...authorizationProviders,
  ],
  exports: [FeedbackService],
})
export class FeedbackModule {}
