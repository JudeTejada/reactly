import { Injectable, Inject } from "@nestjs/common";
import { projects } from "../../../db/schema";
import { eq } from "drizzle-orm";
import type { Project } from "../../../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../../../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../../../db/providers/drizzle.provider";

@Injectable()
export class GetUserProjectsProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Get user's projects for authorization
   */
  async execute(internalUserId: string): Promise<Project[]> {
    return this.db
      .select()
      .from(projects)
      .where(eq(projects.userId, internalUserId))
      .orderBy(projects.createdAt);
  }
}
