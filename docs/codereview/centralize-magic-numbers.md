# Implementation Plan: Centralize Magic Numbers

**Issue:** Magic numbers scattered throughout the codebase make maintenance difficult and risk inconsistency.

**Solution:** Extract all scattered magic numbers into a centralized constants module.

---

## Magic Numbers Inventory

### 1. Default Values for Generation Settings

| File | Value | Description |
|------|-------|-------------|
| `use-prompt-builder.ts` | `20` | Default steps for Flux2 workflow |
| `use-prompt-builder.ts` | `4` | Default guidance for Flux2 workflow |
| `use-prompt-builder.ts` | `9` | Default steps for Z Image Turbo |
| `use-prompt-builder.ts` | `1` | Default guidance for Z Image Turbo |
| `use-prompt-builder.ts` | `0.4` | Default denoise for Z Image Turbo |
| `use-prompt-builder.ts` | `1024` | Default largestSize for Z Image Turbo |
| `use-prompt-builder.ts` | `3` | Default shift for Z Image Turbo |
| `use-prompt-builder.ts` | `9` | Default steps for Bulletproof Background |
| `use-prompt-builder.ts` | `1` | Default guidance for Bulletproof Background |
| `use-prompt-builder.ts` | `0.9` | Default denoise for Bulletproof Background |
| `use-prompt-builder.ts` | `3` | Default shift for Bulletproof Background |
| `use-prompt-builder.ts` | `0.2` | Default detectionConfidence |
| `use-prompt-builder.ts` | `"2K"` | Default resolution |
| `use-prompt-builder.ts` | `"1:1"` | Default aspect ratio |
| `use-prompt-builder.ts` | `1` | Default imageCount |
| `comfyui.ts` | `20` | Default steps in buildFlux2Workflow |
| `comfyui.ts` | `4` | Default guidance in buildFlux2Workflow |
| `comfyui.ts` | `9` | Default steps in buildZImageTurboWorkflow |
| `comfyui.ts` | `1` | Default cfg in buildZImageTurboWorkflow |
| `comfyui.ts` | `0.4` | Default denoise in buildZImageTurboWorkflow |
| `comfyui.ts` | `1024` | Default largestSize in buildZImageTurboWorkflow |
| `comfyui.ts` | `3` | Default shift in buildZImageTurboWorkflow |
| `comfyui.ts` | `9` | Default steps in buildBulletproofBackgroundWorkflow |
| `comfyui.ts` | `1` | Default cfg in buildBulletproofBackgroundWorkflow |
| `comfyui.ts` | `0.9` | Default denoise in buildBulletproofBackgroundWorkflow |
| `comfyui.ts` | `3` | Default shift in buildBulletproofBackgroundWorkflow |
| `comfyui.ts` | `0.2` | Default detectionConfidence |
| `comfyui.ts` | `8` | Default maskBlendPixels |
| `comfyui.ts` | `1024` | Default outputWidth/Height |
| `comfyui.ts` | `1080` | Default resolution in buildBulletproofUpscalerWorkflow |
| `comfyui.ts` | `4096` | Default maxResolution in buildBulletproofUpscalerWorkflow |
| `comfyui.ts` | `9527` | Default seed in buildBulletproofUpscalerWorkflow |

### 2. Validation Boundaries

| File | Value | Description |
|------|-------|-------------|
| `generate/route.ts` | `1` - `50` | Steps validation range |
| `generate/route.ts` | `1` - `10` | Guidance validation range |
| `generate/route.ts` | `0.1` - `1.0` | Denoise validation range |
| `generate/route.ts` | `256` - `4096` | LargestSize validation range |
| `generate/route.ts` | `0.1` - `1.0` | DetectionConfidence validation range |

### 3. Resolution Mappings

| Resolution | Aspect | Width × Height |
|------------|--------|----------------|
| 1K | 1:1 | 1024 × 1024 |
| 1K | 16:9 | 1280 × 720 |
| 1K | 9:16 | 720 × 1280 |
| 1K | 4:3 | 1152 × 864 |
| 1K | 3:4 | 864 × 1152 |
| 1K | 21:9 | 1344 × 576 |
| 2K | 1:1 | 2048 × 2048 |
| 2K | 16:9 | 2560 × 1440 |
| 2K | 9:16 | 1440 × 2560 |
| 2K | 4:3 | 2304 × 1728 |
| 2K | 3:4 | 1728 × 2304 |
| 2K | 21:9 | 2688 × 1152 |
| 4K | 1:1 | 4096 × 4096 |
| 4K | 16:9 | 3840 × 2160 |
| 4K | 9:16 | 2160 × 3840 |
| 4K | 4:3 | 4096 × 3072 |
| 4K | 3:4 | 3072 × 4096 |
| 4K | 21:9 | 5120 × 2160 |

**Upscaler Resolution Mappings:**

| Resolution | Target Shortest Edge | Max Dimension |
|------------|---------------------|---------------|
| 1K | 1080 | 2048 |
| 2K | 2160 | 4096 |
| 4K | 4320 | 8192 |

### 4. VRAM Presets

| Preset | Tile Size | Description |
|--------|-----------|-------------|
| `low` | 256 | ~4GB VRAM |
| `standard` | 512 | ~8GB VRAM |
| `high` | 1024 | ~16GB+ VRAM |
| (all) | 128 | Tile overlap (fixed) |

### 5. File Size Limits

| File | Value | Description |
|------|-------|-------------|
| `storage.ts` | 5MB | Default max upload size |
| `avatars/route.ts` | 5MB | Avatar image max size |
| `generate/route.ts` | 50MB | Generated/upscaled image max size |

### 6. Timing Values

| File | Value | Description |
|------|-------|-------------|
| `comfyui.ts` | 500ms | Polling interval for waitForCompletion |
| `progress/route.ts` | 2000ms | Database polling interval |
| `comfyui.ts` | 5000ms | Health check timeout |
| `progress/route.ts` | 20 | Fallback totalSteps |

### 7. Other Limits

| File | Value | Description |
|------|-------|-------------|
| `generate/route.ts` | `[1, 2, 3, 4]` | Valid image count values |

---

## Implementation Steps

### Step 1: Create Constants Module

Create `src/lib/constants/generation.ts`:

```typescript
/**
 * @fileoverview Centralized Constants for Image Generation
 * 
 * All magic numbers and configuration values are defined here to ensure
 * consistency across the codebase and simplify maintenance.
 */

import type { WorkflowType, ImageResolution, AspectRatio } from "@/lib/types/generation";

// ============================================================================
// WORKFLOW DEFAULTS
// ============================================================================

export const WORKFLOW_DEFAULTS = {
  flux2: {
    steps: 20,
    guidance: 4,
  },
  "z-image-turbo": {
    steps: 9,
    guidance: 1,
    denoise: 0.4,
    largestSize: 1024,
    shift: 3,
  },
  "bulletproof-background": {
    steps: 9,
    guidance: 1,
    denoise: 0.9,
    shift: 3,
    detectionConfidence: 0.2,
    subjectToDetect: "person",
    maskBlendPixels: 8,
    outputWidth: 1024,
    outputHeight: 1024,
  },
  "bulletproof-upscaler": {
    resolution: 2160,
    maxResolution: 4096,
    vramPreset: "standard",
    seed: 9527,
  },
} as const;

export const DEFAULT_SETTINGS = {
  resolution: "2K" as ImageResolution,
  aspectRatio: "1:1" as AspectRatio,
  imageCount: 1,
  workflow: "flux2" as WorkflowType,
} as const;

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const VALIDATION_LIMITS = {
  steps: { min: 1, max: 50 },
  guidance: { min: 1, max: 10 },
  denoise: { min: 0.1, max: 1.0 },
  largestSize: { min: 256, max: 4096 },
  detectionConfidence: { min: 0.1, max: 1.0 },
  imageCount: [1, 2, 3, 4] as const,
} as const;

// ============================================================================
// RESOLUTION DIMENSIONS
// ============================================================================

export const RESOLUTION_DIMENSIONS: Record<
  ImageResolution,
  Record<AspectRatio, { width: number; height: number }>
> = {
  "1K": {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "4:3": { width: 1152, height: 864 },
    "3:4": { width: 864, height: 1152 },
    "21:9": { width: 1344, height: 576 },
  },
  "2K": {
    "1:1": { width: 2048, height: 2048 },
    "16:9": { width: 2560, height: 1440 },
    "9:16": { width: 1440, height: 2560 },
    "4:3": { width: 2304, height: 1728 },
    "3:4": { width: 1728, height: 2304 },
    "21:9": { width: 2688, height: 1152 },
  },
  "4K": {
    "1:1": { width: 4096, height: 4096 },
    "16:9": { width: 3840, height: 2160 },
    "9:16": { width: 2160, height: 3840 },
    "4:3": { width: 4096, height: 3072 },
    "3:4": { width: 3072, height: 4096 },
    "21:9": { width: 5120, height: 2160 },
  },
} as const;

export const UPSCALER_RESOLUTION_MAP: Record<
  ImageResolution,
  { resolution: number; maxResolution: number }
> = {
  "1K": { resolution: 1080, maxResolution: 2048 },
  "2K": { resolution: 2160, maxResolution: 4096 },
  "4K": { resolution: 4320, maxResolution: 8192 },
} as const;

// ============================================================================
// VRAM PRESETS
// ============================================================================

export const VRAM_PRESETS = {
  low: { tileSize: 256, description: "~4GB VRAM" },
  standard: { tileSize: 512, description: "~8GB VRAM" },
  high: { tileSize: 1024, description: "~16GB+ VRAM" },
} as const;

export const TILE_OVERLAP = 128;

// ============================================================================
// FILE SIZE LIMITS
// ============================================================================

export const FILE_SIZE_LIMITS = {
  /** Default upload size limit (5MB) */
  DEFAULT: 5 * 1024 * 1024,
  /** Avatar image upload limit (5MB) */
  AVATAR_IMAGE: 5 * 1024 * 1024,
  /** Generated/upscaled image limit (50MB) */
  GENERATED_IMAGE: 50 * 1024 * 1024,
} as const;

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

export const TIMING = {
  /** ComfyUI polling interval in ms */
  COMFYUI_POLL_INTERVAL: 500,
  /** Database polling interval for progress fallback in ms */
  PROGRESS_POLL_INTERVAL: 2000,
  /** Health check timeout in ms */
  HEALTH_CHECK_TIMEOUT: 5000,
} as const;

// ============================================================================
// ALLOWED VALUES
// ============================================================================

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/gif",
  "image/webp",
] as const;

export const VALID_RESOLUTIONS = ["1K", "2K", "4K"] as const;
export const VALID_ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"] as const;
export const VALID_WORKFLOWS = ["flux2", "z-image-turbo", "bulletproof-background", "bulletproof-upscaler"] as const;
export const VALID_VRAM_PRESETS = ["low", "standard", "high"] as const;
```

### Step 2: Update use-prompt-builder.ts

Replace inline defaults with imports:

```typescript
import { 
  WORKFLOW_DEFAULTS, 
  DEFAULT_SETTINGS 
} from "@/lib/constants/generation";

const defaultSettings: GenerationSettings = {
  resolution: DEFAULT_SETTINGS.resolution,
  aspectRatio: DEFAULT_SETTINGS.aspectRatio,
  imageCount: DEFAULT_SETTINGS.imageCount,
  steps: WORKFLOW_DEFAULTS.flux2.steps,
  guidance: WORKFLOW_DEFAULTS.flux2.guidance,
  seed: undefined,
  workflow: DEFAULT_SETTINGS.workflow,
  // ...
};
```

### Step 3: Update generate/route.ts

Replace validation and resolution mappings:

```typescript
import {
  VALIDATION_LIMITS,
  UPSCALER_RESOLUTION_MAP,
  FILE_SIZE_LIMITS,
  VALID_RESOLUTIONS,
  VALID_ASPECT_RATIOS,
  VALID_WORKFLOWS,
  VALID_VRAM_PRESETS,
} from "@/lib/constants/generation";

// Validation example
if (settings.steps !== undefined && 
    (settings.steps < VALIDATION_LIMITS.steps.min || 
     settings.steps > VALIDATION_LIMITS.steps.max)) {
  return NextResponse.json(
    { error: `Steps must be between ${VALIDATION_LIMITS.steps.min} and ${VALIDATION_LIMITS.steps.max}` },
    { status: 400 }
  );
}

// Resolution mapping example
const resolution = UPSCALER_RESOLUTION_MAP[settings.resolution]?.resolution || 2160;
const maxResolution = UPSCALER_RESOLUTION_MAP[settings.resolution]?.maxResolution || 4096;
```

### Step 4: Update comfyui.ts

Replace resolution lookup and workflow defaults:

```typescript
import {
  RESOLUTION_DIMENSIONS,
  WORKFLOW_DEFAULTS,
  VRAM_PRESETS,
  TILE_OVERLAP,
  TIMING,
} from "@/lib/constants/generation";

export function getResolutionDimensions(
  resolution: ImageResolution,
  aspectRatio: AspectRatio
): { width: number; height: number } {
  return RESOLUTION_DIMENSIONS[resolution][aspectRatio];
}

// In buildFlux2Workflow
const steps = options.steps ?? WORKFLOW_DEFAULTS.flux2.steps;
const guidance = options.guidance ?? WORKFLOW_DEFAULTS.flux2.guidance;

// In waitForCompletion
await new Promise((r) => setTimeout(r, TIMING.COMFYUI_POLL_INTERVAL));
```

### Step 5: Update progress/route.ts

Replace polling interval and fallback values:

```typescript
import { 
  TIMING, 
  WORKFLOW_DEFAULTS 
} from "@/lib/constants/generation";

const totalSteps = (settings?.steps as number) || WORKFLOW_DEFAULTS.flux2.steps;

// In pollForCompletion
pollInterval = setTimeout(pollForCompletion, TIMING.PROGRESS_POLL_INTERVAL);
```

### Step 6: Update avatars/route.ts

Replace file size limit:

```typescript
import { FILE_SIZE_LIMITS } from "@/lib/constants/generation";

const maxSize = FILE_SIZE_LIMITS.AVATAR_IMAGE;
if (image.size > maxSize) {
  return NextResponse.json(
    { error: `Image too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
    { status: 400 }
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/constants/generation.ts` | **CREATE** - New constants module |
| `src/hooks/use-prompt-builder.ts` | Import and use `WORKFLOW_DEFAULTS`, `DEFAULT_SETTINGS` |
| `src/app/api/generate/route.ts` | Import and use `VALIDATION_LIMITS`, `UPSCALER_RESOLUTION_MAP`, `FILE_SIZE_LIMITS`, `VALID_*` arrays |
| `src/lib/comfyui.ts` | Import and use `RESOLUTION_DIMENSIONS`, `WORKFLOW_DEFAULTS`, `VRAM_PRESETS`, `TIMING` |
| `src/app/api/generate/progress/route.ts` | Import and use `TIMING`, `WORKFLOW_DEFAULTS` |
| `src/app/api/avatars/route.ts` | Import and use `FILE_SIZE_LIMITS`, `ALLOWED_IMAGE_TYPES` |
| `src/lib/storage.ts` | Import and use `FILE_SIZE_LIMITS.DEFAULT` |

---

## Benefits

1. **Single source of truth** - All defaults defined once
2. **Type safety** - `as const` provides literal types
3. **Easy updates** - Change value in one place
4. **Self-documenting** - Constants file serves as configuration reference
5. **Consistency** - Same values used across API validation and UI defaults
6. **Testability** - Can import constants in tests for assertions

---

## Considerations

### Type Derivation

Types like `ImageResolution` and `WorkflowType` could be derived from constants:

```typescript
export const VALID_RESOLUTIONS = ["1K", "2K", "4K"] as const;
export type ImageResolution = typeof VALID_RESOLUTIONS[number];
```

**Pros:** Types stay in sync automatically
**Cons:** Adds complexity, may affect IDE autocomplete

**Recommendation:** Keep separate for now, add comment noting they must stay in sync.

### File Organization

Options:
1. Single `constants/generation.ts` file (~150 lines)
2. Split into `constants/workflows.ts`, `constants/validation.ts`, etc.

**Recommendation:** Start with single file. Split if it grows beyond ~300 lines.

### Helper Functions

Consider adding utility functions:

```typescript
export function getWorkflowDefaults(workflow: WorkflowType) {
  return WORKFLOW_DEFAULTS[workflow];
}

export function isValidResolution(value: string): value is ImageResolution {
  return VALID_RESOLUTIONS.includes(value as ImageResolution);
}
```

**Recommendation:** Add helpers as needed during implementation.

---

## Estimated Effort

| Task | Time |
|------|------|
| Create constants module | 30 min |
| Update use-prompt-builder.ts | 20 min |
| Update generate/route.ts | 30 min |
| Update comfyui.ts | 40 min |
| Update progress/route.ts | 10 min |
| Update avatars/route.ts | 10 min |
| Update storage.ts | 5 min |
| Testing | 30 min |
| **Total** | **~3 hours** |
