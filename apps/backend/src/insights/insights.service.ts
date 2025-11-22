import { Inject, Injectable, Logger } from "@nestjs/common";
import { GET_USER_INTERNAL_ID, GET_USER_PROJECTS } from "../user/providers";
import type { Feedback } from "@reactly/shared";
import { GlmAiService } from "../ai/glm-ai.service";
import {
  GET_FEEDBACK_FOR_INSIGHTS,
  SAVE_INSIGHTS,
  GET_EXISTING_INSIGHTS,
} from "./providers/tokens";
import type {
  GetFeedbackForInsightsProvider,
  SaveInsightsProvider,
  GetExistingInsightsProvider,
} from "./providers";

export interface Insight {
  type: "theme" | "recommendation" | "alert" | "trend";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  supportingData?: any;
}

export interface InsightsResult {
  summary: string;
  keyThemes: string[];
  recommendations: string[];
  insights: Insight[];
  statistics: {
    totalFeedback: number;
    averageRating: number;
    positivePercentage: number;
    negativePercentage: number;
  };
  generatedAt: Date;
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @Inject(GET_USER_INTERNAL_ID)
    private readonly getUserInternalId: any,
    @Inject(GET_USER_PROJECTS)
    private readonly getUserProjects: any,
    private readonly glmAiService: GlmAiService,
    @Inject(GET_FEEDBACK_FOR_INSIGHTS)
    private readonly getFeedbackForInsightsProvider: GetFeedbackForInsightsProvider,
    @Inject(SAVE_INSIGHTS)
    private readonly saveInsightsProvider: SaveInsightsProvider,
    @Inject(GET_EXISTING_INSIGHTS)
    private readonly getExistingInsightsProvider: GetExistingInsightsProvider
  ) {}

  async generateInsights(
    clerkUserId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InsightsResult> {
    this.logger.log(`Generating insights for user: ${clerkUserId}`);

    const internalUserId = await this.getUserInternalId.execute(clerkUserId);
    const userProjects = await this.getUserProjects.execute(internalUserId);
    const projectIds = userProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return this.emptyInsights();
    }

    const allFeedback = await this.getFeedbackForInsightsProvider.execute(
      projectIds,
      projectId,
      startDate,
      endDate
    );

    if (allFeedback.length === 0) {
      return this.emptyInsights();
    }

    const typedFeedback = allFeedback as Feedback[];
    const statistics = this.calculateStatistics(typedFeedback);
    const feedbackText = this.formatFeedbackForAnalysis(typedFeedback);

    const aiInsights = await this.generateAIInsights(feedbackText, statistics);

    const result: InsightsResult = {
      summary: aiInsights.summary,
      keyThemes: aiInsights.keyThemes,
      recommendations: aiInsights.recommendations,
      insights: aiInsights.insights,
      statistics,
      generatedAt: new Date(),
    };

    await this.saveInsightsProvider.execute(internalUserId, projectId, result, {
      startDate,
      endDate,
    });

    return result;
  }

  private calculateStatistics(feedback: Feedback[]) {
    const total = feedback.length;
    const validFeedback = feedback.filter(
      (f) => f.rating !== null && f.rating !== undefined
    );
    const averageRating =
      validFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
      validFeedback.length;

    const positive = feedback.filter((f) => f.sentiment === "positive").length;
    const negative = feedback.filter((f) => f.sentiment === "negative").length;

    return {
      totalFeedback: total,
      averageRating,
      positivePercentage: Math.round((positive / total) * 100),
      negativePercentage: Math.round((negative / total) * 100),
    };
  }

  private formatFeedbackForAnalysis(feedback: Feedback[]): string {
    return feedback
      .map((f, idx) => {
        return `Feedback #${idx + 1}:
Rating: ${f.rating}/5
Sentiment: ${f.sentiment}
Category: ${f.category}
Text: "${f.text}"
Date: ${f.createdAt.toISOString()}
---`;
      })
      .join("\n\n");
  }

  private async generateAIInsights(
    feedbackText: string,
    statistics: any
  ): Promise<{
    summary: string;
    keyThemes: string[];
    recommendations: string[];
    insights: Insight[];
  }> {
    const prompt = `You are an expert product analyst. Analyze the following feedback data and provide actionable insights.

FEEDBACK DATA:
${feedbackText}

CURRENT STATISTICS:
- Total Feedback: ${statistics.totalFeedback}
- Average Rating: ${statistics.averageRating.toFixed(2)}/5
- Positive: ${statistics.positivePercentage}%
- Negative: ${statistics.negativePercentage}%

Provide your response in the following JSON format:
{
  "summary": "A 2-3 sentence executive summary of the feedback",
  "keyThemes": ["theme 1", "theme 2", "theme 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "insights": [
    {
      "type": "theme|recommendation|alert|trend",
      "title": "Insight title",
      "description": "Detailed explanation of the insight",
      "priority": "high|medium|low"
    }
  ]
}

Rules:
- Provide 3-5 key themes based on recurring patterns
- Provide 3-5 actionable recommendations
- Include 4-6 specific insights with priorities
- Be specific and actionable, not generic
- Focus on patterns and trends in the data`;

    try {
      // Use GlmAiService to generate insights
      const aiInsights = await this.glmAiService.generateInsights(prompt);

      this.logger.debug(`AI insights generated successfully`);

      return {
        summary: aiInsights.summary,
        keyThemes: aiInsights.keyThemes,
        recommendations: aiInsights.recommendations,
        insights: aiInsights.insights,
      };
    } catch (error) {
      this.logger.error(`AI insights generation failed: ${error}`);
      return this.generateFallbackInsights(statistics);
    }
  }

  private generateFallbackInsights(statistics: any) {
    const insights: Insight[] = [];

    if (statistics.negativePercentage > 30) {
      insights.push({
        type: "alert",
        title: "High Negative Feedback",
        description: `Negative feedback is at ${statistics.negativePercentage}%, which is above the acceptable threshold. Immediate attention required.`,
        priority: "high",
      });
    }

    if (statistics.averageRating < 3) {
      insights.push({
        type: "trend",
        title: "Low Average Rating",
        description: `The average rating of ${statistics.averageRating.toFixed(2)} is below industry standards.`,
        priority: "high",
      });
    }

    return {
      summary: `Based on ${statistics.totalFeedback} feedback entries, the current satisfaction level is ${statistics.positivePercentage}% positive.`,
      keyThemes: ["User Experience", "Feature Requests", "Performance Issues"],
      recommendations: [
        "Review negative feedback for common patterns",
        "Improve user onboarding process",
        "Add more customization options",
      ],
      insights,
    };
  }

  async getExistingInsights(
    clerkUserId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<InsightsResult | null> {
    this.logger.log(`Loading existing insights for user: ${clerkUserId}`);

    const internalUserId = await this.getUserInternalId.execute(clerkUserId);
    const userProjects = await this.getUserProjects.execute(internalUserId);
    const projectIds = userProjects.map((p) => p.id);

    if (projectIds.length === 0) {
      return null;
    }

    const existing = await this.getExistingInsightsProvider.execute(
      internalUserId,
      projectId,
      startDate,
      endDate
    );

    if (!existing) {
      this.logger.log(`No existing insights found for user ${clerkUserId}`);
      return null;
    }

    this.logger.log(`Found existing insights for user ${clerkUserId}`);

    return {
      summary: existing.summary,
      keyThemes: existing.keyThemes as string[],
      recommendations: existing.recommendations as string[],
      insights: existing.insights as any[],
      statistics: existing.statistics as any,
      generatedAt: existing.createdAt,
    };
  }

  async getCachedInsights(
    clerkUserId: string,
    projectId: string,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<InsightsResult | null> {
    try {
      // First try to get from cache (if available)
      // For now, fall back to existing insights method
      // TODO: Implement proper Redis/database caching once infrastructure is ready
      return this.getExistingInsights(
        clerkUserId,
        projectId,
        filters?.startDate,
        filters?.endDate
      );
    } catch (error) {
      this.logger.warn(`Failed to get cached insights: ${error.message}`);
      return null;
    }
  }

  private emptyInsights(): InsightsResult {
    return {
      summary: "No feedback data available for analysis.",
      keyThemes: [],
      recommendations: [],
      insights: [],
      statistics: {
        totalFeedback: 0,
        averageRating: 0,
        positivePercentage: 0,
        negativePercentage: 0,
      },
      generatedAt: new Date(),
    };
  }
}
