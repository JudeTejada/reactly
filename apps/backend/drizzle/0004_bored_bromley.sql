CREATE TABLE IF NOT EXISTS "insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"summary" text NOT NULL,
	"key_themes" jsonb NOT NULL,
	"recommendations" jsonb NOT NULL,
	"insights" jsonb NOT NULL,
	"statistics" jsonb NOT NULL,
	"filters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insights_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"cache_key" text NOT NULL,
	"result" jsonb NOT NULL,
	"filters" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"access_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "insights_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
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
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_api_key_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_projects_api_key";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "encrypted_api_key" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "key_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights" ADD CONSTRAINT "insights_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights_cache" ADD CONSTRAINT "insights_cache_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights_cache" ADD CONSTRAINT "insights_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights_jobs" ADD CONSTRAINT "insights_jobs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "insights_jobs" ADD CONSTRAINT "insights_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_user_id" ON "insights" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_project_id" ON "insights" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_user_created" ON "insights" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_cache_project" ON "insights_cache" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_cache_key" ON "insights_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_jobs_project_status" ON "insights_jobs" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_insights_jobs_user_created" ON "insights_jobs" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "api_key";