import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SentimentResult, SentimentType } from "@reactly/shared";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!this.model) {
      this.logger.warn("Gemini API key not configured, using fallback");
      return this.fallbackSentimentAnalysis(text);
    }

    try {
      const prompt = `Analyze the sentiment of this user feedback and respond with ONLY a JSON object (no markdown, no extra text) containing: sentiment (must be exactly "positive", "negative", or "neutral") and score (a number between 0 and 1 representing confidence).

Feedback: "${text}"

Response format: {"sentiment": "positive|negative|neutral", "score": 0.8}`;

      const result = await this.model.generateContent(prompt);
      console.log("🚀 ~ AiService ~ analyzeSentiment ~ result:", result)
      const response = await result.response;
      const responseText = response.text();

      // Clean up the response (remove markdown code blocks if present)
      const cleanResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleanResponse);
      const sentiment: SentimentType = parsed.sentiment || "neutral";
      const score = parsed.score || 0.5;

      this.logger.log(`Analyzed sentiment with Gemini: ${sentiment} (score: ${score})`);

      return {
        sentiment,
        score,
        confidence: score,
      };
    } catch (error) {
      this.logger.error("Failed to analyze sentiment with Gemini", error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  private fallbackSentimentAnalysis(text: string): SentimentResult {
    const lowerText = text.toLowerCase();

    const x  = [
      "good",
      "great",
      "excellent",
      "amazing",
      "love",
      "wonderful",
      "fantastic",
      "awesome",
      "perfect",
      "best",
      "happy",
      "pleased",
      "satisfied",
    ];

    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "worst",
      "horrible",
      "disappointed",
      "frustrating",
      "annoying",
      "useless",
      "broken",
      "bug",
      "issue",
      "problem",
      "error",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) negativeCount++;
    });

    let sentiment: SentimentType = "neutral";
    let score = 0.5;

    if (positiveCount > negativeCount) {
      sentiment = "positive";
      score = Math.min(0.6 + positiveCount * 0.1, 0.9);
    } else if (negativeCount > positiveCount) {
      sentiment = "negative";
      score = Math.min(0.6 + negativeCount * 0.1, 0.9);
    }

    this.logger.warn("Using fallback sentiment analysis");

    return {
      sentiment,
      score,
      confidence: score * 0.7, // Lower confidence for fallback
    };
  }
}
