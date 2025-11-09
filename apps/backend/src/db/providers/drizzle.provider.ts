import { Provider } from "@nestjs/common";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../schema";

export const DRIZZLE_PROVIDER = "DRIZZLE_PROVIDER";

export const DrizzleProvider: Provider = {
  provide: DRIZZLE_PROVIDER,
  useFactory: () => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not defined. Please check your .env file."
      );
    }

    const pool = new Pool({ connectionString });
    return drizzle(pool, { schema });
  },
  scope: Scope.TRANSIENT,
};

import { Scope } from "@nestjs/common";
