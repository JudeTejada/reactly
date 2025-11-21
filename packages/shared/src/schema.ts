// Database schema types - will be used by Drizzle ORM

export const TABLE_NAMES = {
  USERS: "users",
  PROJECTS: "projects",
  FEEDBACK: "feedback",
  INSIGHTS: "insights",
} as const;

// Schema will be defined in the backend using Drizzle
