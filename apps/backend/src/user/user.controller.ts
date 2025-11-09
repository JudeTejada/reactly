import {
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Logger,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/decorators";
import type { User } from "../db/schema";

@Controller("users")
@UseGuards(ClerkAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get("profile")
  async getProfile(@CurrentUser() user: { userId: string; clerkUserId: string }) {
    return this.userService.getUserByClerkId(user.clerkUserId);
  }

  @Get("projects")
  async getUserProjects(@CurrentUser() user: { userId: string; clerkUserId: string }) {
    return this.userService.getUserProjects(user.clerkUserId);
  }

  @Get("project-ids")
  async getUserProjectIds(@CurrentUser() user: { userId: string; clerkUserId: string }) {
    return { projectIds: await this.userService.getUserProjectIds(user.clerkUserId) };
  }

  @Post("sync-from-clerk")
  @HttpCode(HttpStatus.OK)
  async syncUserFromClerk(@CurrentUser() user: {
    userId: string;
    clerkUserId: string;
    email?: string;
    name?: string;
  }) {
    const updatedUser = await this.userService.upsertUserFromClerk({
      id: user.clerkUserId,
      email_addresses: [{ email_address: user.email || "" }],
      first_name: user.name?.split(" ")[0],
      last_name: user.name?.split(" ").slice(1).join(" "),
    });

    this.logger.log(`Synced user from Clerk: ${updatedUser.id}`);
    return updatedUser;
  }

  @Delete("account")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: { userId: string; clerkUserId: string }) {
    await this.userService.deleteUser(user.clerkUserId);
    this.logger.log(`Deleted user account: ${user.clerkUserId}`);
  }

  @Get("owns-project/:projectId")
  async checkProjectOwnership(
    @Param("projectId") projectId: string,
    @CurrentUser() user: { userId: string; clerkUserId: string }
  ) {
    const owns = await this.userService.ownsProject(user.clerkUserId, projectId);
    return { owns, projectId };
  }
}