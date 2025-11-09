import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import type { SentimentResult, SentimentType } from "@reactly/shared";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly glmApiKey: string;
  private readonly glmBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // GLM 4.6 configuration
    this.glmApiKey = this.configService.get<string>("GLM_API_KEY") || "";
    // Default to AI/ML API, can be overridden with GLM_BASE_URL
    this.glmBaseUrl =
      this.configService.get<string>("GLM_BASE_URL") ||
      "https://api.aimlapi.com/v1";
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Try GLM 4.6 if API key is configured
    if (this.glmApiKey) {
      try {
        const result = await this.analyzeWithGLM(text);
        this.logger.log(
          `Analyzed sentiment with GLM 4.6: ${result.sentiment} (score: ${result.score})`
        );
        return result;
      } catch (error: any) {
        if (error.response?.status === 429) {
          this.logger.error(
            "GLM API has insufficient balance, using fallback",
            error.response?.data?.error?.message || error.message
          );
        } else {
          this.logger.error(
            "Failed to analyze sentiment with GLM 4.6, using fallback",
            error
          );
        }
      }
    }

    // Fallback to rule-based analysis if GLM is not available
    this.logger.warn(
      "GLM 4.6 API key not configured or API failed, using fallback sentiment analysis"
    );
    return this.fallbackSentimentAnalysis(text);
  }

  private async analyzeWithGLM(text: string): Promise<SentimentResult> {
    const prompt = `Sentiment analysis: "${text}"

Respond with valid JSON object:
{"sentiment":"positive|negative|neutral","score":0.8}

Rules:
- sentiment must be one of: positive, negative, neutral
- score must be between 0.0 and 1.0
- respond with JSON only, no explanation`;

    // Check if the base URL already includes the endpoint
    const endpoint = this.glmBaseUrl.includes("/chat/completions")
      ? this.glmBaseUrl
      : `${this.glmBaseUrl}/chat/completions`;
    this.logger.log(`GLM API endpoint: ${endpoint}`);

    const response = await axios.post(
      endpoint,
      {
        model: "glm-4.6", // GLM-4.6-Flash model
        messages: [
          {
            role: "system",
            content:
              "You are a sentiment analysis expert. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${this.glmApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 second timeout
      }
    );

    // Log the response structure for debugging
    this.logger.log("GLM API response status:", response.status);
    this.logger.log(
      "GLM API response data keys:",
      Object.keys(response.data || {})
    );

    // Extract the response text safely
    let responseText = response.data?.choices?.[0]?.message?.content || "";

    // If content is empty, try reasoning_content (GLM sometimes puts the response here)
    if (!responseText || responseText.trim() === "") {
      responseText =
        response.data?.choices?.[0]?.message?.reasoning_content || "";
    }

    if (!responseText || responseText.trim() === "") {
      this.logger.error("GLM response content is empty", {
        responseData: response.data,
      });
      throw new Error("Empty GLM response");
    }

    this.logger.log(
      `GLM raw response text: ${responseText.substring(0, 200)}...`
    );

    // Try to extract JSON from the reasoning content first
    let jsonStr = responseText;

    // Look for JSON pattern in the text
    const jsonMatch = responseText.match(
      /\{[\s\S]*"sentiment"\s*:\s*"[^"]+"[\s\S]*"score"\s*:\s*[0-9.]+[\s\S]*\}/
    );
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Clean up the response (remove markdown code blocks if present)
    const cleanResponse = jsonStr
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanResponse);
    } catch (parseError) {
      // If JSON parsing fails, try to extract sentiment from reasoning
      this.logger.log(
        "JSON parsing failed, attempting to extract sentiment from reasoning"
      );

      const lowerText = responseText.toLowerCase();
      let sentiment: SentimentType = "neutral";
      let score = 0.5;

      // Look for sentiment keywords in the reasoning
      // Check for context of the original text in the reasoning, not just the word "negative"
      const hasNegativeContext =
        lowerText.includes("terrible") ||
        lowerText.includes("disappointed") ||
        lowerText.includes("doesn't work") ||
        (lowerText.includes("negative") &&
          (lowerText.includes("terrible") ||
            lowerText.includes("disappointed")));

      const hasPositiveContext =
        lowerText.includes("love") ||
        lowerText.includes("amazing") ||
        lowerText.includes("excellent") ||
        (lowerText.includes("positive") &&
          (lowerText.includes("love") || lowerText.includes("amazing")));

      const hasNeutralContext =
        lowerText.includes("neutral") ||
        lowerText.includes("okay") ||
        lowerText.includes("nothing special") ||
        (lowerText.includes("neutral") &&
          (lowerText.includes("okay") ||
            lowerText.includes("nothing special")));

      if (hasNegativeContext) {
        sentiment = "negative";
        score = Math.min(
          0.7 +
            (lowerText.match(/\b(terrible|disappointed|doesn't work)\b/g) || [])
              .length *
              0.1,
          0.95
        );
      } else if (hasPositiveContext) {
        sentiment = "positive";
        score = Math.min(
          0.7 +
            (lowerText.match(/\b(love|amazing|excellent)\b/g) || []).length *
              0.1,
          0.95
        );
      } else if (hasNeutralContext) {
        sentiment = "neutral";
        score = 0.5;
      } else {
        // Default fallback - analyze the reasoning more carefully
        // Look for explicit sentiment statements that include the reasoning
        if (
          lowerText.includes("clearly negative") ||
          (lowerText.includes("negative") &&
            (lowerText.includes("terrible") ||
              lowerText.includes("disappointed") ||
              lowerText.includes("don't like") ||
              lowerText.includes("hate") ||
              lowerText.includes("awful") ||
              lowerText.includes("doesn't work")))
        ) {
          sentiment = "negative";
          score = 0.85;
        } else if (
          lowerText.includes("clearly positive") ||
          (lowerText.includes("positive") &&
            (lowerText.includes("love") ||
              lowerText.includes("amazing") ||
              lowerText.includes("excellent") ||
              lowerText.includes("great")))
        ) {
          sentiment = "positive";
          score = 0.85;
        } else if (
          lowerText.includes("clearly neutral") ||
          (lowerText.includes("neutral") &&
            (lowerText.includes("okay") ||
              lowerText.includes("nothing special") ||
              lowerText.includes("does what it's supposed to")))
        ) {
          sentiment = "neutral";
          score = 0.5;
        } else {
          sentiment = "neutral";
          score = 0.5;
        }
      }

      return {
        sentiment,
        score,
        confidence: 0.6, // Lower confidence for extracted results
      };
    }

    const sentiment: SentimentType = parsed.sentiment || "neutral";
    const score = parsed.score || 0.5;

    return {
      sentiment,
      score,
      confidence: score,
    };
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
