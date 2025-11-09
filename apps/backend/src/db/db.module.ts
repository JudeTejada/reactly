import { Module, Global } from "@nestjs/common";
import {
  DrizzleProvider,
  DRIZZLE_ASYNC_PROVIDER,
} from "./providers/drizzle.provider";

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DRIZZLE_ASYNC_PROVIDER],
})
export class DatabaseModule {}
