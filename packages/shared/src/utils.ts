import type { SentimentType } from "./types.js";

export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case "positive":
      return "green";
    case "negative":
      return "red";
    case "neutral":
      return "gray";
    default:
      return "gray";
  }
}

export function getSentimentEmoji(sentiment: SentimentType): string {
  switch (sentiment) {
    case "positive":
      return "😊";
    case "negative":
      return "😞";
    case "neutral":
      return "😐";
    default:
      return "😐";
  }
}

export function formatRating(rating: number): string {
  return "⭐".repeat(rating);
}

export function generateApiKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "rly_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
