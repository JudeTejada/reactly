import { Injectable, Inject, Logger } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';

@Injectable()
export class DeleteFeedbackProvider {
  private readonly logger = new Logger(DeleteFeedbackProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(id: string): Promise<void> {
    await this.db.delete(feedback).where(eq(feedback.id, id));
    this.logger.log(`Feedback deleted: ${id}`);
  }
}
