import { Injectable, Logger, Inject } from "@nestjs/common";
import type { User, Project } from "../db/schema";
import {
  GET_USER_INTERNAL_ID,
  GET_USER_BY_CLERK_ID,
  GET_USER_PROJECTS,
  CHECK_PROJECT_OWNERSHIP,
  UPSERT_USER_FROM_CLERK,
  DELETE_USER,
} from "./providers";
import {
  GetUserInternalIdProvider,
  GetUserByClerkIdProvider,
  GetUserProjectsProvider,
  CheckProjectOwnershipProvider,
  UpsertUserFromClerkProvider,
  DeleteUserProvider,
} from "./providers";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(GET_USER_INTERNAL_ID)
    private readonly getUserInternalIdProvider: GetUserInternalIdProvider,
    @Inject(GET_USER_BY_CLERK_ID)
    private readonly getUserByClerkIdProvider: GetUserByClerkIdProvider,
    @Inject(GET_USER_PROJECTS)
    private readonly getUserProjectsProvider: GetUserProjectsProvider,
    @Inject(CHECK_PROJECT_OWNERSHIP)
    private readonly checkProjectOwnershipProvider: CheckProjectOwnershipProvider,
    @Inject(UPSERT_USER_FROM_CLERK)
    private readonly upsertUserFromClerkProvider: UpsertUserFromClerkProvider,
    @Inject(DELETE_USER)
    private readonly deleteUserProvider: DeleteUserProvider
  ) {}

  /**
   * Get user's internal UUID by Clerk user ID
   * This is the most common operation used across services
   */
  async getUserInternalId(clerkUserId: string): Promise<string> {
    return this.getUserInternalIdProvider.execute(clerkUserId);
  }

  /**
   * Get full user record by Clerk user ID
   */
  async getUserByClerkId(clerkUserId: string): Promise<User> {
    return this.getUserByClerkIdProvider.execute(clerkUserId);
  }

  /**
   * Get user by internal UUID
   * Note: This would need a separate provider if needed
   */
  async getUserById(): Promise<User> {
    // For now, this would need to be implemented as a separate provider
    // Or we can keep this as a direct DB query since it's less commonly used
    throw new Error("getUserById not implemented in provider pattern yet");
  }

  /**
   * Get user's projects for authorization
   */
  async getUserProjects(clerkUserId: string): Promise<Project[]> {
    const internalUserId = await this.getUserInternalId(clerkUserId);
    return this.getUserProjectsProvider.execute(internalUserId);
  }

  /**
   * Get user project IDs array (commonly used for filtering)
   */
  async getUserProjectIds(clerkUserId: string): Promise<string[]> {
    const projects = await this.getUserProjects(clerkUserId);
    return projects.map((project) => project.id);
  }

  /**
   * Check if user owns a specific project
   */
  async ownsProject(clerkUserId: string, projectId: string): Promise<boolean> {
    const internalUserId = await this.getUserInternalId(clerkUserId);
    return this.checkProjectOwnershipProvider.execute(
      internalUserId,
      projectId
    );
  }

  /**
   * Create or update user from Clerk webhook data
   */
  async upsertUserFromClerk(clerkUser: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    return this.upsertUserFromClerkProvider.execute(clerkUser);
  }

  /**
   * Delete user and all associated data
   */
  async deleteUser(clerkUserId: string): Promise<void> {
    const internalUserId = await this.getUserInternalId(clerkUserId);
    return this.deleteUserProvider.execute(internalUserId);
  }
}
