import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ApiKeyService } from '../auth/api-key.service';
import { DRIZZLE_ASYNC_PROVIDER } from '../db/providers/drizzle.provider';
import { projects } from '../db/schema';
import { eq, isNull } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../db/schema';
import { Logger } from '@nestjs/common';

async function populateHashedApiKeys() {
  const logger = new Logger('PopulateHashedApiKeys');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const db = await app.resolve<NodePgDatabase<typeof sc>>(DRIZZLE_ASYNC_PROVIDER);
    const apiKeyService = app.get<ApiKeyService>(ApiKeyService);

    logger.log('Fetching projects without hashed API keys...');

    // Get all projects that don't have hashed API keys
    const projectsWithoutHash = await db
      .select()
      .from(projects)
      .where(isNull(projects.hashedApiKey));

    logger.log(`Found ${projectsWithoutHash.length} projects to update`);

    for (const project of projectsWithoutHash) {
      logger.log(`Hashing API key for project: ${project.id}`);

      const hashedKey = await apiKeyService.hashApiKey(project.apiKey);

      await db
        .update(projects)
        .set({ hashedApiKey: hashedKey })
        .where(eq(projects.id, project.id));

      logger.log(`Updated project: ${project.id}`);
    }

    logger.log('Successfully populated hashed API keys for all projects');
  } catch (error) {
    logger.error('Error populating hashed API keys:', error);
    throw error;
  } finally {
    await app.close();
  }
}

populateHashedApiKeys()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });