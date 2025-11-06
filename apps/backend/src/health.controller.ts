import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { db } from "./db";
import { sql } from "drizzle-orm";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  async healthCheck() {
    try {
      await db.execute(sql`SELECT 1`);
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
