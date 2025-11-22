export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const SENTIMENT_COLORS = {
  positive: "text-green-600 bg-green-50 border-green-200",
  negative: "text-red-600 bg-red-50 border-red-200",
  neutral: "text-gray-600 bg-gray-50 border-gray-200",
} as const;

export const SENTIMENT_EMOJIS = {
  positive: "😊",
  negative: "😞",
  neutral: "😐",
} as const;

export const CATEGORY_LABELS = {
  bug: "Bug Report",
  feature: "Feature Request",
  improvement: "Improvement",
  complaint: "Complaint",
  praise: "Praise",
  other: "Other",
} as const;

export const CATEGORY_COLORS = {
  bug: "bg-red-100 text-red-800",
  feature: "bg-blue-100 text-blue-800",
  improvement: "bg-purple-100 text-purple-800",
  complaint: "bg-orange-100 text-orange-800",
  praise: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-800",
} as const;

export const PLAN_LIMITS = {
  free: {
    projects: 1,
    feedback: 100,
    features: ["Basic analytics", "Email support"],
  },
  pro: {
    projects: 10,
    feedback: 10000,
    features: [
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Discord webhooks",
    ],
  },
  enterprise: {
    projects: -1, // unlimited
    feedback: -1, // unlimited
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SLA",
    ],
  },
} as const;
