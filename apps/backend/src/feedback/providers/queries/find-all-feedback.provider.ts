import { Injectable, Inject } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { eq, and, desc, ilike, gte, lte, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';
import { PaginatedResponse } from '@reactly/shared';
import type { Feedback } from '../../../db/schema';

export interface FindAllFeedbackOptions {
  projectId?: string;
  sentiment?: string;
  category?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class FindAllFeedbackProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    projectIds: string[],
    options: FindAllFeedbackOptions,
  ): Promise<PaginatedResponse<Feedback>> {
    const page = options.page || 1;
    const pageSize = Math.min(options.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    if (projectIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
      };
    }

    const conditions = [sql`${feedback.projectId} IN ${projectIds}`];

    if (options.projectId) {
      conditions.push(eq(feedback.projectId, options.projectId));
    }

    if (options.sentiment) {
      conditions.push(eq(feedback.sentiment, options.sentiment));
    }

    if (options.category) {
      conditions.push(eq(feedback.category, options.category));
    }

    if (options.search) {
      conditions.push(ilike(feedback.text, `%${options.search}%`));
    }

    if (options.startDate) {
      conditions.push(gte(feedback.createdAt, options.startDate));
    }

    if (options.endDate) {
      conditions.push(lte(feedback.createdAt, options.endDate));
    }

    const whereClause = and(...conditions);

    const [items, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(feedback)
        .where(whereClause)
        .orderBy(desc(feedback.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(feedback)
        .where(whereClause),
    ]);

    return {
      items,
      total: count,
      page,
      pageSize,
      hasMore: offset + items.length < count,
    };
  }
}
