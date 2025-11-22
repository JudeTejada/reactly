import { Injectable, Logger, Inject } from "@nestjs/common";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import type { User } from "../../../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../../../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

@Injectable()
export class UpsertUserFromClerkProvider {
  private readonly logger = new Logger(UpsertUserFromClerkProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Create or update user from Clerk webhook data
   */
  async execute(clerkUser: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
  }): Promise<User> {
    const email = clerkUser.email_addresses[0]?.email_address;
    const name =
      `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
      null;

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

      this.logger.log(
        `Created new user: ${newUser.id} (Clerk: ${clerkUser.id})`
      );
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

      this.logger.log(
        `Updated user: ${updatedUser.id} (Clerk: ${clerkUser.id})`
      );
      return updatedUser;
    }
  }
}
