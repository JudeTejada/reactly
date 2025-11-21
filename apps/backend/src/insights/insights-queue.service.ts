import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import * as crypto from "crypto";

export interface JobFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

export interface GenerateInsightsJob {
  jobId: string;
  projectId: string;
  userId: string;
  clerkUserId: string;
  filters?: JobFilters;
}

export interface JobStatus {
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "not_found";
  progress?: number;
  result?: any;
  error?: string;
  cached?: boolean;
}

export interface JobResult {
  insights: any;
  processingTime: number;
  tokensUsed: number;
  cached: boolean;
}

@Injectable()
export class InsightsQueueService {
  constructor(
    @InjectQueue("insights-generate") private readonly insightsQueue: Queue
  ) {}

  async generateInsights(
    clerkUserId: string,
    projectId: string,
    filters?: JobFilters
  ): Promise<{ id: string; status: string; cached?: boolean }> {
    // Create new job
    const job = await this.insightsQueue.add(
      "generate-insights",
      {
        clerkUserId,
        projectId,
        filters,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      }
    );

    return {
      id: job.id as string,
      status: "pending",
    };
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.insightsQueue.getJob(jobId);
    if (!job) {
      return { status: "not_found" };
    }

    const state = await job.getState();

    // Simple mapping for now
    let mappedStatus: JobStatus["status"] = "pending";
    if (state === "completed") {
      mappedStatus = "completed";
    } else if (state === "failed") {
      mappedStatus = "failed";
    } else if (state === "active") {
      mappedStatus = "processing";
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

  async cancelJob(jobId: string): Promise<void> {
    const job = await this.insightsQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  private generateCacheKey(projectId: string, filters?: JobFilters): string {
    const key = JSON.stringify({ projectId, filters: filters || {} });
    return crypto.createHash("sha256").update(key).digest("hex");
  }
}
