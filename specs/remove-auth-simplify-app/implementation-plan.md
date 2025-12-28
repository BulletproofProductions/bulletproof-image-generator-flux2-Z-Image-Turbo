# Implementation Plan: Remove Authentication and Simplify Application

## Phase 1: Database Schema Changes

Update the database schema to remove auth tables and user references.

- [x] Edit `src/lib/schema.ts` to remove auth tables (`user`, `session`, `account`, `verification`)
- [x] Edit `src/lib/schema.ts` to remove `userApiKeys` table
- [x] Edit `src/lib/schema.ts` to remove `imageLikes` table
- [x] Edit `src/lib/schema.ts` to remove `userId` column from `avatars` table
- [x] Edit `src/lib/schema.ts` to remove `userId` column from `presets` table
- [x] Edit `src/lib/schema.ts` to remove `userId` column from `generations` table
- [x] Edit `src/lib/schema.ts` to remove `isPublic` column from `generatedImages` table

## Phase 2: Delete Auth Core Files

Remove the authentication infrastructure files.

- [x] Delete `src/lib/auth.ts`
- [x] Delete `src/lib/auth-client.ts`
- [x] Delete `src/lib/session.ts`
- [x] Delete `src/proxy.ts`
- [x] Delete `src/app/api/auth/` directory (entire directory)
- [x] Delete `src/components/auth/sign-in-button.tsx`
- [x] Delete `src/components/auth/sign-out-button.tsx`
- [x] Delete `src/components/auth/user-profile.tsx`

## Phase 3: Delete Gemini/API Key Files

Remove Google AI integration and API key management.

- [x] Delete `src/lib/gemini.ts`
- [x] Delete `src/lib/encryption.ts`
- [x] Delete `src/app/api/user/api-key/route.ts`
- [x] Delete `src/hooks/use-api-key.ts`
- [x] Delete `src/components/profile/api-key-form.tsx`
- [x] Delete `src/components/generate/api-key-alert.tsx`

## Phase 4: Create Stub Generation

Create a stub to replace Gemini image generation.

- [x] Create `src/lib/generate-stub.ts` with mock generation function
- [x] Export `generateImages()` function that returns placeholder result
- [x] Export `refineGeneration()` function that returns placeholder result

## Phase 5: Delete User-Specific Files

Remove user-specific API routes, pages, and components.

### API Routes
- [x] Delete `src/app/api/images/[id]/like/route.ts`
- [x] Delete `src/app/api/images/[id]/visibility/route.ts`
- [x] Delete `src/app/api/gallery/user/[userId]/route.ts`
- [x] Delete `src/app/api/gallery/top-contributors/route.ts`
- [x] Delete `src/app/api/gallery/most-liked/route.ts`

### Pages
- [x] Delete `src/app/profile/` directory (entire directory)
- [x] Delete `src/app/gallery/user/` directory (entire directory)

### Components
- [x] Delete `src/components/gallery/visibility-toggle.tsx`
- [x] Delete `src/components/gallery/like-button.tsx`
- [x] Delete `src/components/gallery/personal-gallery.tsx`
- [x] Delete `src/components/gallery/user-gallery-client.tsx`

## Phase 6: Update API Routes

Remove auth checks and update queries to remove user filtering.

### Generation Routes
- [x] Edit `src/app/api/generate/route.ts` - Remove auth, use stub generation
- [x] Edit `src/app/api/generate/[id]/refine/route.ts` - Remove auth, use stub refine

### Data Routes
- [x] Edit `src/app/api/avatars/route.ts` - Remove auth, remove userId filtering
- [x] Edit `src/app/api/avatars/[id]/route.ts` - Remove auth, remove userId checks
- [x] Edit `src/app/api/presets/route.ts` - Remove auth, remove userId filtering
- [x] Edit `src/app/api/presets/[id]/route.ts` - Remove auth, remove userId checks
- [x] Edit `src/app/api/generations/route.ts` - Remove auth, remove userId filtering
- [x] Edit `src/app/api/generations/[id]/route.ts` - Remove auth, remove userId checks

### Gallery Routes
- [x] Edit `src/app/api/gallery/public/route.ts` - Remove isPublic filter, remove likes

## Phase 7: Routing Changes

Reorganize pages to make generate the default.

- [x] Copy generate page content to `src/app/page.tsx`
- [x] Remove auth checks from new root page
- [x] Remove API key checks from new root page
- [x] Delete `src/app/generate/` directory
- [x] Edit `src/app/gallery/page.tsx` - Remove auth, show all images
- [x] Delete `src/app/gallery/public/` directory (merge into main gallery)

## Phase 8: Update Components

Update remaining components to remove auth dependencies.

### Site Header
- [x] Edit `src/components/site-header.tsx` - Remove useSession import
- [x] Edit `src/components/site-header.tsx` - Remove UserProfile component
- [x] Edit `src/components/site-header.tsx` - Show nav always (not auth-gated)
- [x] Edit `src/components/site-header.tsx` - Remove /profile link
- [x] Edit `src/components/site-header.tsx` - Update home link to /

### Gallery Components
- [x] Edit `src/components/gallery/gallery-grid.tsx` - Remove like/visibility props
- [x] Edit `src/components/gallery/image-card.tsx` - Remove like button, visibility toggle
- [x] Edit `src/components/gallery/image-detail-modal.tsx` - Remove user info, likes
- [x] Edit `src/components/gallery/public-gallery-client.tsx` - Remove likes, rename if needed

## Phase 9: Update Types

Update TypeScript type definitions.

- [x] Edit `src/lib/types/generation.ts` - Remove `userId` from Avatar interface
- [x] Edit `src/lib/types/generation.ts` - Remove `userId` from Generation interface
- [x] Edit `src/lib/types/generation.ts` - Remove `userId` from Preset interface
- [x] Edit `src/lib/types/generation.ts` - Remove `isPublic` from GeneratedImage
- [x] Edit `src/lib/types/generation.ts` - Remove ImageLike interface
- [x] Edit `src/lib/types/generation.ts` - Remove likeCount, isLikedByUser from GalleryImage
- [x] Edit `src/lib/types/generation.ts` - Remove user-related types (TopContributor, etc.)

## Phase 10: Update Hooks

Update remaining hooks to remove auth dependencies.

- [x] Edit `src/hooks/use-avatars.ts` - Remove userId from API calls
- [x] Edit `src/hooks/use-presets.ts` - Remove userId from API calls
- [x] Edit `src/hooks/use-generation.ts` - Remove userId from API calls

## Phase 11: Dependencies and Cleanup

Remove packages and update configuration.

- [x] Edit `package.json` - Remove `better-auth`
- [x] Edit `package.json` - Remove `@google/genai`
- [x] Run `pnpm install` to update lockfile
- [x] Update `.env.example` - Remove auth-related variables
- [x] Edit `src/lib/env.ts` - Remove auth-related env validation (if exists)

## Phase 12: Database Migration

Generate and run the database migration.

- [x] Run `pnpm db:generate` to generate migration
- [x] Run `pnpm db:migrate` to apply migration (or `pnpm db:push` for development)

## Phase 13: Verification

Verify the application works correctly.

- [x] Run `pnpm lint` - Fix any linting errors
- [x] Run `pnpm typecheck` - Fix any type errors
- [x] Run `pnpm build` - Ensure production build succeeds

---

## Files Summary

### Files to Delete (~25 files)
- `src/lib/auth.ts`
- `src/lib/auth-client.ts`
- `src/lib/session.ts`
- `src/lib/gemini.ts`
- `src/lib/encryption.ts`
- `src/proxy.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/app/api/user/api-key/route.ts`
- `src/app/api/images/[id]/like/route.ts`
- `src/app/api/images/[id]/visibility/route.ts`
- `src/app/api/gallery/user/[userId]/route.ts`
- `src/app/api/gallery/top-contributors/route.ts`
- `src/app/api/gallery/most-liked/route.ts`
- `src/app/profile/page.tsx`
- `src/app/profile/layout.tsx`
- `src/app/gallery/user/[userId]/page.tsx`
- `src/app/gallery/public/page.tsx`
- `src/app/generate/page.tsx`
- `src/app/generate/layout.tsx`
- `src/components/auth/sign-in-button.tsx`
- `src/components/auth/sign-out-button.tsx`
- `src/components/auth/user-profile.tsx`
- `src/components/profile/api-key-form.tsx`
- `src/components/generate/api-key-alert.tsx`
- `src/components/gallery/visibility-toggle.tsx`
- `src/components/gallery/like-button.tsx`
- `src/components/gallery/personal-gallery.tsx`
- `src/components/gallery/user-gallery-client.tsx`
- `src/hooks/use-api-key.ts`

### Files to Modify (~20 files)
- `src/lib/schema.ts`
- `src/lib/types/generation.ts`
- `src/app/page.tsx`
- `src/app/gallery/page.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/generate/[id]/refine/route.ts`
- `src/app/api/avatars/route.ts`
- `src/app/api/avatars/[id]/route.ts`
- `src/app/api/presets/route.ts`
- `src/app/api/presets/[id]/route.ts`
- `src/app/api/generations/route.ts`
- `src/app/api/generations/[id]/route.ts`
- `src/app/api/gallery/public/route.ts`
- `src/components/site-header.tsx`
- `src/components/gallery/gallery-grid.tsx`
- `src/components/gallery/image-card.tsx`
- `src/components/gallery/image-detail-modal.tsx`
- `src/components/gallery/public-gallery-client.tsx`
- `src/hooks/use-avatars.ts`
- `src/hooks/use-presets.ts`
- `src/hooks/use-generation.ts`
- `package.json`

### Files to Create (1 file)
- `src/lib/generate-stub.ts`
