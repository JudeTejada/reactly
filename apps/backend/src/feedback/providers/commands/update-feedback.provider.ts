import { Injectable, Inject, Logger } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';

@Injectable()
export class UpdateFeedbackProvider {
  private readonly logger = new Logger(UpdateFeedbackProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    id: string,
    data: Partial<typeof feedback.$inferInsert>,
  ): Promise<void> {
    await this.db
      .update(feedback)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(feedback.id, id));

    this.logger.log(`Feedback updated: ${id}`);
  }
}
