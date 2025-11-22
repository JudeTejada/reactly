import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { FeedbackModule } from "./feedback/feedback.module";
import { ProjectsModule } from "./projects/projects.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AiModule } from "./ai/ai.module";
import { WebhookModule } from "./webhook/webhook.module";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health.controller";
import { DatabaseModule } from "./db/db.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { envValidationSchema } from "./config/env.validation";
import { UserModule } from './user/user.module';
import { InsightsModule } from './insights/insights.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60000),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),
    AuthModule,
    FeedbackModule,
    ProjectsModule,
    AnalyticsModule,
    InsightsModule,
    AiModule,
    WebhookModule,
    UserModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
