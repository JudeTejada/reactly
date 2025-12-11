import { Injectable, Inject, Logger } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';
import type { Feedback } from '@reactly/shared';

// Limit feedback to prevent massive prompts and slow queries
const MAX_FEEDBACK_FOR_INSIGHTS = 100;

@Injectable()
export class GetFeedbackForInsightsProvider {
  private readonly logger = new Logger(GetFeedbackForInsightsProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    projectIds: string[],
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = MAX_FEEDBACK_FOR_INSIGHTS,
  ): Promise<Feedback[]> {
    const startTime = Date.now();
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

    // Limit to most recent feedback and cap at MAX_FEEDBACK_FOR_INSIGHTS
    const effectiveLimit = Math.min(limit, MAX_FEEDBACK_FOR_INSIGHTS);

    const allFeedback = await this.db
      .select()
      .from(feedback)
      .where(whereClause)
      .orderBy(desc(feedback.createdAt))
      .limit(effectiveLimit);

    this.logger.log(
      `[PERF] getFeedback: ${Date.now() - startTime}ms (${allFeedback.length} records, limit: ${effectiveLimit})`,
    );

    return allFeedback as Feedback[];
  }
}
