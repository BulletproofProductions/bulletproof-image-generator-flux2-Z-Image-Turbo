# ComfyUI Integration - Implementation Plan

## Phase 1: Core ComfyUI Client

Create the foundational ComfyUI client service that handles all communication with the ComfyUI API.

### Tasks
- [x] Create `src/lib/comfyui.ts` with ComfyUI client class
- [x] Implement `queuePrompt(workflow)` - Submit workflow to ComfyUI queue
- [x] Implement `getHistory(promptId)` - Get execution status and results
- [x] Implement `getImage(filename, subfolder, type)` - Fetch generated image as buffer
- [x] Implement `uploadImage(buffer, filename)` - Upload reference image to ComfyUI
- [x] Implement `waitForCompletion(promptId)` - Poll history until generation completes
- [x] Add `COMFYUI_URL` environment variable support (default: `http://127.0.0.1:8000`)
- [x] Add error handling for connection refused, timeout, and API errors

### Files
- `src/lib/comfyui.ts` (new)

---

## Phase 2: Workflow Builder

Create the workflow builder that constructs ComfyUI workflows from user settings.

### Tasks
- [x] Create resolution mapping utility (resolution + aspect ratio → width/height)
- [x] Implement `buildFlux2Workflow(options)` function in comfyui.ts
- [x] Map user settings to workflow nodes:
  - Node 6: Prompt text
  - Node 25: Seed (random if not provided)
  - Node 26: Guidance value
  - Node 46: Reference image filename (if provided)
  - Node 47: Width, Height (EmptyFlux2LatentImage)
  - Node 48: Steps, Width, Height (Flux2Scheduler)
- [x] Handle optional reference image workflow modification

### Files
- `src/lib/comfyui.ts` (update)

---

## Phase 3: Update Types and API Route

Update TypeScript types and modify the generate API route to use ComfyUI.

### Tasks
- [x] Add `steps`, `guidance`, `seed` to `GenerationSettings` type
- [x] Update validation in generate route for new settings
- [x] Replace stub import with ComfyUI client import
- [x] Upload reference images to ComfyUI before generation
- [x] Build workflow with user settings
- [x] Queue prompt and wait for completion
- [x] Fetch generated images from ComfyUI
- [x] Convert images to base64 and save to storage
- [x] Delete `src/lib/generate-stub.ts`

### Files
- `src/lib/types/generation.ts` (update)
- `src/app/api/generate/route.ts` (update)
- `src/lib/generate-stub.ts` (delete)

---

## Phase 4: Real-time Progress (SSE)

Implement Server-Sent Events endpoint for real-time generation progress.

### Tasks
- [x] Create `src/app/api/generate/progress/route.ts` SSE endpoint
- [x] Poll ComfyUI history endpoint for progress updates
- [x] Forward progress events to client: `{ step, totalSteps, percentage, status }`
- [x] Handle client disconnect and cleanup
- [x] Add prompt ID parameter to track specific generation

### Files
- `src/app/api/generate/progress/route.ts` (new)

---

## Phase 5: Progress UI Component

Create the client-side progress display component.

### Tasks
- [x] Create `src/components/generate/generation-progress.tsx`
- [x] Connect to SSE endpoint when generation starts
- [x] Display progress bar with percentage
- [x] Show step count (e.g., "Step 12/20")
- [x] Handle connection errors gracefully
- [x] Clean up SSE connection on unmount or completion

### Files
- `src/components/generate/generation-progress.tsx` (new)

---

## Phase 6: Update Generation Hook

Update the generation hook to support progress tracking.

### Tasks
- [x] Add progress state to `useGeneration` hook: `{ step, totalSteps, percentage }`
- [x] Add `currentPromptId` state for progress tracking
- [x] Create `resetProgress()` function
- [x] Integrate progress tracking into `generate()` function
- [x] Reset progress state after generation completes or fails

### Files
- `src/hooks/use-generation.ts` (update)

---

## Phase 7: Preview Panel UI Controls

Add the new generation settings controls to the Preview Panel.

### Tasks
- [x] Add Steps slider (range 1-50, default 20)
- [x] Add Guidance slider (range 1-10, step 0.5, default 4)
- [x] Add Seed input field (optional number, "Random" placeholder)
- [x] Add "Randomize Seed" button
- [x] Update settings state handling for new fields
- [x] Integrate progress component into generation flow

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 8: Integration and Polish

Final integration and error handling improvements.

### Tasks
- [x] Integrate progress component in preview panel
- [x] Update "ComfyUI not running" error alert component
- [x] Update all API routes to use ComfyUI (generate, refine)
- [x] Verify all resolution/aspect ratio combinations work
- [x] Update any remaining stub references in codebase

### Files
- Various component files as needed

---

## File Summary

### New Files
1. `src/lib/comfyui.ts` - ComfyUI client service
2. `src/app/api/generate/progress/route.ts` - SSE progress endpoint
3. `src/components/generate/generation-progress.tsx` - Progress UI component

### Modified Files
4. `src/lib/types/generation.ts` - Add steps, guidance, seed to settings
5. `src/app/api/generate/route.ts` - Replace stub with ComfyUI calls
6. `src/app/api/generate/[id]/refine/route.ts` - Replace stub with ComfyUI calls
7. `src/components/generate/preview/preview-panel.tsx` - Add slider controls and progress
8. `src/hooks/use-generation.ts` - Add progress state management
9. `src/hooks/use-prompt-builder.ts` - Add default values for new settings
10. `src/components/generate/generation-error-alert.tsx` - Add ComfyUI-specific error handling

### Deleted Files
11. `src/lib/generate-stub.ts` - Remove stub generator
