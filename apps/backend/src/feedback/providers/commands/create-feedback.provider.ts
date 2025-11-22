import { Injectable, Inject, Logger } from '@nestjs/common';
import { feedback } from '../../../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';
import { SubmitFeedbackDto } from '@reactly/shared';
import type { Feedback } from '../../../db/schema';

@Injectable()
export class CreateFeedbackProvider {
  private readonly logger = new Logger(CreateFeedbackProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>,
  ) {}

  async execute(
    projectId: string,
    dto: SubmitFeedbackDto,
    metadata?: Record<string, any>,
  ): Promise<Feedback> {
    const [newFeedback] = await this.db
      .insert(feedback)
      .values({
        projectId,
        text: dto.text,
        userName: dto.name,
        userEmail: dto.email,
        rating: 0, // Will be set by AI processing
        category: 'general', // Will be set by AI processing
        sentiment: 'pending', // Will be set by AI processing
        sentimentScore: 0, // Will be set by AI processing
        processingStatus: 'pending',
        metadata: metadata || dto.metadata,
      })
      .returning();

    this.logger.log(`Feedback created in DB: ${newFeedback.id}`);
    return newFeedback;
  }
}
