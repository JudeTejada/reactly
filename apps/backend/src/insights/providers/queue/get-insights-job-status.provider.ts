import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface JobStatus {
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'not_found';
  progress?: number;
  result?: any;
  error?: string;
  cached?: boolean;
}

@Injectable()
export class GetInsightsJobStatusProvider {
  constructor(
    @InjectQueue('insights-generate') private readonly insightsQueue: Queue,
  ) {}

  async execute(jobId: string): Promise<JobStatus> {
    const job = await this.insightsQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();

    // Simple mapping for now
    let mappedStatus: JobStatus['status'] = 'pending';
    if (state === 'completed') {
      mappedStatus = 'completed';
    } else if (state === 'failed') {
      mappedStatus = 'failed';
    } else if (state === 'active') {
      mappedStatus = 'processing';
    }

    // Get actual progress from BullMQ
    const progress = (job.progress as number) || 0;

    return {
      status: mappedStatus,
      progress,
      result: job.returnvalue,
      error: job.failedReason,
    };
  }
}
