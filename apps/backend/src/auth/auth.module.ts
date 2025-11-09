import { Module } from "@nestjs/common";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { ApiKeyGuard } from "./api-key.guard";
import { ApiKeyService } from "./api-key.service";

@Module({
  providers: [ClerkAuthGuard, ApiKeyGuard, ApiKeyService],
  exports: [ClerkAuthGuard, ApiKeyGuard, ApiKeyService],
})
export class AuthModule {}
