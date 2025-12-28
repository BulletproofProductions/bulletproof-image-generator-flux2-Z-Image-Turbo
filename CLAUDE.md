# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComfyUI Image Generator is a simplified AI image generator application built on the Agentic Coding Starter Kit. It provides a prompt builder interface for creating images with optional reference images (avatars). The current implementation uses a stub generator that returns placeholder images.

**Note:** This is a simplified single-user public application with no authentication.

## Development Commands

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production (runs migrations first)
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking
pnpm check            # Run both lint and typecheck
pnpm format           # Format code with Prettier
```

**Database commands:**
```bash
pnpm db:push          # Push schema changes (development)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:reset         # Drop and recreate all tables
```

**Important:** Always run `pnpm lint && pnpm typecheck` after completing changes to catch issues.

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router) with React 19
- **Database:** PostgreSQL with Drizzle ORM
- **Storage:** Vercel Blob (production) / local filesystem (development)
- **UI:** shadcn/ui with Tailwind CSS v4

### Core Data Flow

1. **Image Generation:**
   - User builds a prompt using the PromptBuilder UI (location, lighting, camera, style, subjects)
   - Subjects can be linked to Avatars (reference images) for consistent character/object generation
   - `src/lib/generate-stub.ts` provides stub generation (returns placeholder images)
   - Generated images are stored via the storage abstraction and tracked in `generations`/`generatedImages` tables

2. **Gallery System:**
   - Single public gallery showing all generated images
   - Search functionality by prompt text
   - No user-specific features (all images are public)

### Key Directories

- `src/app/` - Pages: `/` (generate), `/gallery`, `/avatars`
- `src/components/generate/` - Generation-specific components including prompt builder and results panels
- `src/hooks/` - Custom hooks for avatars, generation, presets, and prompt builder state
- `src/lib/generate-stub.ts` - Stub image generation (placeholder implementation)
- `src/lib/schema.ts` - Drizzle schema (`avatars`, `presets`, `generations`, `generatedImages`, `generationHistory`)
- `src/lib/types/generation.ts` - TypeScript types for generation system

### Storage Abstraction

`src/lib/storage.ts` auto-switches between local filesystem (`public/uploads/`) and Vercel Blob based on `BLOB_READ_WRITE_TOKEN` presence.

## Environment Variables

Required:
- `POSTGRES_URL` - PostgreSQL connection string

Optional:
- `BLOB_READ_WRITE_TOKEN` - Enables Vercel Blob storage (otherwise uses local)

## Project Rules

- Never start the dev server automatically. Ask the user for terminal output when needed.
