import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../../../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

@Injectable()
export class GetUserInternalIdProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Get user's internal UUID by Clerk user ID
   */
  async execute(clerkUserId: string): Promise<string> {
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
}
