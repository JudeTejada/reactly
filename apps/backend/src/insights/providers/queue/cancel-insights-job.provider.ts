import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CancelInsightsJobProvider {
  constructor(
    @InjectQueue('insights-generate') private readonly insightsQueue: Queue,
  ) {}

  async execute(jobId: string): Promise<void> {
    const job = await this.insightsQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}
