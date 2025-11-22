import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ConfigService } from "@nestjs/config";

const runMigrations = async () => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const configService = app.get(ConfigService);
  const connectionString = configService.get<string>("DATABASE_URL");

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not defined. Please check your configuration."
    );
  }

  console.log("Connecting to database...");

  // Check if using Neon (contains .neon.tech) or local PostgreSQL
  const isNeon = connectionString.includes(".neon.tech");
  console.log(`Detected ${isNeon ? "Neon" : "local PostgreSQL"} database`);

  // For both Neon and local PostgreSQL, use postgres-js driver
  // It works for both connection types
  const migrationClient = postgres(connectionString, {
    max: 1,
    // Add SSL for Neon connections
    ssl: isNeon ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(migrationClient);

  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed!");

  await migrationClient.end();
  await app.close();
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
