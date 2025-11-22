import {
  Injectable,
  Logger,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { projects } from "../db/schema";
import { eq } from "drizzle-orm";
import type { CreateProjectDto } from "@reactly/shared";
import type { Project, ProjectWithApiKey } from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../db/providers/drizzle.provider";
import { ApiKeyService } from "../auth/api-key.service";
import {
  GET_USER_INTERNAL_ID,
  GET_USER_BY_CLERK_ID,
  GET_USER_PROJECTS,
  CHECK_PROJECT_OWNERSHIP
} from "../user/providers";

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER) 
    private db: NodePgDatabase<typeof sc>,
    private apiKeyService: ApiKeyService,
    @Inject(GET_USER_INTERNAL_ID)
    private readonly getUserInternalId: any,
    @Inject(GET_USER_BY_CLERK_ID)
    private readonly getUserByClerkId: any,
    @Inject(GET_USER_PROJECTS)
    private readonly getUserProjects: any,
    @Inject(CHECK_PROJECT_OWNERSHIP)
    private readonly checkProjectOwnership: any
  ) {}

  async createProject(
    clerkUserId: string,
    dto: CreateProjectDto
  ): Promise<ProjectWithApiKey> {

    // Get user's internal ID using centralized service
    const user = await this.getUserByClerkId.execute(clerkUserId);

    // Generate random API key with encryption for secure storage
    const { plainKey: apiKey, hashedKey: hashedApiKey, encryptedKey: encryptedApiKey } = await this.apiKeyService.generateApiKeyPairWithEncryption();

    // Create project with both hashed and encrypted API key in single operation
    const [project] = await this.db
      .insert(projects)
      .values({
        name: dto.name,
        hashedApiKey,
        encryptedApiKey,
        keyVersion: 1,
        userId: user.id,
        allowedDomains: dto.allowedDomains || [],
        webhookUrl: dto.webhookUrl,
        slackWebhookUrl: dto.slackWebhookUrl,
        isActive: true,
      })
      .returning();

    this.logger.log(`Created project: ${project.id}`);
    return { ...project, apiKey };
  }

  async findAll(clerkUserId: string): Promise<ProjectWithApiKey[]> {
    // Get user first, then get projects
    const user = await this.getUserByClerkId.execute(clerkUserId);
    const projectsWithEncryptedKeys = await this.getUserProjects.execute(user.id);

    // Decrypt API keys for each project
    return projectsWithEncryptedKeys.map(project => ({
      ...project,
      apiKey: project.encryptedApiKey ? this.apiKeyService.decryptApiKey(project.encryptedApiKey) : ''
    }));
  }

  async findOne(id: string, clerkUserId: string): Promise<ProjectWithApiKey> {
    // Get user first, then check project ownership
    const user = await this.getUserByClerkId.execute(clerkUserId);
    const ownsProject = await this.checkProjectOwnership.execute(user.id, id);
    if (!ownsProject) {
      throw new NotFoundException("Project not found");
    }

    const [project] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return {
      ...project,
      apiKey: project.encryptedApiKey ? this.apiKeyService.decryptApiKey(project.encryptedApiKey) : ''
    };
  }

  async updateProject(
    id: string,
    clerkUserId: string,
    updates: Partial<CreateProjectDto>
  ): Promise<ProjectWithApiKey> {
    const project = await this.findOne(id, clerkUserId);

    const [updated] = await this.db
      .update(projects)
      .set({
        name: updates.name || project.name,
        allowedDomains: updates.allowedDomains || project.allowedDomains,
        webhookUrl:
          updates.webhookUrl !== undefined
            ? updates.webhookUrl
            : project.webhookUrl,
        slackWebhookUrl:
          updates.slackWebhookUrl !== undefined
            ? updates.slackWebhookUrl
            : project.slackWebhookUrl,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    this.logger.log(`Updated project: ${id}`);
    return {
      ...updated,
      apiKey: updated.encryptedApiKey ? this.apiKeyService.decryptApiKey(updated.encryptedApiKey) : ''
    };
  }

  async regenerateApiKey(id: string, clerkUserId: string): Promise<ProjectWithApiKey> {
    // Verify project exists and user has access
    await this.findOne(id, clerkUserId);

    // Generate new random API key with encryption
    const { plainKey: newApiKey, hashedKey: newHashedApiKey, encryptedKey: newEncryptedKey } = await this.apiKeyService.generateApiKeyPairWithEncryption();

    const [updated] = await this.db
      .update(projects)
      .set({
        hashedApiKey: newHashedApiKey,
        encryptedApiKey: newEncryptedKey,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    this.logger.log(`Regenerated API key for project: ${id}`);
    return { ...updated, apiKey: newApiKey };
  }

  async toggleActive(id: string, clerkUserId: string): Promise<ProjectWithApiKey> {
    const project = await this.findOne(id, clerkUserId);

    const [updated] = await this.db
      .update(projects)
      .set({
        isActive: !project.isActive,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    this.logger.log(
      `Toggled active status for project: ${id} to ${updated.isActive}`
    );
    return {
      ...updated,
      apiKey: updated.encryptedApiKey ? this.apiKeyService.decryptApiKey(updated.encryptedApiKey) : ''
    };
  }

  async deleteProject(id: string, clerkUserId: string): Promise<void> {
    const project = await this.findOne(id, clerkUserId);

    await this.db.delete(projects).where(eq(projects.id, project.id));

    this.logger.log(`Deleted project: ${id}`);
  }
}
