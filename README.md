# Bulletproof Image Generator

An AI-powered image generator application that uses ComfyUI to create and refine images based on detailed prompts with optional reference images (avatars) for consistent character generation.

## Features

- **AI Image Generation**: Generate images using ComfyUI with multi-turn conversation support for refinements
- **Prompt Builder**: Intuitive UI to construct detailed prompts with location, lighting, camera angle, style, and subject options
- **Avatar System**: Upload reference images to maintain consistent characters/objects across generations
- **Gallery**: Browse generated images

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: ComfyUI backend
- **Storage**: Vercel Blob (production) / local filesystem (development)
- **UI**: shadcn/ui with Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended)

### Installation
   cd bulletproof-image-generator
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   ```

   POSTGRES_URL="postgresql://dev_user:dev_passwor@localhost:5432/comfyui_generator"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Optional: Vercel Blob storage (leave empty for local storage)
   BLOB_READ_WRITE_TOKEN=""
   ```

5. Set up the database:
   ```bash
   pnpm install
   docker compose up -d
   pnpm db:migrate
   ```

6. Start the development server and comfyui server portable:
   ```bash
   pnpm dev
   .\run_nvidia_gpu.bat
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Create avatars** by uploading reference images for consistent character generation
2. **Build your prompt** using the Prompt Builder interface
3. **Generate images** and refine them with follow-up prompts
4. **Browse the gallery** to see all generated images

## Development Commands

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript type checking
pnpm check            # Run both lint and typecheck
pnpm format           # Format code with Prettier
```

### Database Commands

```bash
pnpm db:push          # Push schema changes (development)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm db:reset         # Drop and recreate all tables
```

## Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── gallery/              # Gallery page
│   └── avatars/              # Avatar management page
├── components/
│   ├── generate/             # Prompt builder and generation UI
│   └── ui/                   # shadcn/ui components
├── hooks/                    # Custom React hooks
│   ├── use-avatars.ts        # Avatar management
│   ├── use-generation.ts     # Image generation logic
│   └── use-prompt-builder.ts # Prompt builder state
└── lib/
    ├── schema.ts             # Database schema
    ├── storage.ts            # File storage abstraction
    └── generate-stub.ts      # Stub image generation
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | No | Application URL |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token (uses local storage if not set) |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

The application will automatically use Vercel Blob for storage when `BLOB_READ_WRITE_TOKEN` is configured.

## License

MIT License - see [LICENSE](LICENSE) for details.

rgb(161, 144, 125) #a1907d