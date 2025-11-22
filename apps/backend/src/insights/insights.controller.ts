import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { InsightsService } from "./insights.service";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/decorators";
import {
  ENQUEUE_GENERATE_INSIGHTS,
  GET_INSIGHTS_JOB_STATUS,
  CANCEL_INSIGHTS_JOB,
} from "./providers/tokens";
import type {
  EnqueueGenerateInsightsProvider,
  GetInsightsJobStatusProvider,
  CancelInsightsJobProvider,
} from "./providers";

@ApiTags("insights")
@Controller("insights")
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    @Inject(ENQUEUE_GENERATE_INSIGHTS)
    private readonly enqueueGenerateInsightsProvider: EnqueueGenerateInsightsProvider,
    @Inject(GET_INSIGHTS_JOB_STATUS)
    private readonly getInsightsJobStatusProvider: GetInsightsJobStatusProvider,
    @Inject(CANCEL_INSIGHTS_JOB)
    private readonly cancelInsightsJobProvider: CancelInsightsJobProvider
  ) {}

  @Get()
  @ApiOperation({ summary: "Get insights for project (cached or generate)" })
  async getInsights(
    @CurrentUser() user: any,
    @Query("projectId") projectId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("forceRefresh") forceRefresh?: string
  ) {
    // Check cache first (fast path)
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    if (!forceRefresh) {
      const cached = await this.insightsService.getCachedInsights(
        user.clerkUserId,
        projectId,
        filters
      );

      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
        };
      }
    }

    // Queue new generation
    const job = await this.enqueueGenerateInsightsProvider.execute(
      user.clerkUserId,
      projectId,
      filters
    );

    return {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        cached: job.cached || false,
        estimatedTime: 10, // seconds
      },
    };
  }

  @Post("generate")
  @ApiOperation({ summary: "Generate new AI-powered insights from feedback" })
  async generateNewInsights(
    @CurrentUser() user: any,
    @Query("projectId") projectId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const insights = await this.insightsService.generateInsights(
      user.clerkUserId,
      projectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return {
      success: true,
      data: insights,
    };
  }

  @Get("existing")
  @ApiOperation({ summary: "Get existing saved insights" })
  async getExistingInsights(
    @CurrentUser() user: any,
    @Query("projectId") projectId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const insights = await this.insightsService.getExistingInsights(
      user.clerkUserId,
      projectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return {
      success: true,
      data: insights,
    };
  }

  @Post("jobs")
  @ApiOperation({ summary: "Create new insights generation job" })
  async createJob(
    @CurrentUser() user: any,
    @Body()
    body: {
      projectId: string;
      filters?: { startDate?: string; endDate?: string; category?: string };
    }
  ) {
    const job = await this.enqueueGenerateInsightsProvider.execute(
      user.clerkUserId,
      body.projectId,
      body.filters
        ? {
            startDate: body.filters.startDate
              ? new Date(body.filters.startDate)
              : undefined,
            endDate: body.filters.endDate
              ? new Date(body.filters.endDate)
              : undefined,
            category: body.filters.category,
          }
        : undefined
    );

    return {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        cached: job.cached,
      },
    };
  }

  @Get("jobs/:jobId")
  @ApiOperation({ summary: "Check job status" })
  async getJobStatus(@CurrentUser() user: any, @Param("jobId") jobId: string) {
    const status = await this.getInsightsJobStatusProvider.execute(jobId);

    return {
      success: true,
      data: status,
    };
  }

  @Delete("jobs/:jobId")
  @ApiOperation({ summary: "Cancel pending job" })
  async cancelJob(@CurrentUser() user: any, @Param("jobId") jobId: string) {
    await this.cancelInsightsJobProvider.execute(jobId);

    return {
      success: true,
      message: "Job cancelled",
    };
  }
}
