import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as sc from "./db/schema";
import { DRIZZLE_ASYNC_PROVIDER } from "./db/providers/drizzle.provider";

@ApiTags("health")
@Controller()
export class HealthController {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private db: NodePgDatabase<typeof sc>
  ) {}
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  async healthCheck() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error.message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: "Root endpoint" })
  getRoot() {
    return {
      name: "Reactly API",
      version: "1.0.0",
      docs: "/api/docs",
      health: "/health",
    };
  }
}
