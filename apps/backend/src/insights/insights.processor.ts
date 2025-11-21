import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { InsightsService } from "./insights.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import * as crypto from "crypto";

export interface GenerateInsightsJob {
  jobId: string;
  projectId: string;
  userId: string;
  clerkUserId: string;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
  };
}

export interface JobResult {
  insights: any;
  processingTime: number;
  tokensUsed: number;
  cached: boolean;
}

@Processor("insights-generate")
@Injectable()
export class InsightsProcessor extends WorkerHost {
  private readonly logger = new Logger(InsightsProcessor.name);

  constructor(
    private readonly insightsService: InsightsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: any
  ) {
    super();
  }

  async process(job: Job<GenerateInsightsJob>): Promise<JobResult> {
    const { projectId, clerkUserId, filters } = job.data;
    const startTime = Date.now();

    this.logger.log(`Starting insights generation for project ${projectId}`);

    try {
      // Update job progress
      await job.updateProgress(20);

      // Generate insights via AI
      const insights = await this.insightsService.generateInsights(
        clerkUserId,
        projectId,
        filters?.startDate,
        filters?.endDate
      );

      await job.updateProgress(80);

      // Cache result
      const cacheKey = this.generateCacheKey(projectId, filters);
      await this.cacheManager.set(
        cacheKey,
        insights,
        24 * 60 * 60 * 1000 // 24h TTL
      );

      // Update job with result
      const result: JobResult = {
        insights,
        processingTime: Date.now() - startTime,
        tokensUsed: 0, // TODO: Track tokens from insights
        cached: false,
      };

      await job.updateProgress(100);
      this.logger.log(`Completed insights generation for project ${projectId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed insights generation for project ${projectId}`,
        error
      );
      throw error;
    }
  }

  private generateCacheKey(projectId: string, filters?: any): string {
    const key = JSON.stringify({ projectId, filters: filters || {} });
    return crypto.createHash("sha256").update(key).digest("hex");
  }
}
