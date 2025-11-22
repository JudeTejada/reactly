# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Reactly Feedback Widget - an embeddable JavaScript widget for collecting user feedback. It's built as a React component that can be distributed as both ES modules and UMD bundles for maximum compatibility.

## Architecture

The widget consists of:

- **React component** (`src/components/FeedbackWidget.tsx`) - Main UI with form, rating system, and theming
- **Embed script** (`src/embed.ts`) - Initialization logic and DOM mounting
- **Shared types** (`@reactly/shared`) - TypeScript definitions and Zod schemas shared across the monorepo

The widget supports:

- Multiple positioning options (corners of screen)
- Custom theming (colors, labels)
- Form validation with Zod schemas
- API submission to backend service
- Both NPM installation and script tag embedding

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (hot reload)
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check
```

## Build System

- **Vite** for bundling with React plugin
- **TypeScript** with strict mode enabled
- **CSS injection** plugin for self-contained bundles
- **Terser** minification with console removal
- Outputs: `widget.es.js` (ES module) and `widget.umd.js` (UMMD)

## Key Dependencies

- React 18 for component rendering
- `@reactly/shared` workspace package for types and schemas
- Zod for runtime validation
- Vite plugin for CSS injection (creates standalone bundles)

## Widget Configuration

The widget accepts a `WidgetConfig` interface with:

- `projectId` and `apiKey` (required)
- `apiUrl` (defaults to localhost:3001)
- `theme` object for colors
- `position` for screen placement
- `labels` for text customization

## Testing

The main.tsx file contains development demo configuration. Use `pnpm dev` to test widget locally before building.
