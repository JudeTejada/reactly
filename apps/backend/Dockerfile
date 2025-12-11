# ================================
# Base Stage - Common Dependencies
# ================================
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.7.0 --activate && \
    apk add --no-cache libc6-compat curl

ENV PNPM_HOME="/root/.pnpm-store"
ENV PATH="$PNPM_HOME/bin:$PATH"

WORKDIR /app

# ================================
# Dependencies Stage - Install Once
# ================================
FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# ================================
# Builder Stage - Build Applications
# ================================
FROM dependencies AS builder

COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

RUN pnpm --filter @reactly/shared build
RUN pnpm --filter @reactly/backend build

# ================================
# Production Stage - Minimal Runtime
# ================================
FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

ENV NODE_ENV=production
ENV PORT=10000
ENV NODE_OPTIONS="--max-old-space-size=512"

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

WORKDIR /app/apps/backend
CMD ["node", "dist/main.js"]
