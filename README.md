# Reactly - AI-Driven User Feedback & Sentiment Analysis SaaS

A full-stack platform for collecting and analyzing user feedback in real-time using AI sentiment analysis.

## Features

- 🤖 **AI-Powered Sentiment Analysis** - Automatic sentiment detection using OpenAI
- 📊 **Real-time Analytics Dashboard** - Visualize feedback trends and sentiment distribution
- 🔌 **Embeddable Widget** - Easy integration for any website or app
- 🔐 **Secure Authentication** - Powered by Clerk
- 🎨 **Modern UI** - Built with Next.js, TailwindCSS, and shadcn/ui
- 🚀 **Easy Deployment** - Ready for Railway (backend) and Vercel (frontend)

## Project Structure

```
reactly/
├── apps/
│   ├── web/          # Next.js main app (landing + dashboard)
│   ├── backend/      # NestJS API
│   └── widget/       # Embeddable React widget
├── packages/
│   ├── shared/       # Shared types and utilities
│   └── ui/           # Shared UI components
```

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, shadcn/ui, Recharts
- **Backend**: NestJS, Drizzle ORM, PostgreSQL (NeonDB)
- **Auth**: Clerk
- **AI**: OpenAI API
- **Deployment**: Vercel (frontend), Railway (backend)

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL database (NeonDB recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env

# Run development servers
pnpm dev
```

### Environment Variables

See `.env.example` files in each app directory for required variables.

## Development

```bash
# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

## Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy from `apps/backend`

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `apps/web`
3. Set environment variables
4. Deploy

## License

MIT
