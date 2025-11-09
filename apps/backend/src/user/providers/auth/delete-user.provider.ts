import { Injectable, Logger, Inject } from '@nestjs/common';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../../db/schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../../../db/providers/drizzle.provider';

@Injectable()
export class DeleteUserProvider {
  private readonly logger = new Logger(DeleteUserProvider.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  /**
   * Delete user and all associated data
   */
  async execute(internalUserId: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, internalUserId));
    this.logger.log(`Deleted user: ${internalUserId}`);
  }
}