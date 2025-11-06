import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined. Please check your .env file."
  );
}

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
