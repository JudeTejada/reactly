import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  boolean,
  real,
  index,
} from "drizzle-orm/pg-core";
import { TABLE_NAMES } from "@reactly/shared";

export const users = pgTable(TABLE_NAMES.USERS, {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  clerkUserIdIdx: index("idx_users_clerk_user_id").on(table.clerkUserId),
  emailIdx: index("idx_users_email").on(table.email),
}));

export const projects = pgTable(TABLE_NAMES.PROJECTS, {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull().unique(),
  hashedApiKey: text("hashed_api_key").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

}, (table) => ({
  userIdIdx: index("idx_projects_user_id").on(table.userId),
  apiKeyIdx: index("idx_projects_api_key").on(table.apiKey),
  hashedApiKeyIdx: index("idx_projects_hashed_api_key").on(table.hashedApiKey),
}));

export const feedback = pgTable(TABLE_NAMES.FEEDBACK, {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
  category: text("category").notNull(),
  sentiment: text("sentiment").notNull(),
  sentimentScore: real("sentiment_score").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("idx_feedback_project_id").on(table.projectId),
  createdAtIdx: index("idx_feedback_created_at").on(table.createdAt),
  projectCreatedIdx: index("idx_feedback_project_created").on(table.projectId, table.createdAt),
  projectSentimentIdx: index("idx_feedback_project_sentiment").on(table.projectId, table.sentiment),
  sentimentIdx: index("idx_feedback_sentiment").on(table.sentiment),
  categoryIdx: index("idx_feedback_category").on(table.category),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
