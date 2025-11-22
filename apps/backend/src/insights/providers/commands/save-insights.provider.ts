import { Injectable, Inject, Logger } from '@nestjs/common';
import { insights } from '../../../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';
import { InsightsResult } from '../../insights.service';
import { NewInsights } from '../../../db/schema';

@Injectable()
export class SaveInsightsProvider {
  private readonly logger = new Logger(SaveInsightsProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    userId: string,
    projectId: string | undefined,
    insightsData: InsightsResult,
    filters: { startDate?: Date; endDate?: Date },
  ): Promise<void> {
    try {
      const newInsight: NewInsights = {
        userId,
        projectId: projectId || null,
        summary: insightsData.summary,
        keyThemes: insightsData.keyThemes,
        recommendations: insightsData.recommendations,
        insights: insightsData.insights,
        statistics: insightsData.statistics,
        filters: {
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
        },
      };

      await this.db.insert(insights).values(newInsight);
      this.logger.log(`Saved insights for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to save insights: ${error}`);
      throw error;
    }
  }
}
