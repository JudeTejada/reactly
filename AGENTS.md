# Reactly Agent Guidelines

## Commands
- `pnpm dev` - Start all apps in development
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Type check all packages
- Backend: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`

## Code Style
- Use TypeScript with strict mode
- Prettier: semicolons, double quotes, 2-space tabs, 80 char width
- NestJS backend with modules, services, controllers pattern
- Drizzle ORM for database operations
- Zod schemas for validation and types
- Import shared types from `@reactly/shared`
- Use async/await, handle errors with NestJS exceptions
- Follow NestJS dependency injection patterns
- Use descriptive variable names, avoid abbreviations