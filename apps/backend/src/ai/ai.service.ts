import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import type { SentimentResult, SentimentType } from "@reactly/shared";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analysis assistant. Analyze the sentiment of user feedback and respond with a JSON object containing: sentiment (positive, negative, or neutral) and score (0-1 representing confidence). Only respond with valid JSON.",
          },
          {
            role: "user",
            content: `Analyze the sentiment of this feedback: "${text}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      const parsed = JSON.parse(response);
      const sentiment: SentimentType = parsed.sentiment || "neutral";
      const score = parsed.score || 0.5;

      this.logger.log(`Analyzed sentiment: ${sentiment} (score: ${score})`);

      return {
        sentiment,
        score,
        confidence: score,
      };
    } catch (error) {
      this.logger.error("Failed to analyze sentiment with OpenAI", error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  private fallbackSentimentAnalysis(text: string): SentimentResult {
    const lowerText = text.toLowerCase();

    const positiveWords = [
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
