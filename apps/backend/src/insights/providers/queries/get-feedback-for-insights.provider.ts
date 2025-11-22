import { Injectable, Inject } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';
import type { Feedback } from '@reactly/shared';

@Injectable()
export class GetFeedbackForInsightsProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    projectIds: string[],
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Feedback[]> {
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

    const allFeedback = await this.db
      .select()
      .from(feedback)
      .where(whereClause);

    return allFeedback as Feedback[];
  }
}
