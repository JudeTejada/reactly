import { Module } from "@nestjs/common";
import { GeminiAiService } from "./gemini-ai.service";
import { GlmAiService } from "./glm-ai.service";

@Module({
  providers: [GeminiAiService, GlmAiService],
  exports: [GeminiAiService, GlmAiService],
})
export class AiModule {}
