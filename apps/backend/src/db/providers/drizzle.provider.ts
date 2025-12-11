import { Provider, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";

export const DRIZZLE_ASYNC_PROVIDER = "DRIZZLE_ASYNC_PROVIDER";

export const DrizzleProvider: Provider = {
  provide: DRIZZLE_ASYNC_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>("DATABASE_URL");

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not defined. Please check your configuration."
      );
    }

    // Use standard PostgreSQL connection
    const client = postgres(connectionString);
    return drizzle(client, { schema });
  },
  scope: Scope.TRANSIENT,
};
