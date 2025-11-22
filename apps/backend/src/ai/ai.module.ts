import { Module } from "@nestjs/common";
import { GlmAiService } from "./glm-ai.service";

@Module({
  providers: [GlmAiService],
  exports: [GlmAiService],
})
export class AiModule {}
