# Reactly - AI-Driven Feedback Platform

**TypeScript monorepo for AI-powered user feedback & sentiment analysis SaaS**

## Project Overview

Reactly is a complete full-stack SaaS platform that allows users to collect, analyze, and understand user feedback with AI-powered sentiment analysis. The system consists of three main components:

1. **Next.js Web App** - Admin dashboard, marketing pages, and user authentication
2. **NestJS Backend** - API server with AI sentiment analysis and project management
3. **React Widget** - Embeddable feedback collection widget for customer websites

## Architecture

```
reactly/
├── apps/
│   ├── backend/          # NestJS API (Port 3001)
│   │   ├── src/          # Controllers, services, modules
│   │   ├── drizzle/      # Database migrations
│   │   └── .env          # Environment variables
│   ├── web/              # Next.js App (Port 3000)
│   │   ├── app/          # App Router structure
│   │   ├── components/   # UI components (shadcn/ui)
│   │   └── .env.local    # Environment variables
│   └── widget/           # Vite React Widget (Port 5173)
│       ├── src/          # Widget components and embed script
│       └── vite.config.ts
└── packages/
    └── shared/           # Shared TypeScript types, schemas, utilities
```

## Tech Stack

### Frontend (apps/web)
- **Next.js 15** - App Router, React 19, Server Components
- **TailwindCSS** + **shadcn/ui** - Design system
- **Clerk** - Authentication
- **TanStack Query** - Data fetching & caching
- **Recharts** - Data visualization
- **Framer Motion** - Animations

### Backend (apps/backend)
- **NestJS** - Node.js framework with TypeScript
- **PostgreSQL** - Database with NeonDB
- **Drizzle ORM** - Type-safe database operations
- **OpenAI API** - GPT-3.5 for sentiment analysis
- **Clerk JWT** + **API Keys** - Dual authentication
- **Discord Webhooks** - Notifications for negative feedback

### Widget (apps/widget)
- **Vite** - Fast build tool
- **React 18** - Component library for embedding
- **Zod** - Runtime validation

### Development
- **pnpm Workspaces** - Dependency management
- **Turborepo** - Build system with caching
- **TypeScript** - 100% type safety
- **ESLint** + **Prettier** - Code formatting

## Essential Commands

```bash
# Development (start all services)
pnpm dev                    # Start all apps on ports 3000, 3001, 5173

# Individual apps
cd apps/backend && pnpm dev    # Backend API
cd apps/web && pnpm dev        # Next.js frontend
cd apps/widget && pnpm dev     # Widget dev server

# Build and type check
pnpm build                   # Build all packages for production
pnpm type-check              # TypeScript type checking across all apps
pnpm lint                   # ESLint across all packages
pnpm format                 # Format code with Prettier

# Database operations
cd apps/backend
pnpm db:generate            # Generate migrations from schema changes
pnpm db:migrate             # Run pending database migrations
pnpm db:push                # Push schema changes directly
pnpm db:studio              # Open Drizzle Studio GUI

# Clean
pnpm clean                  # Clean all build artifacts
```

## Database Architecture

The backend uses Drizzle ORM with three main tables:

- **`users`** - Clerk user integration with plan management
- **`projects`** - Project management with API key generation and domain restrictions
- **`feedback`** - Feedback entries with AI-analyzed sentiment scores

### Database Workflow
1. Modify schema in `apps/backend/src/db/schema.ts`
2. Generate migration: `cd apps/backend && pnpm db:generate`
3. Apply migration: `pnpm db:migrate`
4. Verify with: `pnpm db:studio`

## Authentication

### Dual Auth System
1. **User Authentication** - Clerk JWT tokens (`Authorization: Bearer <token>`)
2. **Widget Authentication** - API keys (`x-api-key` and `x-project-id` headers)

### Environment Variables

#### Backend (.env)
```bash
PORT=3001
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
DISCORD_WEBHOOK_URL=https://...
ALLOWED_ORIGINS=http://localhost:3000
```

#### Web (.env.local)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Design

### Public Endpoints (API Key Auth)
- `POST /api/feedback` - Submit feedback from widget

### Protected Endpoints (Clerk Auth)
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `POST /api/projects/:id/regenerate-key` - Regenerate API key
- `GET /api/feedback` - List feedback with filters
- `GET /api/analytics/overview` - Dashboard statistics
- `GET /api/analytics/trends` - Sentiment trends

API Documentation available at: `http://localhost:3001/api/docs`

## Key Patterns

### Shared Types
All TypeScript interfaces, types, and Zod schemas are in `packages/shared/src/types.ts`. Import from `@reactly/shared`:

```typescript
import { Feedback, Project, SubmitFeedbackDto } from '@reactly/shared'
```

### Error Handling
- Global HTTP exception filter in backend
- Comprehensive validation with class-validator
- API responses follow consistent structure with success/error fields

### Widget Integration
The widget is distributed as ES modules and UMD bundles for maximum compatibility. Configuration via data attributes:

```html
<script data-reactly-api-key="key" data-reactly-project-id="project" data-position="bottom-right"></script>
```

## Development Workflow

1. **Setup**: Install dependencies with `pnpm install`
2. **Environment**: Configure environment variables in respective `.env` files
3. **Database**: Run migrations with `cd apps/backend && pnpm db:migrate`
4. **Development**: Start all services with `pnpm dev`
5. **Testing**: Use available dev servers and built-in type checking

## Important Notes

- Node.js 22.0+ required with pnpm 9.0+
- All timestamps use UTC timezone
- AI sentiment analysis is asynchronous - feedback can be created before analysis completes
- API keys automatically generated with `rly_` prefix
- Rate limiting implemented (100 requests/minute per IP)
- Global prefix `/api` for all backend endpoints

## Key URLs (when running)

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs | http://localhost:3001/api/docs |
| Widget Dev | http://localhost:5173 |
| Drizzle Studio | http://localhost:4983 |

## Debugging

```bash
# Check running processes
lsof -i :3000  # Next.js
lsof -i :3001  # NestJS
lsof -i :5173  # Vite

# Clean rebuild if issues
rm -rf node_modules && pnpm install && pnpm build
```

## Adding New Features

### Backend (NestJS)
```bash
cd apps/backend
nest g module moduleName
nest g controller controllerName  
nest g service serviceName
```

### Frontend (Next.js)
```bash
# Create new page
mkdir -p app/new-page
touch app/new-page/page.tsx

# Create API route
mkdir -p app/api/route-name
touch app/api/route-name/route.ts

# Add shadcn/ui components
cd apps/web && pnpm dlx shadcn@latest add button card table
```
