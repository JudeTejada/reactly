import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { FeedbackService } from "./feedback.service";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { ApiKeyGuard } from "../auth/api-key.guard";
import { CurrentUser, CurrentProject } from "../auth/decorators";
import { submitFeedbackSchema } from "@reactly/shared";
import type { SubmitFeedbackDto } from "@reactly/shared";
import type { Project } from "../db/schema";

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: "Submit feedback (public endpoint with API key)" })
  @ApiHeader({ name: "x-api-key", required: true })
  @ApiHeader({ name: "x-project-id", required: true })
  async submitFeedback(
    @Body() dto: SubmitFeedbackDto,
    @CurrentProject() project: Project,
    @Req() req: any
  ) {
    const validated = submitFeedbackSchema.parse(dto);

    const metadata = {
      userAgent: req.headers["user-agent"],
      origin: req.headers.origin,
      referer: req.headers.referer,
      ip: req.ip,
    };

    const feedback = await this.feedbackService.submitFeedback(
      project.id,
      validated,
      metadata
    );

    return {
      success: true,
      data: {
        id: feedback.id,
        status: feedback.processingStatus,
        message:
          "Feedback submitted successfully. AI analysis will complete shortly.",
      },
    };
  }

  @Get()
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all feedback for authenticated user" })
  async getAllFeedback(
    @CurrentUser() user: any,
    @Query("projectId") projectId?: string,
    @Query("sentiment") sentiment?: string,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string
  ) {
    const result = await this.feedbackService.findAll(user.clerkUserId, {
      projectId,
      sentiment,
      category,
      search,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get single feedback by ID" })
  async getFeedback(@Param("id") id: string, @CurrentUser() user: any) {
    const feedback = await this.feedbackService.findOne(id, user.clerkUserId);

    return {
      success: true,
      data: feedback,
    };
  }

  @Get(":id/status")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get feedback processing status" })
  async getFeedbackStatus(@Param("id") id: string, @CurrentUser() user: any) {
    const status = await this.feedbackService.getProcessingStatus(
      id,
      user.clerkUserId
    );

    return {
      success: true,
      data: status,
    };
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete feedback by ID" })
  async deleteFeedback(@Param("id") id: string, @CurrentUser() user: any) {
    await this.feedbackService.deleteFeedback(id, user.clerkUserId);

    return {
      success: true,
      message: "Feedback deleted successfully",
    };
  }
}
