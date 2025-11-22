import { Injectable, Inject } from '@nestjs/common';
import { insights } from '../../../db/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';

@Injectable()
export class GetExistingInsightsProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    userId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<sc.Insights | null> {
    const conditions = [eq(insights.userId, userId)];

    if (projectId) {
      conditions.push(eq(insights.projectId, projectId));
    } else {
      conditions.push(sql`${insights.projectId} IS NULL`);
    }

    if (startDate || endDate) {
      const filterConditions: any[] = [];
      if (startDate) {
        filterConditions.push(gte(insights.createdAt, startDate));
      }
      if (endDate) {
        filterConditions.push(lte(insights.createdAt, endDate));
      }

      if (filterConditions.length > 0) {
        conditions.push(and(...filterConditions) as any);
      }
    }

    const existing = await this.db
      .select()
      .from(insights)
      .where(and(...conditions))
      .orderBy(desc(insights.createdAt))
      .limit(1);

    return existing[0] || null;
  }
}
