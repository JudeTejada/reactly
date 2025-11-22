# Reactly Backend API

NestJS backend with AI sentiment analysis, Clerk authentication, and comprehensive feedback management.

## 🎯 Features

- ✅ AI-powered sentiment analysis (OpenAI)
- ✅ Clerk JWT authentication
- ✅ API key authentication for public endpoints
- ✅ Feedback CRUD operations
- ✅ Project management with API keys
- ✅ Analytics and trends
- ✅ Discord webhook notifications
- ✅ Swagger API documentation
- ✅ Rate limiting and CORS
- ✅ Drizzle ORM with PostgreSQL

## 📁 Project Structure

```
src/
├── ai/                    # AI sentiment analysis service
│   ├── ai.module.ts
│   └── ai.service.ts
├── auth/                  # Authentication guards and decorators
│   ├── auth.module.ts
│   ├── clerk-auth.guard.ts
│   ├── api-key.guard.ts
│   └── decorators.ts
├── feedback/              # Feedback management
│   ├── feedback.module.ts
│   ├── feedback.controller.ts
│   └── feedback.service.ts
├── projects/              # Project management
│   ├── projects.module.ts
│   ├── projects.controller.ts
│   └── projects.service.ts
├── analytics/             # Analytics and reporting
│   ├── analytics.module.ts
│   ├── analytics.controller.ts
│   └── analytics.service.ts
├── webhook/               # Discord webhook integration
│   ├── webhook.module.ts
│   └── webhook.service.ts
├── db/                    # Database
│   ├── schema.ts          # Drizzle schema
│   ├── index.ts           # DB client
│   └── migrate.ts         # Migration runner
├── common/
│   └── filters/
│       └── http-exception.filter.ts
├── app.module.ts          # Root module
├── main.ts                # Application entry point
└── health.controller.ts   # Health check endpoint
```

## 🚀 Getting Started

### 1. Environment Variables

Create `.env` file:

```bash
# Server
PORT=3001
NODE_ENV=development

# Database (NeonDB)
DATABASE_URL=postgresql://user:password@host/database

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Discord (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 2. Database Setup

#### Option A: Local Development with Docker (Recommended)

```bash
# Setup local environment
pnpm db:setup:local

# This will:
# 1. Copy .env.local to .env (for local PostgreSQL config)
# 2. Start PostgreSQL in Docker container

# Generate migration from schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (GUI)
pnpm db:studio
```

#### Option B: Production with NeonDB

```bash
# Configure .env with your NeonDB URL
# DATABASE_URL=postgresql://user:password@host:5432/reactly

# Generate migration from schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (GUI)
pnpm db:studio
```

#### Docker Database Commands

```bash
# Start PostgreSQL container
pnpm db:docker:start

# Stop PostgreSQL container
pnpm db:docker:stop

# Reset database (deletes all data)
pnpm db:docker:reset

# View container logs
pnpm db:docker:logs
```

### 3. Client Connection

You can connect to the local PostgreSQL database with any client using:

- **Host**: localhost
- **Port**: 5432
- **Database**: reactly_dev
- **Username**: postgres
- **Password**: postgres

**Popular Clients:**

- TablePlus
- PgAdmin
- DBeaver
- VS Code PostgreSQL extension
- psql CLI: `psql -h localhost -U postgres -d reactly_dev`

### 4. Development

```bash
# Start development server (watch mode)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod
```

## 📡 API Endpoints

### Public Endpoints

#### POST `/api/feedback`

Submit feedback (requires API key)

**Headers:**

- `x-api-key`: Project API key
- `x-project-id`: Project ID

**Body:**

```json
{
  "text": "Great product!",
  "rating": 5,
  "category": "praise",
  "metadata": {}
}
```

### Protected Endpoints (Clerk Auth)

#### Projects

- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/regenerate-key` - Regenerate API key
- `POST /api/projects/:id/toggle-active` - Toggle active status
- `DELETE /api/projects/:id` - Delete project

#### Feedback

- `GET /api/feedback` - List feedback (with filters)
- `GET /api/feedback/:id` - Get single feedback
- `DELETE /api/feedback/:id` - Delete feedback

**Query Parameters:**

- `projectId` - Filter by project
- `sentiment` - Filter by sentiment (positive/negative/neutral)
- `category` - Filter by category
- `search` - Search in feedback text
- `startDate` - Filter from date
- `endDate` - Filter to date
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 20, max: 100)

#### Analytics

- `GET /api/analytics/overview` - Overall statistics
- `GET /api/analytics/trends` - Sentiment trends over time
- `GET /api/analytics/recent` - Recent feedback

**Query Parameters:**

- `projectId` - Filter by project
- `startDate` - Filter from date
- `endDate` - Filter to date
- `days` - Number of days for trends (default: 30)
- `limit` - Limit for recent feedback (default: 10)

### Health Check

- `GET /health` - Health check with database status
- `GET /` - API information

## 📚 API Documentation

Interactive Swagger documentation available at:

```
http://localhost:3001/api/docs
```

## 🔒 Authentication

### Clerk Authentication (User Endpoints)

Protected endpoints require a Bearer token from Clerk:

```bash
Authorization: Bearer <clerk_token>
```

The backend verifies the token with Clerk's API and extracts user information.

### API Key Authentication (Widget Endpoints)

Public feedback submission requires API key authentication:

```bash
x-api-key: rly_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x-project-id: uuid-project-id
```

## 🤖 AI Sentiment Analysis

The AI service uses OpenAI GPT-3.5-turbo to analyze feedback sentiment:

- **Sentiment:** positive, negative, or neutral
- **Confidence Score:** 0-1 representing confidence
- **Fallback:** Keyword-based analysis if OpenAI fails

Negative feedback (sentiment or rating ≤ 2) triggers Discord notifications if configured.

## 🗄️ Database Schema

### Users Table

- `id` (UUID)
- `clerkUserId` (unique)
- `email`
- `name`
- `plan` (free/pro/enterprise)
- `createdAt`, `updatedAt`

### Projects Table

- `id` (UUID)
- `name`
- `apiKey` (unique)
- `userId` (FK to users)
- `allowedDomains` (JSON array)
- `webhookUrl`
- `isActive`
- `createdAt`, `updatedAt`

### Feedback Table

- `id` (UUID)
- `projectId` (FK to projects)
- `text`
- `rating` (1-5)
- `category`
- `sentiment` (positive/negative/neutral)
- `sentimentScore`
- `metadata` (JSON)
- `createdAt`, `updatedAt`

## 🚀 Deployment

### Railway

1. Create new project on Railway
2. Add PostgreSQL database (or use NeonDB)
3. Set environment variables
4. Deploy from GitHub or Railway CLI

```bash
# Deploy with Railway CLI
railway up
```

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📊 Performance

- **Rate Limiting:** 100 requests per minute per IP
- **CORS:** Configurable allowed origins
- **Validation:** Automatic request validation with class-validator
- **Error Handling:** Global exception filter with detailed logging

## 🔧 Troubleshooting

### Database Connection Error

Check `DATABASE_URL` in `.env` and ensure the database is accessible.

### OpenAI API Error

The service falls back to keyword-based sentiment analysis if OpenAI fails.

### Clerk Authentication Error

Verify `CLERK_SECRET_KEY` is correct and token is valid.

## 📝 License

MIT
