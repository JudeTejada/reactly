import { Injectable, Inject } from '@nestjs/common';
import { projects } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';

@Injectable()
export class CheckProjectOwnershipProvider {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Check if user owns a specific project
   */
  async execute(internalUserId: string, projectId: string): Promise<boolean> {
    const [project] = await this.db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, internalUserId)))
      .limit(1);

    return !!project;
  }
}