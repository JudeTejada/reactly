import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/decorators";

@ApiTags("analytics")
@Controller("analytics")
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("overview")
  @ApiOperation({ summary: "Get analytics overview" })
  async getOverview(
    @CurrentUser() user: any,
    @Query("projectId") projectId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const stats = await this.analyticsService.getOverview(
      user.clerkUserId,
      projectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get("trends")
  @ApiOperation({ summary: "Get sentiment trends over time" })
  async getTrends(
    @CurrentUser() user: any,
    @Query("projectId") projectId?: string,
    @Query("days") days?: string
  ) {
    const trends = await this.analyticsService.getTrends(
      user.clerkUserId,
      projectId,
      days ? parseInt(days) : 30
    );

    return {
      success: true,
      data: trends,
    };
  }

  @Get("recent")
  @ApiOperation({ summary: "Get recent feedback" })
  async getRecentFeedback(
    @CurrentUser() user: any,
    @Query("projectId") projectId?: string,
    @Query("limit") limit?: string
  ) {
    const recent = await this.analyticsService.getRecentFeedback(
      user.clerkUserId,
      projectId,
      limit ? parseInt(limit) : 10
    );

    return {
      success: true,
      data: recent,
    };
  }
}
