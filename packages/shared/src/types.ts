import { z } from "zod";

// Sentiment types
export type SentimentType = "positive" | "negative" | "neutral";

export interface SentimentResult {
  sentiment: SentimentType;
  score: number;
  confidence: number;
}

// Feedback schemas
export const feedbackCategorySchema = z.enum([
  "bug",
  "feature",
  "improvement",
  "complaint",
  "praise",
  "other",
]);

export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;

// Updated submit schema - for widget feedback with text, name, email (AI handles category/rating)
export const submitFeedbackSchema = z.object({
  text: z.string().min(1).max(5000),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  metadata: z.record(z.any()).optional(),
});

export type SubmitFeedbackDto = z.infer<typeof submitFeedbackSchema>;

// Interface for comprehensive AI feedback analysis
export interface FeedbackAnalysis {
  sentiment: SentimentType;
  sentimentScore: number;
  category: FeedbackCategory;
  rating: number; // 1-5
  markdownSummary: string;
}

// Updated Feedback interface - includes user info, rating/category from AI
export interface Feedback {
  id: string;
  projectId: string;
  text: string;
  rating: number; // AI generated
  category: FeedbackCategory; // AI generated
  sentiment: SentimentType;
  sentimentScore: number;
  userName: string; // From widget submission
  userEmail: string; // From widget submission
  metadata?: Record<string, any>;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

// Project schemas
export interface Project {
  id: string;
  name: string;
  apiKey: string;
  userId: string;
  allowedDomains: string[];
  webhookUrl?: string;
  slackWebhookUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  allowedDomains: z.array(z.string()).optional().default([]),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  slackWebhookUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;

// User schemas
export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface SentimentDistribution {
  positive: number;
  negative: number;
  neutral: number;
}

export interface FeedbackStats {
  total: number;
  averageRating: number;
  sentimentDistribution: SentimentDistribution;
  categoryBreakdown: Record<FeedbackCategory, number>;
}

export interface AnalyticsQuery {
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: FeedbackCategory;
  sentiment?: SentimentType;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Widget configuration
export interface WidgetConfig {
  projectId: string;
  apiKey: string;
  apiUrl?: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  labels?: {
    title?: string;
    placeholder?: string;
    submitButton?: string;
    thankYouMessage?: string;
  };
}
