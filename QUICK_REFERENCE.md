# Reactly - Quick Reference

## 📁 Project Structure

```
reactly/
├── apps/
│   ├── backend/          # NestJS API (Port 3001)
│   ├── web/              # Next.js App (Port 3000)
│   └── widget/           # Vite React Widget (Port 5173)
└── packages/
    └── shared/           # Shared types and utilities
```

## 🚀 Essential Commands

```bash
# Development (start all)
pnpm dev

# Individual apps
cd apps/backend && pnpm dev
cd apps/web && pnpm dev
cd apps/widget && pnpm dev

# Build all
pnpm build

# Type check
pnpm type-check

# Database
cd apps/backend
pnpm db:generate    # Generate migrations from schema changes
pnpm db:migrate     # Run pending migrations
pnpm db:studio      # Open Drizzle Studio GUI
```

## 🗂️ Key Files

### Backend

- `apps/backend/src/db/schema.ts` - Database tables
- `apps/backend/src/main.ts` - App entry + Swagger
- `apps/backend/.env` - Environment variables

### Web App

- `apps/web/app/layout.tsx` - Root layout
- `apps/web/middleware.ts` - Auth protection
- `apps/web/app/globals.css` - Styles
- `apps/web/.env.local` - Environment variables

### Widget

- `apps/widget/src/components/FeedbackWidget.tsx` - Main component
- `apps/widget/src/embed.ts` - Embed script
- `apps/widget/vite.config.ts` - Build config

### Shared

- `packages/shared/src/types.ts` - TypeScript interfaces
- `packages/shared/src/utils.ts` - Helper functions

## 🔧 Configuration Files

| File                  | Purpose               |
| --------------------- | --------------------- |
| `package.json`        | Root workspace config |
| `pnpm-workspace.yaml` | Workspace packages    |
| `turbo.json`          | Build pipeline config |
| `.nvmrc`              | Node version (22)     |
| `.prettierrc`         | Code formatting       |

## 📦 Adding Dependencies

```bash
# Root dependencies (devDependencies only)
pnpm add -D -w <package>

# App-specific dependencies
pnpm add <package> --filter @reactly/web
pnpm add <package> --filter @reactly/backend
pnpm add <package> --filter @reactly/widget
pnpm add <package> --filter @reactly/shared
```

## 🎨 Adding shadcn/ui Components

```bash
cd apps/web
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add table
# etc...
```

## 🗄️ Database Workflow

```bash
# 1. Modify schema
# Edit apps/backend/src/db/schema.ts

# 2. Generate migration
cd apps/backend
pnpm db:generate

# 3. Review migration
# Check drizzle/ folder

# 4. Run migration
pnpm db:migrate

# 5. Verify
pnpm db:studio
```

## 🔐 Environment Variables

### Backend (.env)

```bash
PORT=3001
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
DISCORD_WEBHOOK_URL=https://...
ALLOWED_ORIGINS=http://localhost:3000
```

### Web (.env.local)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🧪 Testing Widget Locally

```html
<!-- Create test.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Widget Test</title>
  </head>
  <body>
    <h1>My App</h1>

    <!-- Widget auto-initializes -->
    <script
      src="http://localhost:5173/src/embed.ts"
      type="module"
      data-reactly-api-key="demo-key"
      data-reactly-project-id="demo-project"
      data-position="bottom-right"
    ></script>
  </body>
</html>
```

## 📝 Creating New Modules

### Backend (NestJS)

```bash
cd apps/backend

# Generate module, controller, service
nest g module moduleName
nest g controller moduleName
nest g service moduleName
```

### Web (Next.js Pages)

```bash
cd apps/web

# Create new page
mkdir -p app/new-page
touch app/new-page/page.tsx

# Create API route
mkdir -p app/api/route-name
touch app/api/route-name/route.ts
```

## 🎯 API Endpoints (Planned)

### Public Endpoints

- POST `/api/feedback` - Submit feedback (requires API key)

### Protected Endpoints (Clerk auth)

- GET `/api/feedback` - List feedback
- GET `/api/feedback/:id` - Get single feedback
- GET `/api/projects` - List projects
- POST `/api/projects` - Create project
- GET `/api/projects/:id` - Get project
- PUT `/api/projects/:id` - Update project
- POST `/api/projects/:id/regenerate-key` - New API key
- GET `/api/analytics/overview` - Dashboard stats
- GET `/api/analytics/sentiment` - Sentiment distribution
- GET `/api/analytics/trends` - Time series

### API Documentation

Once backend is running: http://localhost:3001/api/docs

## 🔍 Debugging

```bash
# Check if services are running
lsof -i :3000  # Next.js
lsof -i :3001  # NestJS
lsof -i :5173  # Vite

# Check logs
cd apps/backend && pnpm dev  # Backend logs
cd apps/web && pnpm dev      # Next.js logs

# TypeScript errors
pnpm type-check

# Build errors
pnpm build
```

## 📚 Important URLs (when running)

| Service            | URL                            |
| ------------------ | ------------------------------ |
| Web App            | http://localhost:3000          |
| Backend API        | http://localhost:3001          |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| Widget Dev         | http://localhost:5173          |
| Drizzle Studio     | http://localhost:4983          |

## 🎨 Color Scheme (Tailwind)

```javascript
// Primary: Blue
bg-primary       // #222222 (dark)
text-primary-foreground

// Accent colors from globals.css
--primary: 222.2 47.4% 11.2%
--secondary: 210 40% 96.1%
--accent: 210 40% 96.1%
--destructive: 0 84.2% 60.2%
```

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [Clerk Auth](https://clerk.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)
- [OpenAI API](https://platform.openai.com/docs)

## 💡 Tips

1. **Use Turbo:** Run `pnpm dev` at root to start everything
2. **Hot Reload:** All apps support hot module replacement
3. **Type Safety:** Import types from `@reactly/shared`
4. **Shared Code:** Add utilities to `packages/shared`
5. **Debugging:** Use `console.log` - they appear in respective terminals
6. **Database:** Always generate migrations after schema changes
7. **API Testing:** Use Swagger UI at `/api/docs`
8. **Widget Testing:** Use `src/main.tsx` for development

## 🚨 Common Issues

### "Module not found: @reactly/shared"

```bash
pnpm install
```

### Database connection error

- Check DATABASE_URL in apps/backend/.env
- Ensure NeonDB instance is running
- Test connection with Drizzle Studio

### Clerk authentication not working

- Check API keys in .env files
- Ensure middleware.ts has correct public routes
- Verify Clerk dashboard settings

### Build errors

```bash
# Clean and rebuild
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
pnpm build
```

### Port already in use

```bash
# Kill process on port
lsof -ti :3000 | xargs kill -9
lsof -ti :3001 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```
