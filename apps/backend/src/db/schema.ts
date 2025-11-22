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

export const users = pgTable(
  TABLE_NAMES.USERS,
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email").notNull(),
    name: text("name"),
    plan: text("plan").notNull().default("free"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clerkUserIdIdx: index("idx_users_clerk_user_id").on(table.clerkUserId),
    emailIdx: index("idx_users_email").on(table.email),
  })
);

export const projects = pgTable(
  TABLE_NAMES.PROJECTS,
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    hashedApiKey: text("hashed_api_key").notNull(),
    encryptedApiKey: text("encrypted_api_key"), // For secure storage and retrieval
    keyVersion: integer("key_version").notNull().default(1),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]),
    webhookUrl: text("webhook_url"),
    slackWebhookUrl: text("slack_webhook_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_projects_user_id").on(table.userId),
    hashedApiKeyIdx: index("idx_projects_hashed_api_key").on(
      table.hashedApiKey
    ),
  })
);

export const feedback = pgTable(
  TABLE_NAMES.FEEDBACK,
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    rating: integer("rating").notNull().default(0),
    category: text("category").notNull().default("general"),
    sentiment: text("sentiment").notNull().default("pending"),
    sentimentScore: real("sentiment_score").notNull().default(0),
    userName: text("user_name").notNull(),
    userEmail: text("user_email").notNull(),
    processingStatus: text("processing_status").notNull().default("pending"),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("idx_feedback_project_id").on(table.projectId),
    createdAtIdx: index("idx_feedback_created_at").on(table.createdAt),
    projectCreatedIdx: index("idx_feedback_project_created").on(
      table.projectId,
      table.createdAt
    ),
    projectSentimentIdx: index("idx_feedback_project_sentiment").on(
      table.projectId,
      table.sentiment
    ),
    sentimentIdx: index("idx_feedback_sentiment").on(table.sentiment),
    categoryIdx: index("idx_feedback_category").on(table.category),
    processingStatusIdx: index("idx_feedback_processing_status").on(
      table.processingStatus
    ),
    userEmailIdx: index("idx_feedback_user_email").on(table.userEmail),
  })
);

export const insights = pgTable(
  "insights",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    summary: text("summary").notNull(),
    keyThemes: jsonb("key_themes").$type<string[]>().notNull(),
    recommendations: jsonb("recommendations").$type<string[]>().notNull(),
    insights: jsonb("insights").$type<any[]>().notNull(),
    statistics: jsonb("statistics").$type<any>().notNull(),
    filters: jsonb("filters").$type<{
      startDate?: string;
      endDate?: string;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_insights_user_id").on(table.userId),
    projectIdIdx: index("idx_insights_project_id").on(table.projectId),
    userCreatedIdx: index("idx_insights_user_created").on(
      table.userId,
      table.createdAt
    ),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectWithApiKey = Project & {
  apiKey: string;
};

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;

export type Insights = typeof insights.$inferSelect;
export type NewInsights = typeof insights.$inferInsert;

// New tables for queue-based insights processing
export const insightsJobs = pgTable(
  "insights_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending, processing, completed, failed, cancelled
    filters: jsonb("filters").$type<{
      startDate?: string;
      endDate?: string;
      category?: string;
    }>(),
    result: jsonb("result"),
    error: text("error"),
    processingTime: integer("processing_time_ms"),
    aiTokensUsed: integer("ai_tokens_used"),
    progress: integer("progress").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    projectStatusIdx: index("idx_insights_jobs_project_status").on(
      table.projectId,
      table.status
    ),
    userCreatedIdx: index("idx_insights_jobs_user_created").on(
      table.userId,
      table.createdAt
    ),
  })
);

export const insightsCache = pgTable(
  "insights_cache",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cacheKey: text("cache_key").notNull(),
    result: jsonb("result").notNull(),
    filters: jsonb("filters").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    accessCount: integer("access_count").default(0),
  },
  (table) => ({
    projectIdx: index("idx_insights_cache_project").on(table.projectId),
    cacheKeyIdx: index("idx_insights_cache_key").on(table.cacheKey),
  })
);

export type InsightsJob = typeof insightsJobs.$inferSelect;
export type NewInsightsJob = typeof insightsJobs.$inferInsert;

export type InsightsCacheEntry = typeof insightsCache.$inferSelect;
export type NewInsightsCacheEntry = typeof insightsCache.$inferInsert;
