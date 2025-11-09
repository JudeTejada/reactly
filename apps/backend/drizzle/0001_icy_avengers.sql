CREATE INDEX IF NOT EXISTS "idx_feedback_project_id" ON "feedback" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_created_at" ON "feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_project_created" ON "feedback" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_project_sentiment" ON "feedback" USING btree ("project_id","sentiment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_sentiment" ON "feedback" USING btree ("sentiment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_category" ON "feedback" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_user_id" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_api_key" ON "projects" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_clerk_user_id" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");