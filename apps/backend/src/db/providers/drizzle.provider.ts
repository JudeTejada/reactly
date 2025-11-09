import { Provider, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { Pool } from "@neondatabase/serverless";
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

    // Detect if we're using NeonDB or local PostgreSQL
    const isNeon = connectionString.includes("neon.tech");

    if (isNeon) {
      // Use NeonDB serverless connection
      const pool = new Pool({ connectionString });
      return drizzle(pool, { schema });
    } else {
      // Use local PostgreSQL connection
      const client = postgres(connectionString);
      return drizzlePostgres(client, { schema });
    }
  },
  scope: Scope.TRANSIENT,
};
