# Backend Troubleshooting Guide

## Common Errors and Solutions

### 1. Module Not Found: @reactly/shared

**Error:**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '@reactly/shared'
```

**Solution:**
Build the shared package first:

```bash
# From root
pnpm build --filter @reactly/shared

# Or from shared package
cd packages/shared
pnpm build
```

The shared package needs to be compiled to JavaScript before the backend can import it.

### 2. Database Connection Error

**Error:**

```
Error: Connection terminated unexpectedly
```

**Solution:**

1. Check your `DATABASE_URL` in `.env`
2. Ensure NeonDB instance is running
3. Test connection:
   ```bash
   pnpm db:studio
   ```

### 3. Clerk Authentication Error

**Error:**

```
UnauthorizedException: Invalid authentication token
```

**Solution:**

1. Verify `CLERK_SECRET_KEY` in `.env` is correct
2. Check the token format (should be `Bearer <token>`)
3. Ensure Clerk dashboard settings match your app

### 4. OpenAI API Error

**Error:**

```
Failed to analyze sentiment with OpenAI
```

**Solution:**
The system will automatically fall back to keyword-based analysis. To fix:

1. Check `OPENAI_API_KEY` in `.env`
2. Verify you have credits in your OpenAI account
3. Check API key permissions

### 5. TypeScript Compilation Errors

**Error:**

```
error TS2307: Cannot find module '@reactly/shared'
```

**Solution:**

1. Build shared package first
2. Restart TypeScript server
3. Check tsconfig paths are correct

### 6. Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

```bash
# Find process using port 3001
lsof -ti :3001

# Kill the process
lsof -ti :3001 | xargs kill -9

# Or use a different port in .env
PORT=3002
```

## Development Workflow

### Starting Fresh

```bash
# 1. Clean everything
pnpm clean

# 2. Install dependencies
pnpm install

# 3. Build shared package
pnpm build --filter @reactly/shared

# 4. Run migrations
cd apps/backend
pnpm db:migrate

# 5. Start backend
pnpm dev
```

### After Schema Changes

```bash
cd apps/backend

# 1. Generate new migration
pnpm db:generate

# 2. Review migration in drizzle/ folder

# 3. Run migration
pnpm db:migrate

# 4. Restart server
```

### Before Committing

```bash
# Run from root
pnpm type-check    # Check TypeScript
pnpm lint          # Run linting
pnpm build         # Build everything
```

## Environment Variables Checklist

Make sure you have all required variables in `apps/backend/.env`:

- [ ] `DATABASE_URL` - NeonDB connection string
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `PORT` - Server port (default: 3001)
- [ ] `ALLOWED_ORIGINS` - CORS origins
- [ ] `DISCORD_WEBHOOK_URL` - (Optional) Discord webhook

## Testing Checklist

- [ ] Health check: `curl http://localhost:3001/health`
- [ ] API docs: Open http://localhost:3001/api/docs
- [ ] Database connection: `pnpm db:studio`
- [ ] Test sentiment analysis: Submit feedback via Swagger

## Getting Help

1. Check logs in terminal
2. Review Swagger docs at `/api/docs`
3. Test with curl or Postman
4. Check database with Drizzle Studio

## Performance Tips

1. **Keep shared package built**: Always run `pnpm build --filter @reactly/shared` after changes
2. **Use Turbo**: Run `pnpm dev` from root to leverage Turborepo caching
3. **Database indexes**: Consider adding indexes for frequently queried fields
4. **Connection pooling**: NeonDB handles this automatically

## Debugging

### Enable Debug Logging

The server already logs to console. Check terminal output for:

- Request logs
- Error messages
- SQL queries (in development)

### Check What's Running

```bash
# Check if backend is running
lsof -i :3001

# Check all Node processes
ps aux | grep node

# Check backend logs
# (logs appear in terminal where you ran pnpm dev)
```

### Test Individual Endpoints

```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/

# Submit feedback (needs API key)
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-key" \
  -H "x-project-id: your-project-id" \
  -d '{"text":"Test","rating":5,"category":"other"}'
```
