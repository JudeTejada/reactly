import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { users, projects } from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { User, Project } from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../db/providers/drizzle.provider";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Get user's internal UUID by Clerk user ID
   * This is the most common operation used across services
   */
  async getUserInternalId(clerkUserId: string): Promise<string> {
    const user = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException("User not found");
    }

    return user[0].id;
  }

  /**
   * Get full user record by Clerk user ID
   */
  async getUserByClerkId(clerkUserId: string): Promise<User> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Get user by internal UUID
   */
  async getUserById(userId: string): Promise<User> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Get user's projects for authorization
   */
  async getUserProjects(clerkUserId: string): Promise<Project[]> {
    const internalUserId = await this.getUserInternalId(clerkUserId);

    return this.db
      .select()
      .from(projects)
      .where(eq(projects.userId, internalUserId))
      .orderBy(projects.createdAt);
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

    const [project] = await this.db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, internalUserId)))
      .limit(1);

    return !!project;
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
    const email = clerkUser.email_addresses[0]?.email_address;
    const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || null;

    // Check if user exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUser.id))
      .limit(1);

    if (existingUser.length === 0) {
      // Create new user
      const [newUser] = await this.db
        .insert(users)
        .values({
          clerkUserId: clerkUser.id,
          email,
          name,
        })
        .returning();

      this.logger.log(`Created new user: ${newUser.id} (Clerk: ${clerkUser.id})`);
      return newUser;
    } else {
      // Update existing user
      const [updatedUser] = await this.db
        .update(users)
        .set({
          email,
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, clerkUser.id))
        .returning();

      this.logger.log(`Updated user: ${updatedUser.id} (Clerk: ${clerkUser.id})`);
      return updatedUser;
    }
  }

  /**
   * Delete user and all associated data
   */
  async deleteUser(clerkUserId: string): Promise<void> {
    const internalUserId = await this.getUserInternalId(clerkUserId);

    // Delete user (cascade will handle projects and feedback)
    await this.db.delete(users).where(eq(users.id, internalUserId));

    this.logger.log(`Deleted user: ${internalUserId} (Clerk: ${clerkUserId})`);
  }
}
