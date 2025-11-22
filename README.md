# Reactly 🚀

**AI-Driven User Feedback & Sentiment Analysis SaaS Platform**

A complete, production-ready full-stack application for collecting, analyzing, and understanding user feedback with AI-powered sentiment analysis.

![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Core Features

- **AI Sentiment Analysis**: Automatically categorize feedback as positive, negative, or neutral using GLM 4.6.
- **Embeddable Widget**: Lightweight, customizable React widget for easy integration into any website.
- **Real-time Dashboard**: Monitor feedback trends, sentiment distribution, and recent activity.
- **Smart Filtering**: Filter feedback by sentiment, category, project, or date range.
- **Multi-Project Support**: Manage multiple projects and API keys from a single account.
- **Team Collaboration**: Invite team members (coming soon).
- **Notifications**: Get alerts via Discord for negative feedback.

### 🛠️ Technical Highlights

- **Monorepo Architecture**: Efficiently managed with pnpm workspaces and Turborepo.
- **Full-Stack Type Safety**: Shared types between frontend, backend, and widget.
- **Modern Auth**: Secure authentication using Clerk (JWT + API Keys).
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions.
- **Performance**: Next.js 15 App Router, React 19, and optimized Vite build for the widget.

## 🏗️ Architecture

```mermaid
graph TD
    User[User/Visitor] -->|Interacts| Widget[Feedback Widget]
    User -->|Manages| Web[Web Dashboard]
    Widget -->|Submits| API[Backend API]
    Web -->|Queries| API
    API -->|Auth| Clerk[Clerk Auth]
    API -->|Stores| DB[(PostgreSQL)]
    API -->|Analyzes| AI[GLM 4.6]
    API -->|Notifies| Discord[Discord Webhook]
```

### Apps & Packages

- **`apps/web`**: Next.js 15 dashboard and marketing site.
- **`apps/backend`**: NestJS API server handling logic, DB, and AI.
- **`apps/widget`**: Embeddable feedback widget (Vite + React).
- **`packages/shared`**: Shared TypeScript schemas (Zod), types, and utilities.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 9.0.0
- Docker (for local database)

### 1. Installation

Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd reactly
pnpm install
```

### 2. Environment Setup

Set up environment variables for the backend and web apps.

**Backend (`apps/backend/.env`):**

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reactly_dev
CLERK_SECRET_KEY=sk_test_...
GLM_API_KEY=your-glm-api-key-here
DISCORD_WEBHOOK_URL=... (optional)
```

**Web (`apps/web/.env.local`):**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup

Start a local PostgreSQL instance and run migrations:

```bash
# Start local DB in Docker
cd apps/backend
pnpm db:setup:local

# Run migrations
pnpm db:migrate
```

### 4. Run the Development Server

Start all applications (Web, Backend, Widget) in parallel:

```bash
# From the root directory
pnpm dev
```

- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:3001](http://localhost:3001)
- **API Docs (Swagger)**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Widget Demo**: [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```text
reactly/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── ai/       # Sentiment analysis service
│   │   │   ├── analytics/# Stats & trends
│   │   │   ├── auth/     # Clerk & API Key guards
│   │   │   ├── db/       # Drizzle schema & config
│   │   │   ├── feedback/ # CRUD operations
│   │   │   └── projects/ # Project management
│   ├── web/              # Next.js Dashboard
│   │   ├── app/
│   │   │   ├── (auth)/   # Sign-in/Sign-up
│   │   │   ├── (dashboard)/ # Protected app routes
│   │   │   └── (marketing)/ # Landing pages
│   └── widget/           # Embeddable Widget
│       └── src/          # React component logic
└── packages/
    └── shared/           # Shared code (Types, Zod Schemas)
```

## 🧪 Testing & Quality

```bash
# Run type checking across all packages
pnpm type-check

# Run linting
pnpm lint

# Run backend tests
cd apps/backend
pnpm test
```

## 📚 Documentation

- [Backend Documentation](./apps/backend/README.md)
- [Widget Documentation](./apps/widget/README.md)
- [Setup Guide](./SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
