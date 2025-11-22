# Reactly - Setup Guide

## 🎯 What's Been Set Up

### 1. **Monorepo Structure** ✅

- pnpm workspaces with Turborepo
- Node 22 configuration
- Shared packages architecture

### 2. **Apps**

#### **Web App** (`apps/web`) ✅

- Next.js 15 with App Router
- Clerk authentication configured
- TailwindCSS + shadcn/ui ready
- TypeScript setup
- Route middleware for protected pages

#### **Backend API** (`apps/backend`) ✅

- NestJS with TypeScript
- Drizzle ORM configured for NeonDB
- Database schema (users, projects, feedback)
- Swagger API documentation ready
- Environment variables template

#### **Widget** (`apps/widget`) ✅

- Vite + React (optimized for embedding)
- Feedback form component
- Multiple embed options (npm + script tag)
- Customizable theme and position
- CSS animations and responsive design

### 3. **Shared Package** (`packages/shared`) ✅

- TypeScript types and interfaces
- Zod validation schemas
- Utility functions
- Database schema types

## 🚀 Next Steps

### 1. Environment Setup

#### Backend (`apps/backend/.env`)

```bash
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/reactly
CLERK_SECRET_KEY=sk_test_xxxxx
OPENAI_API_KEY=sk-xxxxx
ALLOWED_ORIGINS=http://localhost:3000
```

#### Web App (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Database Migration

```bash
cd apps/backend
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
```

### 3. Development

Start all apps:

```bash
pnpm dev
```

Or start individually:

```bash
# Backend API
cd apps/backend && pnpm dev

# Web App
cd apps/web && pnpm dev

# Widget
cd apps/widget && pnpm dev
```

### 4. What to Build Next

#### Backend Modules (Priority Order)

1. ✅ Database schema created
2. ⏳ Auth guard with Clerk
3. ⏳ AI sentiment service (OpenAI integration)
4. ⏳ Feedback API endpoints (POST, GET)
5. ⏳ Projects API endpoints (CRUD)
6. ⏳ Analytics endpoints
7. ⏳ Discord webhook service

#### Frontend Pages (Priority Order)

1. ⏳ Landing page (hero, features, CTA)
2. ⏳ Pricing page
3. ⏳ Dashboard overview
4. ⏳ Feedback list with filters
5. ⏳ Analytics with charts
6. ⏳ Projects management (API keys)
7. ⏳ Settings page

#### Widget Enhancements

1. ✅ Basic feedback form
2. ⏳ Testing with real API
3. ⏳ CDN deployment configuration
4. ⏳ npm package publishing

## 📦 Available Scripts

```bash
# Root level
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm type-check   # TypeScript check all apps

# Backend
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio

# Web
pnpm dev          # Next.js dev server
pnpm build        # Production build

# Widget
pnpm dev          # Vite dev server
pnpm build        # Build widget bundle
```

## 🔧 Tech Stack Summary

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Monorepo   | pnpm + Turborepo                             |
| Frontend   | Next.js 15, React 18, TailwindCSS, shadcn/ui |
| Backend    | NestJS, TypeScript                           |
| Database   | PostgreSQL (NeonDB) + Drizzle ORM            |
| Auth       | Clerk                                        |
| AI         | OpenAI API                                   |
| Widget     | Vite + React                                 |
| Deployment | Vercel (frontend), Railway (backend)         |

## 📝 File Structure

```
reactly/
├── apps/
│   ├── web/              # Next.js main app
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities
│   │   └── middleware.ts # Clerk auth
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── db/       # Drizzle schema & migrations
│   │   │   ├── feedback/ # Feedback module
│   │   │   ├── projects/ # Projects module
│   │   │   ├── ai/       # AI service
│   │   │   └── main.ts   # Entry point
│   │   └── drizzle/      # Migration files
│   └── widget/           # Embeddable widget
│       └── src/
│           ├── components/
│           └── embed.ts   # Initialization script
└── packages/
    └── shared/           # Shared types & utilities
        └── src/
            ├── types.ts
            ├── schema.ts
            └── utils.ts
```

## 🎨 Design Decisions

1. **Monorepo**: Easier code sharing, type safety across apps
2. **Next.js 15**: Latest features, App Router for better DX
3. **Clerk**: Best-in-class auth, minimal setup
4. **Drizzle ORM**: Type-safe, lightweight, great for serverless
5. **Vite**: Fast builds, small bundle size for widget
6. **shadcn/ui**: Copy-paste components, full customization

## 🚢 Deployment

### Backend (Railway)

1. Create new project on Railway
2. Add NeonDB PostgreSQL
3. Set environment variables
4. Deploy from `apps/backend`

### Frontend (Vercel)

1. Import GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add environment variables
4. Deploy

### Widget (CDN)

1. Build: `cd apps/widget && pnpm build`
2. Upload `dist/widget.umd.js` to CDN or Vercel
3. Users include via script tag

## ⚡ Quick Commands

```bash
# Install all dependencies
pnpm install

# Start development
pnpm dev

# Build everything
pnpm build

# Add new backend module
cd apps/backend
nest g module moduleName
nest g controller moduleName
nest g service moduleName

# Add shadcn component
cd apps/web
pnpm dlx shadcn@latest add button
```
