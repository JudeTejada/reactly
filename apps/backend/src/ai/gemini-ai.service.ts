import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import type { SentimentResult, SentimentType } from "@reactly/shared";

@Injectable()
export class GeminiAiService {
  private readonly logger = new Logger(GeminiAiService.name);
  private readonly ai: GoogleGenAI | null;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    this.modelName = "gemini-2.5-flash"; // Use latest stable model

    if (!apiKey) {
      this.logger.warn(
        "GEMINI_API_KEY not configured in environment variables. Using fallback sentiment analysis."
      );
      this.ai = null;
    } else {
      this.ai = new GoogleGenAI({});
      this.logger.log(
        `Gemini AI service initialized successfully with model: ${this.modelName}`
      );
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Fallback immediately if no API key
    if (!this.ai) {
      this.logger.warn("No GEMINI_API_KEY configured, using fallback analysis");
      return this.fallbackSentimentAnalysis(text);
    }

    try {
      const prompt = `Analyze the sentiment of the following feedback text.

Text: "${text}"

Respond with ONLY a valid JSON object in this exact format:
{"sentiment":"positive|negative|neutral","score":0.85}

Rules:
- sentiment must be exactly one of: positive, negative, or neutral
- score must be a number between 0.0 and 1.0 (higher = more confident)
- respond with JSON only, no explanations or markdown
- do not include code blocks or additional text`;

      this.logger.debug(
        `Analyzing sentiment for text: "${text.substring(0, 50)}..."`
      );

      // Use new SDK - models.generateContent
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 150,
        },
      });

      // Extract text from response - handle both response.text and nested structure
      const responseText =
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "";

      this.logger.debug(`Gemini raw response: ${responseText}`);

      // Clean the response - remove markdown code blocks if present
      const cleanText = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Parse the JSON response
      let parsed: { sentiment: string; score: number };
      try {
        parsed = JSON.parse(cleanText);
      } catch (parseError) {
        this.logger.error(
          `Failed to parse Gemini JSON response: ${parseError}`,
          { response: responseText }
        );
        throw new Error("Invalid JSON response from Gemini");
      }

      // Validate the response structure
      const sentiment: SentimentType = parsed.sentiment as SentimentType;
      const score = parsed.score;

      if (!["positive", "negative", "neutral"].includes(sentiment)) {
        throw new Error(`Invalid sentiment value: ${sentiment}`);
      }

      if (typeof score !== "number" || score < 0 || score > 1) {
        throw new Error(`Invalid score value: ${score}`);
      }

      const sentimentResult: SentimentResult = {
        sentiment,
        score,
        confidence: score,
      };

      this.logger.log(
        `Gemini analysis complete: ${sentimentResult.sentiment} (score: ${sentimentResult.score})`
      );

      return sentimentResult;
    } catch (error: any) {
      // Log the error for debugging
      this.logger.error(`Gemini API error: ${error.message}`, error.stack);

      // Check for specific error types
      if (error.message?.includes("API_KEY_INVALID")) {
        this.logger.error(
          "Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable."
        );
      } else if (error.message?.includes("SAFETY")) {
        this.logger.warn(
          "Content blocked by Gemini safety filters, using fallback"
        );
      } else if (error.message?.includes("RATE_LIMIT")) {
        this.logger.warn("Gemini API rate limit exceeded, using fallback");
      } else {
        this.logger.error(
          `Gemini API failed with error: ${error.message}, using fallback`
        );
      }

      // Fallback to rule-based analysis
      return this.fallbackSentimentAnalysis(text);
    }
  }

  private fallbackSentimentAnalysis(text: string): SentimentResult {
    this.logger.debug("Using fallback keyword-based sentiment analysis");

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
      "helpful",
      "easy",
      "intuitive",
      "fast",
      "smooth",
      "recommend",
      "nice",
      "cool",
      "brilliant",
      "superb",
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
      "difficult",
      "hard",
      "slow",
      "confusing",
      "complicated",
      "sucks",
      "stupid",
      "fail",
      "crash",
      "freeze",
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
      score = Math.min(0.6 + positiveCount * 0.08, 0.95);
    } else if (negativeCount > positiveCount) {
      sentiment = "negative";
      score = Math.min(0.6 + negativeCount * 0.08, 0.95);
    }

    this.logger.warn(
      `Fallback analysis: ${sentiment} (score: ${score}) - positive: ${positiveCount}, negative: ${negativeCount}`
    );

    return {
      sentiment,
      score,
      confidence: score * 0.7, // Lower confidence for fallback
    };
  }
}
