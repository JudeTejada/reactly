import { Module } from "@nestjs/common";
import { FeedbackController } from "./feedback.controller";
import { FeedbackService } from "./feedback.service";
import { AiModule } from "../ai/ai.module";
import { WebhookModule } from "../webhook/webhook.module";
import { AuthModule } from "../auth/auth.module";
import { queryProviders, authorizationProviders } from "../user/providers";

@Module({
  imports: [AiModule, WebhookModule, AuthModule],
  controllers: [FeedbackController],
  providers: [
    FeedbackService,
    ...queryProviders,
    ...authorizationProviders, // Include user query and authorization providers
  ],
  exports: [FeedbackService],
})
export class FeedbackModule {}
