import { Module } from "@nestjs/common";
import { InsightsController } from "./insights.controller";
import { InsightsService } from "./insights.service";
import { InsightsProcessor } from "./insights.processor";
import { userProviders } from "../user/providers";
import { RedisModule } from "./redis.module";
import { AiModule } from "../ai/ai.module";
import { insightsProviders } from "./providers";

@Module({
  imports: [RedisModule, AiModule],
  controllers: [InsightsController],
  providers: [
    InsightsService,
    InsightsProcessor,
    ...insightsProviders,
    ...userProviders,
  ],
  exports: [InsightsService],
})
export class InsightsModule {}
