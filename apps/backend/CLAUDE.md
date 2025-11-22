# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev              # Start development server with watch mode
pnpm build            # Build for production
pnpm start:prod       # Start production server
pnpm lint             # Run ESLint with auto-fix
pnpm type-check       # Run TypeScript type checking

# Database Operations
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to database
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:seed          # Seed database with sample data

# Testing (when implemented)
pnpm test             # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:cov         # Run test coverage
```

## Architecture Overview

This is a NestJS backend for AI-powered feedback management with the following key architectural components:

### Core Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Dual auth system - Clerk JWT for users, API keys for public endpoints
- **AI Integration**: OpenAI GPT-3.5-turbo for sentiment analysis with keyword fallback
- **API Documentation**: Swagger with interactive docs at `/api/docs`

### Module Structure

The application follows NestJS's modular architecture:

- **`ai/`** - Sentiment analysis service using OpenAI API
- **`auth/`** - Dual authentication system (Clerk + API keys)
- **`feedback/`** - Feedback CRUD operations and management
- **`projects/`** - Project management with API key generation
- **`analytics/`** - Analytics and trends reporting
- **`webhook/`** - Discord webhook integration for notifications
- **`db/`** - Database schema, client, and migrations

### Database Schema

Uses Drizzle ORM with three main tables:

- **users** - Clerk user integration with plan management
- **projects** - API key management and domain restrictions
- **feedback** - Feedback entries with AI-analyzed sentiment

### Authentication Flow

1. **User endpoints**: Clerk JWT verification (`Bearer` token)
2. **Widget endpoints**: API key authentication (`x-api-key` and `x-project-id` headers)
3. Guards implement both authentication methods

### AI Sentiment Analysis

- Primary: OpenAI GPT-3.5-turbo analysis
- Fallback: Keyword-based sentiment detection
- Results stored with confidence scores
- Negative feedback triggers Discord webhooks

## Key Patterns

### Environment Configuration

**Always use NestJS ConfigService for accessing environment variables** in services and controllers:

```typescript
constructor(private configService: ConfigService) {}

// Get configuration values
const dbUrl = this.configService.get<string>('DATABASE_URL');
const clerkSecret = this.configService.get<string>('CLERK_SECRET_KEY');
```

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection
- `CLERK_SECRET_KEY` - Clerk authentication
- `CLERK_WEBHOOK_SECRET` - Clerk webhook verification
- `GLM_API_KEY` - AI sentiment analysis (optional)
- `DISCORD_WEBHOOK_URL` - Optional notifications
- `ALLOWED_ORIGINS` - CORS configuration

### API Design

- RESTful endpoints with `/api` global prefix
- Comprehensive query filtering and pagination
- Global validation with class-validator
- Rate limiting (100 requests/minute per IP)
- Global exception handling

### Error Handling

Global HTTP exception filter in `src/common/filters/http-exception.filter.ts`

## Development Workflow

1. Set up environment variables in `.env.local` (use `.env.example` as template)
2. **IMPORTANT**: Use ConfigService to access environment variables in code
3. Run database migrations: `pnpm db:migrate`
4. Start development server: `pnpm dev`
5. Access API docs at `http://localhost:3001/api/docs`

## Configuration Best Practices

- **NEVER** access `process.env` directly in services/controllers
- **ALWAYS** inject `ConfigService` and use `this.configService.get()`
- ConfigService is globally available through `@Global()` ConfigModule
- Environment validation is handled automatically in `app.module.ts`

## Important Notes

- Uses workspace package `@reactly/shared` for shared types/constants
- Database migrations must be generated after schema changes
- API keys are automatically generated with `rly_` prefix
- Sentiment analysis is asynchronous - feedback can be created before analysis completes
- All timestamps use UTC timezone
