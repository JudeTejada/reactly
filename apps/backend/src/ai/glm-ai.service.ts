import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SentimentResult, SentimentType } from "@reactly/shared";

interface GlmChoice {
  message: {
    role: string;
    content: string;
    reasoning_content?: string;
  };
  finish_reason: string;
}

interface GlmResponse {
  id: string;
  model: string;
  choices: GlmChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class GlmAiService {
  private readonly logger = new Logger(GlmAiService.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = "https://api.z.ai/api";
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>("GLM_API_KEY");
    this.modelName = "glm-4.5-flash"; // Use latest stable model

    if (!this.apiKey) {
      this.logger.warn(
        "GLM_API_KEY not configured in environment variables. Using fallback sentiment analysis."
      );
    } else {
      this.logger.log(
        `GLM AI service initialized successfully with model: ${this.modelName}`
      );
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Fallback immediately if no API key
    if (!this.apiKey) {
      this.logger.warn("No GLM_API_KEY configured, using fallback analysis");
      return this.fallbackSentimentAnalysis(text);
    }

    try {
      const userPrompt = `Analyze sentiment and respond with ONLY JSON.

Text: "${text}"

Format: {"sentiment":"positive","score":0.95}
- sentiment: "positive", "negative", or "neutral"
- score: 0.0-1.0
NO markdown, NO explanations, JSON only`;

      this.logger.debug(
        `Analyzing sentiment for text: "${text.substring(0, 50)}..."`
      );

      const response = await fetch(`${this.baseUrl}/paas/v4/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: "system",
              content:
                "You must respond with valid JSON only. No markdown, no explanations, no text before or after the JSON.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
          stream: false,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM API error (${response.status}): ${errorText}`);
      }

      const data: GlmResponse = await response.json();

      // Extract the response content - GLM may return JSON in reasoning_content when thinking is enabled
      let rawResponse =
        data.choices?.[0]?.message?.content?.trim() ||
        data.choices?.[0]?.message?.reasoning_content?.trim() ||
        "";

      this.logger.debug(`GLM raw response: ${rawResponse}`);

      // Clean the response - remove markdown code blocks if present
      const cleanText = rawResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      this.logger.debug(`GLM cleaned response: ${cleanText}`);

      // Parse the JSON response
      let parsed: { sentiment: string; score: number };
      try {
        parsed = JSON.parse(cleanText);
      } catch (parseError) {
        // Try to extract JSON from within text if it failed
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            this.logger.debug(`Successfully extracted JSON from text`);
          } catch (extractError) {
            this.logger.error(`Failed to extract JSON from text: ${extractError}`, {
              cleanText,
            });
            throw new Error("Invalid JSON response from GLM");
          }
        } else {
          this.logger.error(`Failed to parse GLM JSON response: ${parseError}`, {
            rawResponse,
            cleanText,
          });
          throw new Error("Invalid JSON response from GLM");
        }
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
        `GLM analysis complete: ${sentimentResult.sentiment} (score: ${sentimentResult.score})`
      );

      return sentimentResult;
    } catch (error: any) {
      // Log the error for debugging
      this.logger.error(`GLM API error: ${error.message}`, error.stack);

      // Check for specific error types
      if (
        error.message?.includes("401") ||
        error.message?.includes("API_KEY_INVALID")
      ) {
        this.logger.error(
          "Invalid GLM API key. Please check your GLM_API_KEY environment variable."
        );
      } else if (
        error.message?.includes("RATE_LIMIT") ||
        error.message?.includes("429")
      ) {
        this.logger.warn("GLM API rate limit exceeded, using fallback");
      } else if (error.message?.includes("SAFETY")) {
        this.logger.warn(
          "Content blocked by GLM safety filters, using fallback"
        );
      } else {
        this.logger.error(
          `GLM API failed with error: ${error.message}, using fallback`
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
