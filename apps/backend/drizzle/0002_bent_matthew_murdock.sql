ALTER TABLE "projects" ADD COLUMN "hashed_api_key" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_hashed_api_key" ON "projects" USING btree ("hashed_api_key");