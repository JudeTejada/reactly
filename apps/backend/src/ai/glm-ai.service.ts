import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SentimentResult, SentimentType } from "@reactly/shared";

export interface InsightData {
  summary: string;
  keyThemes: string[];
  recommendations: string[];
  insights: Array<{
    type: "theme" | "recommendation" | "alert" | "trend";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    supportingData?: any;
  }>;
}

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
      const rawResponse =
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
            this.logger.error(
              `Failed to extract JSON from text: ${extractError}`,
              {
                cleanText,
              }
            );
            throw new Error("Invalid JSON response from GLM");
          }
        } else {
          this.logger.error(
            `Failed to parse GLM JSON response: ${parseError}`,
            {
              rawResponse,
              cleanText,
            }
          );
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

  /**
   * Analyze feedback text and extract rating, category, and summary
   */
  async analyzeFeedback(text: string): Promise<{
    rating: number;
    category: string;
    summary: string;
  }> {
    // Fallback immediately if no API key
    if (!this.apiKey) {
      this.logger.warn("No GLM_API_KEY configured, using fallback analysis");
      return this.fallbackFeedbackAnalysis(text);
    }

    try {
      const userPrompt = `Analyze this feedback and respond with ONLY JSON.

Feedback: "${text}"

Format: {"rating":4,"category":"feature","summary":"Brief summary"}
- rating: 1-5 (1=very negative, 5=very positive)
- category: "bug", "feature", "improvement", "complaint", "praise", or "other"
- summary: Brief 1-sentence summary
NO markdown, NO explanations, JSON only`;

      this.logger.debug(
        `Analyzing feedback for text: "${text.substring(0, 50)}..."`
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

      // Extract the response content
      const rawResponse =
        data.choices?.[0]?.message?.content?.trim() ||
        data.choices?.[0]?.message?.reasoning_content?.trim() ||
        "";

      this.logger.debug(`GLM feedback raw response: ${rawResponse}`);

      // Clean the response - remove markdown code blocks if present
      const cleanText = rawResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      this.logger.debug(`GLM feedback cleaned response: ${cleanText}`);

      // Parse the JSON response
      let parsed: { rating: number; category: string; summary: string };
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
            this.logger.error(
              `Failed to extract JSON from text: ${extractError}`,
              {
                cleanText,
              }
            );
            throw new Error("Invalid JSON response from GLM");
          }
        } else {
          this.logger.error(
            `Failed to parse GLM JSON response: ${parseError}`,
            {
              rawResponse,
              cleanText,
            }
          );
          throw new Error("Invalid JSON response from GLM");
        }
      }

      // Validate the response structure
      const rating = Math.max(1, Math.min(5, parsed.rating));
      const validCategories = [
        "bug",
        "feature",
        "improvement",
        "complaint",
        "praise",
        "other",
      ];
      const category = validCategories.includes(parsed.category)
        ? parsed.category
        : "other";
      const summary =
        typeof parsed.summary === "string"
          ? parsed.summary
          : "Feedback analysis complete";

      this.logger.log(
        `GLM feedback analysis complete: rating ${rating}, category ${category}`
      );

      return { rating, category, summary };
    } catch (error: any) {
      this.logger.error(
        `GLM feedback API error: ${error.message}`,
        error.stack
      );
      return this.fallbackFeedbackAnalysis(text);
    }
  }

  private fallbackFeedbackAnalysis(text: string): {
    rating: number;
    category: string;
    summary: string;
  } {
    this.logger.debug("Using fallback feedback analysis");

    const sentimentResult = this.fallbackSentimentAnalysis(text);

    let rating = 3; // neutral default
    if (sentimentResult.sentiment === "positive") {
      rating = 4 + Math.floor(sentimentResult.score * 1); // 4-5
    } else if (sentimentResult.sentiment === "negative") {
      rating = 1 + Math.floor((1 - sentimentResult.score) * 2); // 1-2
    }

    // Simple category detection
    const lowerText = text.toLowerCase();
    let category = "other";

    if (
      lowerText.includes("bug") ||
      lowerText.includes("error") ||
      lowerText.includes("broken")
    ) {
      category = "bug";
    } else if (
      lowerText.includes("feature") ||
      lowerText.includes("add") ||
      lowerText.includes("wish")
    ) {
      category = "feature";
    } else if (
      lowerText.includes("improve") ||
      lowerText.includes("better") ||
      lowerText.includes("enhance")
    ) {
      category = "improvement";
    } else if (
      lowerText.includes("hate") ||
      lowerText.includes("disappointed") ||
      lowerText.includes("complaint")
    ) {
      category = "complaint";
    } else if (
      lowerText.includes("love") ||
      lowerText.includes("great") ||
      lowerText.includes("awesome")
    ) {
      category = "praise";
    }

    return {
      rating,
      category,
      summary: `Feedback analysis: ${sentimentResult.sentiment} sentiment detected`,
    };
  }

  /**
   * Generate insights from feedback data using GLM AI
   */
  async generateInsights(prompt: string): Promise<InsightData> {
    // Fallback immediately if no API key
    if (!this.apiKey) {
      this.logger.warn("No GLM_API_KEY configured, using fallback insights");
      return this.fallbackInsightsGeneration(prompt);
    }

    try {
      this.logger.debug("Generating insights using GLM AI");

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
                "You are a sophisticated AI product analyst. Your task is to analyze user feedback for a software project objectively. The insights you provide should be strictly focused on the project's performance, user sentiment, and actionable product improvements based on the feedback. Do not address the project creator directly or use a conversational tone. Your entire output must be a single, valid JSON object, with no markdown, explanations, or any other text outside the JSON structure.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          stream: false,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM API error (${response.status}): ${errorText}`);
      }

      const data: GlmResponse = await response.json();

      // Extract the response content
      const rawResponse =
        data.choices?.[0]?.message?.content?.trim() ||
        data.choices?.[0]?.message?.reasoning_content?.trim() ||
        "";

      this.logger.debug(`GLM insights raw response: ${rawResponse}`);

      // Clean the response
      const cleanText = rawResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      // Parse the JSON response
      let parsed: InsightData;
      try {
        parsed = JSON.parse(cleanText);
      } catch (parseError) {
        // Try to extract JSON from within text if it failed
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            this.logger.debug("Successfully extracted JSON from text");
          } catch (extractError) {
            this.logger.error(
              `Failed to extract JSON from text: ${extractError}`,
              {
                cleanText,
              }
            );
            throw new Error("Invalid JSON response from GLM");
          }
        } else {
          this.logger.error(
            `Failed to parse GLM JSON response: ${parseError}`,
            {
              rawResponse,
              cleanText,
            }
          );
          throw new Error("Invalid JSON response from GLM");
        }
      }

      // Validate the response structure
      const validatedInsights = this.validateInsightData(parsed);

      this.logger.log("GLM insights generation completed successfully");
      return validatedInsights;
    } catch (error: any) {
      this.logger.error(
        `GLM insights API error: ${error.message}`,
        error.stack
      );

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

      return this.fallbackInsightsGeneration(prompt);
    }
  }

  /**
   * Validate and sanitize insight data structure
   */
  private validateInsightData(data: any): InsightData {
    const validInsights: InsightData = {
      summary:
        typeof data.summary === "string"
          ? data.summary
          : "No summary available",
      keyThemes: Array.isArray(data.keyThemes)
        ? data.keyThemes.filter((t: any) => typeof t === "string")
        : [],
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations.filter((r: any) => typeof r === "string")
        : [],
      insights: Array.isArray(data.insights)
        ? data.insights
            .filter(
              (i: any) =>
                i &&
                typeof i.title === "string" &&
                typeof i.description === "string" &&
                typeof i.type === "string" &&
                typeof i.priority === "string" &&
                ["theme", "recommendation", "alert", "trend"].includes(
                  i.type
                ) &&
                ["high", "medium", "low"].includes(i.priority)
            )
            .map((i: any) => ({
              type: i.type,
              title: i.title,
              description: i.description,
              priority: i.priority,
              supportingData: i.supportingData,
            }))
        : [],
    };

    return validInsights;
  }

  /**
   * Fallback insights generation using rule-based approach
   */
  private fallbackInsightsGeneration(_prompt: string): InsightData {
    this.logger.warn("Using fallback insights generation");

    return {
      summary:
        "Based on the available feedback data, user satisfaction metrics indicate areas for improvement.",
      keyThemes: ["User Experience", "Feature Requests", "Performance Issues"],
      recommendations: [
        "Review negative feedback for common patterns",
        "Improve user onboarding process",
        "Add more customization options",
        "Address performance bottlenecks",
      ],
      insights: [
        {
          type: "alert",
          title: "Analysis Incomplete",
          description:
            "AI analysis was unavailable. Review raw feedback data manually for insights.",
          priority: "medium",
        },
      ],
    };
  }
}
