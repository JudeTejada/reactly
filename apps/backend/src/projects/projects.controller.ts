import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/decorators";
import { createProjectSchema } from "@reactly/shared";
import type { CreateProjectDto } from "@reactly/shared";

@ApiTags("projects")
@Controller("projects")
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project" })
  async createProject(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: any
  ) {
    const validated = createProjectSchema.parse(dto);

    const project = await this.projectsService.createProject(
      user.clerkUserId,
      user.email || "user@example.com",
      validated
    );

    return {
      success: true,
      data: project,
      message: "Project created successfully",
    };
  }

  @Get()
  @ApiOperation({ summary: "Get all projects for authenticated user" })
  async getAllProjects(@CurrentUser() user: any) {
    const projects = await this.projectsService.findAll(user.clerkUserId);

    return {
      success: true,
      data: projects,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get single project by ID" })
  async getProject(@Param("id") id: string, @CurrentUser() user: any) {
    const project = await this.projectsService.findOne(id, user.clerkUserId);

    return {
      success: true,
      data: project,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update project" })
  async updateProject(
    @Param("id") id: string,
    @Body() dto: Partial<CreateProjectDto>,
    @CurrentUser() user: any
  ) {
    const project = await this.projectsService.updateProject(
      id,
      user.clerkUserId,
      dto
    );

    return {
      success: true,
      data: project,
      message: "Project updated successfully",
    };
  }

  @Post(":id/regenerate-key")
  @ApiOperation({ summary: "Regenerate API key for project" })
  async regenerateApiKey(@Param("id") id: string, @CurrentUser() user: any) {
    const project = await this.projectsService.regenerateApiKey(
      id,
      user.clerkUserId
    );

    return {
      success: true,
      data: project,
      message: "API key regenerated successfully",
    };
  }

  @Post(":id/toggle-active")
  @ApiOperation({ summary: "Toggle project active status" })
  async toggleActive(@Param("id") id: string, @CurrentUser() user: any) {
    const project = await this.projectsService.toggleActive(
      id,
      user.clerkUserId
    );

    return {
      success: true,
      data: project,
      message: `Project ${project.isActive ? "activated" : "deactivated"} successfully`,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete project" })
  async deleteProject(@Param("id") id: string, @CurrentUser() user: any) {
    await this.projectsService.deleteProject(id, user.clerkUserId);

    return {
      success: true,
      message: "Project deleted successfully",
    };
  }
}
