import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { FeedbackModule } from "./feedback/feedback.module";
import { ProjectsModule } from "./projects/projects.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AiModule } from "./ai/ai.module";
import { WebhookModule } from "./webhook/webhook.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    FeedbackModule,
    ProjectsModule,
    AnalyticsModule,
    AiModule,
    WebhookModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
