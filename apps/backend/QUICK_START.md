# Backend Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Environment Setup (1 min)

Create `.env` file in `apps/backend/`:

```bash
PORT=3001
DATABASE_URL=your_neondb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
OPENAI_API_KEY=your_openai_api_key
ALLOWED_ORIGINS=http://localhost:3000
```

**Get your credentials:**

- **NeonDB**: https://neon.tech (free tier, instant setup)
- **Clerk**: https://clerk.com (free tier, copy secret key from dashboard)
- **OpenAI**: https://platform.openai.com/api-keys

### Step 2: Database Setup (2 min)

```bash
cd apps/backend

# Generate migration from schema
pnpm db:generate

# Run migration to create tables
pnpm db:migrate
```

### Step 3: Start the Server (1 min)

```bash
# Development mode with hot reload
pnpm dev
```

You should see:

```
🚀 Server running on http://localhost:3001
📚 API docs: http://localhost:3001/api/docs
❤️  Health check: http://localhost:3001/health
```

### Step 4: Verify (1 min)

Open in browser:

- **API Docs**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

Or use curl:

```bash
curl http://localhost:3001/health
```

## 🎯 Next Steps

### Test with Swagger UI

1. Go to http://localhost:3001/api/docs
2. Click on any endpoint
3. Click "Try it out"
4. Enter test data
5. Execute

### Create Your First Project

You'll need a Clerk account and user token for this. Once you have the web app running with Clerk auth:

1. Sign up/sign in through the web app
2. The token will be in the Authorization header
3. Use it to call `POST /api/projects`

### Or Test Public Endpoints

The feedback submission endpoint doesn't require Clerk auth, just an API key:

```bash
# First, manually create a project in the database
# Then use the API key to submit feedback

curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_project_api_key" \
  -H "x-project-id: your_project_id" \
  -d '{
    "text": "This is amazing!",
    "rating": 5,
    "category": "praise"
  }'
```

## 🐛 Troubleshooting

### Database Connection Failed

- Check your `DATABASE_URL` is correct
- Ensure NeonDB instance is running
- Test connection with `pnpm db:studio`

### OpenAI API Error

- Verify `OPENAI_API_KEY` is valid
- Check you have credits in your OpenAI account
- The system will fall back to keyword-based sentiment analysis

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti :3001 | xargs kill -9

# Or use a different port in .env
PORT=3002
```

### Migration Errors

```bash
# Reset and try again
rm -rf drizzle/
pnpm db:generate
pnpm db:migrate
```

## 📚 Useful Commands

```bash
# Development
pnpm dev                # Start with watch mode
pnpm build              # Build for production
pnpm start:prod         # Run production build

# Database
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Drizzle Studio

# Code Quality
pnpm lint               # Run ESLint
pnpm type-check         # TypeScript check
```

## 🎉 You're Ready!

The backend is now running and ready to accept requests. Next up: build the frontend dashboard to interact with these APIs!
