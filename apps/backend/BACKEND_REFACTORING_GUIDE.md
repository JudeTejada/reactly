# Backend Refactoring Guide

> **Focus**: Reusability, Structure, and Documentation
> **Priority**: Security → Architecture → Performance → Code Quality

## 📋 Table of Contents

1. [Current Architecture Overview](#current-architecture-overview)
2. [Critical Security Issues](#critical-security-issues)
3. [Architecture Refactoring](#architecture-refactoring)
4. [Performance Optimizations](#performance-optimizations)
5. [Code Quality Improvements](#code-quality-improvements)
6. [Documentation Standards](#documentation-standards)
7. [Implementation Timeline](#implementation-timeline)

---

## 🏗️ Current Architecture Overview

### Module Structure

```
src/
├── ai/              # Gemini AI sentiment analysis
├── analytics/       # Feedback analytics & reporting
├── auth/           # Dual authentication (Clerk JWT + API key)
├── feedback/       # Feedback CRUD operations
├── projects/       # Project management with API keys
├── webhook/        # Discord webhook integration
├── common/         # Shared utilities
└── database/       # Database schema & connection
```

### Current Strengths

- ✅ Clean NestJS modular architecture
- ✅ Proper separation of concerns
- ✅ Environment-based configuration
- ✅ Database migrations setup

---

## 🚨 Critical Security Issues (Priority 1)

### 1. API Key Timing Attack Vulnerability

**File**: `src/auth/api-key.guard.ts:35`

```typescript
// ❌ Current vulnerable code
if (apiKey === storedApiKey) {
  return true;
}

// ✅ Secure fix
import { timingSafeEqual } from "crypto";
import { createHash } from "crypto";

if (
  storedApiKey &&
  timingSafeEqual(
    Buffer.from(createHash("sha256").update(apiKey).digest()),
    Buffer.from(storedApiKey)
  )
) {
  return true;
}
```

### 2. Plain Text API Key Storage

**File**: `src/db/schema.ts:26`

```typescript
// ❌ Current vulnerable schema
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // Plain text!
  // ...
});

// ✅ Secure schema with hashed keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  keyHash: text("key_hash").notNull().unique(),
  keyPrefix: text("key_prefix").notNull(), // For identification
  // ...
});
```

### 3. CORS Security Gap

**File**: `src/main.ts:16`

```typescript
// ❌ Current insecure fallback
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true,
});

// ✅ Secure configuration
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

---

## 🏛️ Architecture Refactoring (Priority 2)

### 1. Repository Pattern Implementation

#### Create Base Repository

**New File**: `src/database/repositories/base.repository.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

@Injectable()
export abstract class BaseRepository<T> {
  protected constructor(
    protected readonly db: ReturnType<typeof drizzle>,
    protected readonly table: any
  ) {}

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db.insert(this.table).values(data).returning();
    return result;
  }

  async findById(id: number): Promise<T | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return result || null;
  }

  async findAll(filter?: any): Promise<T[]> {
    return this.db.select().from(this.table).where(filter);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const [result] = await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table.id, id));
  }
}
```

#### User Repository Implementation

**New File**: `src/database/repositories/user.repository.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { users } from "../schema";
import { eq } from "drizzle-orm";

@Injectable()
export class UserRepository extends BaseRepository<typeof users.$inferSelect> {
  constructor(db: any) {
    super(db, users);
  }

  async findByClerkId(
    clerkId: string
  ): Promise<typeof users.$inferSelect | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkId));
    return user || null;
  }

  async getOrCreateUser(
    clerkId: string,
    email: string
  ): Promise<typeof users.$inferSelect> {
    let user = await this.findByClerkId(clerkId);

    if (!user) {
      [user] = await this.db
        .insert(users)
        .values({ clerkUserId: clerkId, email })
        .returning();
    }

    return user;
  }
}
```

### 2. Centralized User Service

#### Eliminate Code Duplication

**New File**: `src/modules/users/user.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../database/repositories/user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserInternalId(clerkId: string): Promise<number> {
    const user = await this.userRepository.findByClerkId(clerkId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.id;
  }

  async getOrCreateUser(clerkId: string, email: string): Promise<number> {
    const user = await this.userRepository.getOrCreateUser(clerkId, email);
    return user.id;
  }
}
```

#### Update Services to Use Centralized User Service

**File**: `src/modules/feedback/feedback.service.ts`

```typescript
// ❌ Remove this duplicated code
// private async getUserInternalId(clerkId: string): Promise<number> {
//   const user = await this.db.select().from(users)
//     .where(eq(users.clerkUserId, clerkId));
//   if (!user.length) throw new Error('User not found');
//   return user[0].id;
// }

// ✅ Use centralized service
constructor(
  private readonly userService: UserService,
  // ... other dependencies
) {}

async createFeedback(createFeedbackDto: CreateFeedbackDto, clerkId: string) {
  const userId = await this.userService.getUserInternalId(clerkId);
  // ... rest of implementation
}
```

### 3. Configuration Management

#### Centralized Configuration

**New File**: `src/config/configuration.ts`

```typescript
import { plainToClass } from "class-transformer";
import { IsString, IsOptional, IsArray, IsNumber } from "class-validator";
import { validateSync } from "class-validator";

class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  CLERK_PEM_PUBLIC_KEY: string;

  @IsString()
  DISCORD_WEBHOOK_URL: string;

  @IsString()
  GEMINI_API_KEY: string;

  @IsOptional()
  @IsArray()
  ALLOWED_ORIGINS: string[];

  @IsOptional()
  @IsNumber()
  PORT: number = 3001;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

---

## ⚡ Performance Optimizations (Priority 3)

### 1. Database Indexes

#### Add Critical Indexes

**New Migration**: `src/db/migrations/002_add_indexes.sql`

```sql
-- User queries
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);

-- Project queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Feedback queries
CREATE INDEX idx_feedback_project_id ON feedback(project_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

-- API key queries
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);
```

### 2. Query Optimization

#### Fix N+1 Query Problems

**File**: `src/modules/analytics/analytics.service.ts`

```typescript
// ❌ Current N+1 queries
async getProjectAnalytics(projectId: number) {
  const feedback = await this.db.select().from(feedback)
    .where(eq(feedback.projectId, projectId));

  const results = [];
  for (const item of feedback) {
    const user = await this.db.select().from(users)
      .where(eq(users.id, item.userId));
    results.push({ ...item, user: user[0] });
  }
  return results;
}

// ✅ Optimized with JOIN
async getProjectAnalytics(projectId: number) {
  return this.db
    .select({
      feedback: feedback,
      user: users,
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.userId, users.id))
    .where(eq(feedback.projectId, projectId));
}
```

### 3. Caching Layer

#### Redis Cache Implementation

**New File**: `src/cache/cache.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      ttl: 3600, // 1 hour default
    }),
  ],
  exports: [CacheModule],
})
export class CustomCacheModule {}
```

---

## 🔧 Code Quality Improvements (Priority 4)

### 1. Exception Filter Fix

#### Fix Critical Bug

**File**: `src/common/filters/http-exception.filter.ts:18`

```typescript
// ❌ Current bug
catch(exception: unknown, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

  let status: number;
  let message: string;

  if (exception instanceof HttpException) {
    status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as any).message;
  } else {
    status = 500;
    message = 'Internal server error';
  }

  const errorResponse = {
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
    message, // This can be an array - needs handling
  };

  response.status(status).json(errorResponse);
}

// ✅ Fixed version
catch(exception: unknown, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

  let status: number;
  let message: string | string[];

  if (exception instanceof HttpException) {
    status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || responseObj.error || 'Unknown error';
    } else {
      message = 'Unknown error';
    }
  } else {
    status = 500;
    message = 'Internal server error';
  }

  const errorResponse = {
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
    message: Array.isArray(message) ? message : [message],
  };

  response.status(status).json(errorResponse);
}
```

### 2. Testing Infrastructure

#### Jest Configuration

**New File**: `test/jest.config.js`

```javascript
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapping: {
    "^src/(.*)$": "<rootDir>/../src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/setup.ts"],
};
```

#### Service Test Example

**New File**: `src/modules/users/user.service.spec.ts`

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserRepository } from "../../database/repositories/user.repository";

describe("UserService", () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByClerkId: jest.fn(),
      getOrCreateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  describe("getUserInternalId", () => {
    it("should return user ID when user exists", async () => {
      const mockUser = {
        id: 1,
        clerkUserId: "test123",
        email: "test@test.com",
      };
      userRepository.findByClerkId.mockResolvedValue(mockUser);

      const result = await service.getUserInternalId("test123");

      expect(result).toBe(1);
      expect(userRepository.findByClerkId).toHaveBeenCalledWith("test123");
    });

    it("should throw error when user not found", async () => {
      userRepository.findByClerkId.mockResolvedValue(null);

      await expect(service.getUserInternalId("nonexistent")).rejects.toThrow(
        "User not found"
      );
    });
  });
});
```

---

## 📚 Documentation Standards

### 1. API Documentation

#### Swagger/OpenAPI Setup

**File**: `src/main.ts`

```typescript
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Feedback API")
    .setDescription("API documentation for Feedback service")
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("feedback", "Feedback management")
    .addTag("analytics", "Analytics and reporting")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT || 3001);
}
```

#### Controller Documentation Example

**File**: `src/modules/feedback/feedback.controller.ts`

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("feedback")
@ApiBearerAuth()
@Controller("feedback")
export class FeedbackController {
  @Post()
  @ApiOperation({
    summary: "Create new feedback",
    description:
      "Submit feedback for a specific project with sentiment analysis",
  })
  @ApiResponse({
    status: 201,
    description: "Feedback successfully created",
    type: FeedbackResponse,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Req() req: Request
  ) {
    // Implementation
  }
}
```

### 2. Code Documentation Standards

#### TypeScript Documentation

````typescript
/**
 * Service for managing user operations and authentication
 *
 * @example
 * ```typescript
 * const userService = new UserService(userRepository);
 * const userId = await userService.getOrCreateUser('clerk_123', 'user@example.com');
 * ```
 */
@Injectable()
export class UserService {
  /**
   * Retrieves or creates a user based on Clerk ID
   *
   * @param clerkId - The Clerk authentication user ID
   * @param email - User's email address
   * @returns Promise resolving to the internal user ID
   *
   * @throws {Error} When user creation fails
   *
   * @example
   * ```typescript
   * const userId = await userService.getOrCreateUser('clerk_123', 'user@example.com');
   * console.log(userId); // 1
   * ```
   */
  async getOrCreateUser(clerkId: string, email: string): Promise<number> {
    // Implementation
  }
}
````

### 3. README Templates

#### Project README Structure

```markdown
# Backend Service Name

## Overview

Brief description of the service purpose and functionality.

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk JWT + API Keys
- **Cache**: Redis
- **Testing**: Jest

## Quick Start

\`\`\`bash

# Install dependencies

npm install

# Set up environment

cp .env.example .env

# Run migrations

npm run migrate

# Start development server

npm run start:dev
\`\`\`

## API Documentation

Visit `/api/docs` for interactive Swagger documentation.

## Environment Variables

| Variable             | Description                           | Required |
| -------------------- | ------------------------------------- | -------- |
| DATABASE_URL         | PostgreSQL connection string          | ✅       |
| CLERK_PEM_PUBLIC_KEY | Clerk public key for JWT verification | ✅       |

## Development Guide

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development instructions.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guidelines.
```

---

## ⏱️ Implementation Timeline

### Week 1: Critical Security (4-6 hours)

- [ ] Fix API key timing attack vulnerability
- [ ] Implement API key hashing with migration
- [ ] Secure CORS configuration
- [ ] Add configuration validation

### Week 2: Architecture Foundation (8-10 hours)

- [ ] Create repository pattern with base class
- [ ] Implement centralized UserService
- [ ] Fix exception filter bug
- [ ] Add database indexes migration

### Week 3: Performance & Quality (6-8 hours)

- [ ] Implement Redis caching layer
- [ ] Optimize N+1 queries with JOINs
- [ ] Set up Jest testing infrastructure
- [ ] Add structured logging

### Week 4: Documentation & Polish (4-6 hours)

- [ ] Implement Swagger/OpenAPI documentation
- [ ] Create comprehensive test coverage
- [ ] Update README and documentation
- [ ] Code review and final optimizations

---

## 🎯 Success Metrics

### Security

- [ ] Zero high-severity security vulnerabilities
- [ ] All API keys stored hashed
- [ ] Proper CORS and authentication

### Performance

- [ ] <100ms average response time
- [ ] 90%+ cache hit rate for frequent queries
- [ ] Zero N+1 query issues

### Code Quality

- [ ] 80%+ test coverage
- [ ] Zero TypeScript errors
- [ ] Consistent code formatting and documentation

### Maintainability

- [ ] Clear separation of concerns
- [ ] Reusable components and patterns
- [ ] Comprehensive documentation

---

## 📞 Support & Questions

For questions about this refactoring guide:

1. Check the [NestJS Documentation](https://docs.nestjs.com/)
2. Review existing code patterns in the codebase
3. Consult with the development team

**Last Updated**: 2025-11-07
**Version**: 1.0
**Maintainer**: Backend Development Team
