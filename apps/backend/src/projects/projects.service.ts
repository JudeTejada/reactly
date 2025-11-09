import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { projects, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { generateApiKey } from "@reactly/shared";
import type { CreateProjectDto } from "@reactly/shared";
import type { Project } from "../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "../db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "../db/providers/drizzle.provider";

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}

  async ensureUser(clerkUserId: string, email: string): Promise<string> {
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (existingUser) {
      return existingUser.id;
    }

    const [newUser] = await this.db
      .insert(users)
      .values({
        clerkUserId,
        email,
        plan: "free",
      })
      .returning();

    this.logger.log(`Created new user: ${newUser.id}`);
    return newUser.id;
  }

  async createProject(
    clerkUserId: string,
    email: string,
    dto: CreateProjectDto
  ): Promise<Project> {
    const userId = await this.ensureUser(clerkUserId, email);

    const apiKey = generateApiKey();

    const [project] = await this.db
      .insert(projects)
      .values({
        name: dto.name,
        apiKey,
        userId,
        allowedDomains: dto.allowedDomains || [],
        webhookUrl: dto.webhookUrl,
        isActive: true,
      })
      .returning();

    this.logger.log(`Created project: ${project.id}`);
    return project;
  }

  async findAll(clerkUserId: string): Promise<Project[]> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (!user) {
      return [];
    }

    return this.db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(projects.createdAt);
  }

  async findOne(id: string, clerkUserId: string): Promise<Project> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const [project] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .limit(1);

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }

  async updateProject(
    id: string,
    clerkUserId: string,
    updates: Partial<CreateProjectDto>
  ): Promise<Project> {
    const project = await this.findOne(id, clerkUserId);

    const [updated] = await this.db
      .update(projects)
      .set({
        name: updates.name || project.name,
        allowedDomains: updates.allowedDomains || project.allowedDomains,
        webhookUrl: updates.webhookUrl !== undefined
          ? updates.webhookUrl
          : project.webhookUrl,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    this.logger.log(`Updated project: ${id}`);
    return updated;
  }

  async regenerateApiKey(
    id: string,
    clerkUserId: string
  ): Promise<Project> {
    const project = await this.findOne(id, clerkUserId);

    const newApiKey = generateApiKey();

    const [updated] = await this.db
      .update(projects)
      .set({
        apiKey: newApiKey,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    this.logger.log(`Regenerated API key for project: ${id}`);
    return updated;
  }

  async toggleActive(
    id: string,
    clerkUserId: string
  ): Promise<Project> {
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
    return updated;
  }

  async deleteProject(id: string, clerkUserId: string): Promise<void> {
    const project = await this.findOne(id, clerkUserId);

    await this.db.delete(projects).where(eq(projects.id, project.id));

    this.logger.log(`Deleted project: ${id}`);
  }
}
