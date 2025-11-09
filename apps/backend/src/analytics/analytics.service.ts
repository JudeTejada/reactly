import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { feedback, projects } from "../db/schema";
import { UserService } from "../user/user.service";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import type {
  FeedbackStats,
  SentimentDistribution,
  FeedbackCategory,
} from "@reactly/shared";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "src/db/providers/drizzle.provider";

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
    private readonly userService: UserService
  ) {}
  private readonly logger = new Logger(AnalyticsService.name);

  async getOverview(
    clerkUserId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<FeedbackStats> {
    // Use centralized service to get user's project IDs
    const projectIds = await this.userService.getUserProjectIds(clerkUserId);

    if (projectIds.length === 0) {
      return this.emptyStats();
    }

    const conditions = [sql`${feedback.projectId} IN ${projectIds}`];

    if (projectId) {
      conditions.push(eq(feedback.projectId, projectId));
    }

    if (startDate) {
      conditions.push(gte(feedback.createdAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(feedback.createdAt, endDate));
    }

    const whereClause = and(...conditions);

    const allFeedback = await this.db.select().from(feedback).where(whereClause);

    if (allFeedback.length === 0) {
      return this.emptyStats();
    }

    const sentimentDist: SentimentDistribution = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const categoryBreakdown: Record<FeedbackCategory, number> = {
      bug: 0,
      feature: 0,
      improvement: 0,
      complaint: 0,
      praise: 0,
      other: 0,
    };

    let totalRating = 0;

    allFeedback.forEach((item) => {
      if (item.sentiment === "positive") sentimentDist.positive++;
      else if (item.sentiment === "negative") sentimentDist.negative++;
      else sentimentDist.neutral++;

      categoryBreakdown[item.category as FeedbackCategory]++;
      totalRating += item.rating;
    });

    return {
      total: allFeedback.length,
      averageRating: totalRating / allFeedback.length,
      sentimentDistribution: sentimentDist,
      categoryBreakdown,
    };
  }

  async getTrends(
    clerkUserId: string,
    projectId?: string,
    days: number = 30
  ): Promise<
    {
      date: string;
      positive: number;
      negative: number;
      neutral: number;
      total: number;
    }[]
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Use centralized service to get user's project IDs
    const projectIds = await this.userService.getUserProjectIds(clerkUserId);

    if (projectIds.length === 0) {
      return [];
    }

    const conditions = [
      sql`${feedback.projectId} IN ${projectIds}`,
      gte(feedback.createdAt, startDate),
    ];

    if (projectId) {
      conditions.push(eq(feedback.projectId, projectId));
    }

    const allFeedback = await this.db
      .select()
      .from(feedback)
      .where(and(...conditions))
      .orderBy(feedback.createdAt);

    const trendsMap = new Map<
      string,
      { positive: number; negative: number; neutral: number; total: number }
    >();

    allFeedback.forEach((item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      const existing = trendsMap.get(date) || {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
      };

      if (item.sentiment === "positive") existing.positive++;
      else if (item.sentiment === "negative") existing.negative++;
      else existing.neutral++;

      existing.total++;
      trendsMap.set(date, existing);
    });

    const result: {
      date: string;
      positive: number;
      negative: number;
      neutral: number;
      total: number;
    }[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split("T")[0];

      const data = trendsMap.get(dateStr) || {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
      };

      result.push({
        date: dateStr,
        ...data,
      });
    }

    return result;
  }

  async getRecentFeedback(
    clerkUserId: string,
    projectId?: string,
    limit: number = 10
  ) {
    // Use centralized service to get user's project IDs
    const projectIds = await this.userService.getUserProjectIds(clerkUserId);

    if (projectIds.length === 0) {
      return [];
    }

    const conditions = [sql`${feedback.projectId} IN ${projectIds}`];

    if (projectId) {
      conditions.push(eq(feedback.projectId, projectId));
    }

    return this.db
      .select()
      .from(feedback)
      .where(and(...conditions))
      .orderBy(sql`${feedback.createdAt} DESC`)
      .limit(limit);
  }

  private emptyStats(): FeedbackStats {
    return {
      total: 0,
      averageRating: 0,
      sentimentDistribution: {
        positive: 0,
        negative: 0,
        neutral: 0,
      },
      categoryBreakdown: {
        bug: 0,
        feature: 0,
        improvement: 0,
        complaint: 0,
        praise: 0,
        other: 0,
      },
    };
  }
}
