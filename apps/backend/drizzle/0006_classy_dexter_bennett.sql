ALTER TABLE "feedback" ALTER COLUMN "rating" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "category" SET DEFAULT 'general';--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "sentiment" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "sentiment_score" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "user_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "user_email" text NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_processing_status" ON "feedback" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_user_email" ON "feedback" USING btree ("user_email");