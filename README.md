# Reactly 🚀

**AI-Driven User Feedback & Sentiment Analysis SaaS Platform**

A complete, production-ready full-stack application for collecting, analyzing, and understanding user feedback with AI-powered sentiment analysis.

![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Features
- ✅ **AI Sentiment Analysis** - OpenAI-powered emotion detection
- ✅ **Embeddable Widget** - Copy-paste feedback collection
- ✅ **Beautiful Dashboard** - Modern UI with charts & analytics
- ✅ **Real-time Notifications** - Discord webhooks for negative feedback
- ✅ **Advanced Filtering** - Search, filter, and export feedback
- ✅ **Multi-Project Management** - Organize feedback by project
- ✅ **API Key Authentication** - Secure widget integration
- ✅ **Clerk Authentication** - Seamless user management

### 📊 Analytics
- Sentiment distribution (positive/negative/neutral)
- Category breakdown (bugs, features, improvements, etc.)
- Trend analysis over time
- Average ratings and statistics
- Recent feedback monitoring

## 🏗️ Architecture

### Monorepo Structure
```
reactly/
├── apps/
│   ├── web/          # Next.js 15 Dashboard & Marketing
│   ├── backend/      # NestJS API Server
│   └── widget/       # Embeddable React Widget
└── packages/
    └── shared/       # Shared TypeScript types & utilities
```

## 🛠️ Tech Stack

### Frontend (apps/web)
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** TailwindCSS + shadcn/ui
- **Auth:** Clerk
- **Data Fetching:** TanStack React Query
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend (apps/backend)
- **Framework:** NestJS
- **Database:** PostgreSQL (NeonDB)
- **ORM:** Drizzle
- **AI:** OpenAI GPT-3.5
- **Auth:** Clerk JWT + API Keys
- **Webhooks:** Discord

### Widget (apps/widget)
- **Build Tool:** Vite
- **Framework:** React 18
- **Validation:** Zod

### Shared
- **TypeScript** - 100% type-safe
- **pnpm Workspaces** - Dependency management
- **Turborepo** - Build system

## 🚀 Quick Start

### Prerequisites
```bash
node >= 22.0.0
pnpm >= 9.0.0
```

### Installation

1. **Clone & Install**
```bash
git clone <your-repo-url>
cd reactly
pnpm install
```

2. **Configure Backend** (`apps/backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@host/db
CLERK_SECRET_KEY=sk_test_xxxxx
OPENAI_API_KEY=sk-xxxxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx (optional)
```

3. **Configure Frontend** (`apps/web/.env.local`)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. **Run Database Migrations**
```bash
cd apps/backend
pnpm db:migrate
```

5. **Start All Services**
```bash
cd ../..
pnpm dev
```

Access:
- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs
- **Widget:** http://localhost:5173

## 📁 Project Structure

### Web App (apps/web)
```
app/
├── (marketing)/       # Public pages
│   ├── page.tsx      # Landing page
│   ├── features/     # Features showcase
│   └── pricing/      # Pricing tiers
├── (auth)/           # Sign in/up
├── (dashboard)/      # Protected pages
│   ├── dashboard/    # Overview
│   ├── feedback/     # Feedback list
│   ├── analytics/    # Charts & insights
│   ├── projects/     # Project management
│   └── settings/     # User settings
components/
├── ui/               # shadcn/ui components (18)
└── dashboard/        # Custom components
lib/
├── api.ts           # API client
├── constants.ts     # App constants
└── utils.ts         # Utilities
hooks/
├── use-projects.ts
├── use-feedback.ts
└── use-analytics.ts
```

### Backend (apps/backend)
```
src/
├── ai/              # OpenAI sentiment service
├── auth/            # Clerk & API key guards
├── feedback/        # Feedback CRUD
├── projects/        # Project management
├── analytics/       # Stats & trends
├── webhook/         # Discord notifications
├── db/              # Drizzle schema & client
└── common/          # Filters & utilities
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | Detailed setup instructions |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Implementation progress |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Command cheat sheet |
| [BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md) | Backend implementation details |
| [WEB_APP_COMPLETE.md](./WEB_APP_COMPLETE.md) | Frontend implementation details |
| [Backend README](./apps/backend/README.md) | API documentation |

## 🎯 Key Features Breakdown

### Dashboard
- **Overview:** Stats, recent feedback, sentiment distribution
- **Feedback List:** Advanced filtering, search, pagination, CSV export
- **Analytics:** Pie charts, bar charts, line graphs with Recharts
- **Projects:** Create, manage, toggle active, regenerate API keys
- **Settings:** Account info, plan details, danger zone

### Marketing
- **Landing Page:** Hero, features grid, testimonials, CTA
- **Features Page:** 12 detailed features
- **Pricing Page:** 3 tiers (Free, Pro, Enterprise) with FAQ

### Widget
- Star rating (1-5)
- Category selection
- Text feedback
- Theme customization
- Position options
- Success/error states

## 🔌 API Endpoints

### Public (API Key)
- `POST /api/feedback` - Submit feedback

### Protected (Clerk JWT)
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `POST /api/projects/:id/regenerate-key` - Regenerate API key
- `GET /api/feedback` - List feedback with filters
- `GET /api/analytics/overview` - Statistics
- `GET /api/analytics/trends` - Sentiment trends

Full API docs: http://localhost:3001/api/docs

## 🧪 Testing

```bash
# Type checking
pnpm type-check

# Build all packages
pnpm build

# Backend tests
cd apps/backend
pnpm test
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Set environment variables
# Deploy automatically on push
```

### Backend (Railway/Fly.io)
```bash
# Railway
railway up

# Fly.io
fly deploy
```

### Database (NeonDB)
- Create project at https://neon.tech
- Copy connection string to `DATABASE_URL`

## 📊 Performance

- **Build Time:** ~10s with Turbo cache
- **First Load JS:** 102 kB (shared)
- **Page Load:** <1s on fast 3G
- **Lighthouse:** 90+ (estimated)

## 🎨 Design System

### Colors
- Primary: Purple gradient (#8b5cf6 → #ec4899)
- Positive: Green (#22c55e)
- Negative: Red (#ef4444)
- Neutral: Gray (#6b7280)

### Components
- 18 shadcn/ui components
- Custom dashboard components
- Recharts visualizations
- Framer Motion animations

## 🛣️ Roadmap

- [ ] Email notifications
- [ ] Slack integration
- [ ] Multi-language support
- [ ] Custom AI models
- [ ] Team collaboration
- [ ] Advanced permissions
- [ ] White-label option

## 📝 License

MIT

---

Built with ❤️ using modern web technologies
