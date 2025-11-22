import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import type { User } from "../../../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../../../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

@Injectable()
export class GetUserByClerkIdProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Get full user record by Clerk user ID
   */
  async execute(clerkUserId: string): Promise<User> {
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
}
