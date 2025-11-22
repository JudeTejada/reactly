import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables directly
dotenv.config({ path: '.env.local' });

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined. Please check your .env.local file.");
  }

  console.log("Connecting to database...");

  // Check if using Neon (contains .neon.tech) or local PostgreSQL
  const isNeon = connectionString.includes('.neon.tech');
  console.log(`Detected ${isNeon ? 'Neon' : 'local PostgreSQL'} database`);

  // For both Neon and local PostgreSQL, use postgres-js driver
  const migrationClient = postgres(connectionString, {
    max: 1,
    ssl: isNeon ? { rejectUnauthorized: false } : false
  });

  const db = drizzle(migrationClient);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed!");

  await migrationClient.end();
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});