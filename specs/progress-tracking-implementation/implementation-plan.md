# Progress Tracking Implementation Plan

## Overview

Add real-time progress tracking to image generation with visual feedback showing step-by-step updates from ComfyUI for batch image generation.

## Goals

- Display "Image X of N - Step Y/Z (P%)" format during generation
- Stream progress updates from ComfyUI via WebSocket and Server-Sent Events
- Track batch image generation progress accurately
- Maintain existing generation flow without breaking functionality
- Establish test infrastructure with comprehensive unit tests

## Implementation Steps

### 1. Extend ComfyUI Client
- **File**: [src/lib/comfyui.ts](../../src/lib/comfyui.ts)
- Add `connectToProgressSocket()` method connecting to `ws://127.0.0.1:8000/ws`
- Parse `execution_progress` events containing `value` (current step) and `max` (total steps)
- Store progress callbacks in-memory keyed by prompt ID
- Implement proper connection cleanup on completion or timeout

### 2. Refactor Progress SSE Endpoint
- **File**: [src/app/api/generate/progress/route.ts](../../src/app/api/generate/progress/route.ts)
- Connect to ComfyUI WebSocket for each progress request
- Transform progress events to include `{ currentStep, totalSteps, percentage, imageIndex, totalImages }`
- Send updates via SSE as progress events occur
- Keep polling fallback for timeout resilience
- Implement cleanup handlers for WebSocket connections

### 3. Update useGeneration Hook
- **File**: [src/hooks/use-generation.ts](../../src/hooks/use-generation.ts)
- Add state for `currentImageIndex` and `totalImageCount`
- Pass batch tracking values to progress component alongside `currentPromptId`
- Update state as each image in batch completes
- Clear state on generation completion

### 4. Enhance GenerationProgress Component
- **File**: [src/components/generate/generation-progress.tsx](../../src/components/generate/generation-progress.tsx)
- Display "Image 2 of 4 - Step 12/20 (60%)" format
- Animate Radix UI `Progress` component with percentage value
- Show step count and percentage below progress bar
- Update in real-time as SSE events arrive

### 5. Set Up Vitest Test Infrastructure
- Install Vitest, `@testing-library/react`, `@testing-library/user-event`, and `vitest`
- Create `vitest.config.ts` configuration file
- Create test setup file with mocks for Next.js features
- Add test scripts to `package.json`:
  - `pnpm test` - Run all tests
  - `pnpm test:watch` - Watch mode
  - `pnpm test:coverage` - Coverage report

### 6. Write Comprehensive Unit Tests

#### ComfyUI Client Tests
- Test WebSocket connection initialization
- Test progress event parsing and callback execution
- Test connection cleanup on completion
- Test error handling and reconnection logic

#### Progress SSE Endpoint Tests
- Test progress endpoint accepts promptId parameter
- Test WebSocket events transform to correct SSE format
- Test batch image index tracking in progress events
- Test percentage calculation correctness
- Test fallback polling when WebSocket unavailable
- Test connection cleanup on client disconnect

#### useGeneration Hook Tests
- Test hook initializes with correct state
- Test batch image count and current index update
- Test progress endpoint connection via EventSource
- Test state cleanup after generation completes
- Test error handling during generation
- Test existing generation flow still works (backward compatibility)

#### GenerationProgress Component Tests
- Test component renders progress bar correctly
- Test display format "Image X of N - Step Y/Z (P%)"
- Test progress bar animation with percentage values
- Test component unmounts and cleans up EventSource
- Test loading state and spinner display

#### Integration Tests
- Test full batch generation flow with progress tracking
- Test existing generation still works without breaking
- Test multiple sequential generations
- Test error recovery and cleanup

## Further Considerations

### WebSocket Connection Management
- Close WebSocket connections when progress completes or times out
- Implement cleanup in progress route and component unmount handlers
- Prevent connection leaks with proper resource management

### Batch Image Loop Coordination
- Track which image is currently generating during batch operations
- Include image index in WebSocket listener key for proper event routing
- Update progress component state as each image in batch completes

### Test Isolation and Mocking
- Mock WebSocket connections and EventSource for unit tests
- Create fixtures for realistic progress events
- Isolate tests to prevent cross-test pollution
- Mock ComfyUI API responses

## Success Criteria

- ✅ Progress bar displays real-time updates during generation
- ✅ Step numbers and percentage shown for current image
- ✅ Batch image index displayed (e.g., "Image 2 of 4")
- ✅ Existing generation flow works without regression
- ✅ All unit tests passing (hooks, components, endpoints)
- ✅ Error handling and cleanup working correctly
- ✅ No memory leaks from WebSocket connections

## Dependencies

- Existing: `radix-ui/react-progress`, `lucide-react`, `sonner`
- New: `vitest`, `@testing-library/react`, `@testing-library/user-event`