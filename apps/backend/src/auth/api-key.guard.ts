import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { db } from "../db";
import { projects } from "../db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-api-key"];
    const projectId = request.headers["x-project-id"];

    if (!apiKey || !projectId) {
      throw new UnauthorizedException(
        "API key and project ID are required"
      );
    }

    try {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project) {
        throw new UnauthorizedException("Invalid project ID");
      }

      if (project.apiKey !== apiKey) {
        throw new UnauthorizedException("Invalid API key");
      }

      if (!project.isActive) {
        throw new UnauthorizedException("Project is inactive");
      }

      request.project = project;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
