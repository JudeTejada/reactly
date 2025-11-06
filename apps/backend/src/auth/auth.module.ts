import { Module } from "@nestjs/common";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { ApiKeyGuard } from "./api-key.guard";

@Module({
  providers: [ClerkAuthGuard, ApiKeyGuard],
  exports: [ClerkAuthGuard, ApiKeyGuard],
})
export class AuthModule {}
