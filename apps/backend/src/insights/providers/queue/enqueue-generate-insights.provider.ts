import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface JobFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

@Injectable()
export class EnqueueGenerateInsightsProvider {
  constructor(
    @InjectQueue('insights-generate') private readonly insightsQueue: Queue,
  ) {}

  async execute(
    clerkUserId: string,
    projectId: string,
    filters?: JobFilters,
  ): Promise<{ id: string; status: string; cached?: boolean }> {
    // Create new job
    const job = await this.insightsQueue.add(
      'generate-insights',
      {
        clerkUserId,
        projectId,
        filters,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    );

    return {
      id: job.id as string,
      status: 'pending',
    };
  }
}
