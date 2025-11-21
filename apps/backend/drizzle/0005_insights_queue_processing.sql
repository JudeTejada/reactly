-- Create insights_jobs table for queue-based processing
CREATE TABLE IF NOT EXISTS "insights_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	"status" text NOT NULL DEFAULT 'pending',
	"filters" jsonb,
	"result" jsonb,
	"error" text,
	"processing_time_ms" integer,
	"ai_tokens_used" integer,
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
-- Create indexes for insights_jobs
CREATE INDEX IF NOT EXISTS "idx_insights_jobs_project_status" ON "insights_jobs" USING btree ("project_id","status");
CREATE INDEX IF NOT EXISTS "idx_insights_jobs_user_created" ON "insights_jobs" USING btree ("user_id","created_at");

-- Create insights_cache table for caching results
CREATE TABLE IF NOT EXISTS "insights_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
	"cache_key" text NOT NULL,
	"result" jsonb NOT NULL,
	"filters" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"access_count" integer DEFAULT 0
);
-- Create indexes for insights_cache
CREATE INDEX IF NOT EXISTS "idx_insights_cache_project" ON "insights_cache" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "idx_insights_cache_key" ON "insights_cache" USING btree ("cache_key");