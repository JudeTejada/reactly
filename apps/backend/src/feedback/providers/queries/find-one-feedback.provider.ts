import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';
import type { Feedback } from '../../../db/schema';

@Injectable()
export class FindOneFeedbackProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(id: string): Promise<Feedback> {
    const [item] = await this.db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id))
      .limit(1);

    if (!item) {
      throw new NotFoundException('Feedback not found');
    }

    return item;
  }
}
