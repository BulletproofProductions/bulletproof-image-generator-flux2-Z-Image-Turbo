# Z Image Turbo Integration - Implementation Plan

## Phase 1: Extend Types and ComfyUI Client

Add the Z Image Turbo workflow builder and extend generation types.

### Tasks
- [x] Add `WorkflowType` type: `"flux2" | "z-image-turbo"` to `src/lib/types/generation.ts`
- [x] Add `workflow`, `denoise`, `largestSize` fields to `GenerationSettings` interface
- [x] Create `ZImageTurboWorkflowOptions` interface in `src/lib/comfyui.ts`
- [x] Implement `buildZImageTurboWorkflow(options)` function mapping to workflow nodes:
  - Node 1: UNETLoader (`z_image_turbo_fp8_e4m3fn.safetensors`)
  - Node 2: CLIPLoader (`qwen_3_4b.safetensors`, type: `lumina2`)
  - Node 3: VAELoader (`ae.safetensors`)
  - Node 4: LoadImage (input image filename) **[User Input]**
  - Node 5: CLIPTextEncode (prompt text) **[User Input]**
  - Node 6: ConditioningZeroOut (automatic)
  - Node 7: KSampler (`seed`, `steps`, `cfg`, `denoise`) **[User Input]**
  - Node 8: VAEEncode (automatic)
  - Node 9: ImageScaleToMaxDimension (`largestSize`) **[User Input]**
  - Node 10: VAEDecode (automatic)
  - Node 12: SaveImage (automatic)
  - Node 14: ModelSamplingAuraFlow (`shift`) **[User Input]**
- [x] Exclude Florence2 nodes (16, 18, 20) from workflow builder

### Files
- `src/lib/types/generation.ts` (update)
- `src/lib/comfyui.ts` (update)

---

## Phase 2: Update Generate API Route

Modify the generate API route to support workflow selection.

### Tasks
- [x] Add `workflow` parameter validation (default: `"flux2"`)
- [x] Add `denoise` parameter validation (range: 0.1-1.0)
- [x] Add `largestSize` parameter validation (default: 1024)
- [x] Add conditional logic for workflow selection:
  - If `workflow === "z-image-turbo"`: require input image, use `buildZImageTurboWorkflow()`
  - If `workflow === "flux2"`: use existing `buildFlux2Workflow()`
- [x] Return 400 error with message "Input image required for Z Image Turbo" when missing
- [x] Apply workflow-specific default values:
  - Z Image Turbo: `steps=9`, `cfg=1`, `denoise=0.4`, `shift=3`
  - Flux 2: `steps=20`, `guidance=4`

### Files
- `src/app/api/generate/route.ts` (update)

---

## Phase 3: Update Generation Hook

Extend the generation hook with workflow-specific state management.

### Tasks
- [x] Add `workflow` to settings state (default: `"flux2"`)
- [x] Add `denoise` to settings state (default: `0.4`)
- [x] Add `largestSize` to settings state (default: `1024`)
- [x] Create `setWorkflow(workflow)` function that also resets defaults:
  - When switching to Z Image Turbo: set `steps=9`, `guidance=1`, `denoise=0.4`
  - When switching to Flux 2: set `steps=20`, `guidance=4`, clear `denoise`
- [x] Add `canGenerate` computed value that checks:
  - If Z Image Turbo: `hasReferenceImage && hasPrompt`
  - If Flux 2: `hasPrompt`

### Files
- `src/hooks/use-prompt-builder.ts` (update) - Note: Settings managed here, not use-generation.ts

---

## Phase 4: Add Workflow Selector UI

Add workflow selection dropdown to the Preview Panel.

### Tasks
- [x] Create workflow selector component with options:
  - "Flux 2 (Text-to-Image)" - value: `"flux2"`
  - "Z Image Turbo (Image-to-Image)" - value: `"z-image-turbo"`
- [x] Position selector at top of generation settings section
- [x] Wire `onChange` to `setWorkflow()` function from hook
- [x] Display current workflow selection

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 5: Conditional Settings Display

Show/hide settings based on selected workflow.

### Tasks
- [x] Add denoise slider (only visible for Z Image Turbo):
  - Range: 0.1 to 1.0
  - Step: 0.05
  - Default: 0.4
  - Label: "Denoise Strength"
  - Helper text: "Higher = more transformation from original"
- [x] Hide Resolution selector when Z Image Turbo selected
- [x] Hide Aspect Ratio selector when Z Image Turbo selected
- [x] Update Steps slider defaults per workflow:
  - Z Image Turbo: range 1-20, default 9
  - Flux 2: range 1-50, default 20
- [x] Update Guidance/CFG slider defaults per workflow:
  - Z Image Turbo: range 1-5, default 1
  - Flux 2: range 1-10, default 4

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 6: Input Image Validation UI

Disable Generate button and show validation message.

### Tasks
- [x] Add `isGenerateDisabled` computed value:
  - `workflow === "z-image-turbo" && !referenceImage`
- [x] Disable Generate button when `isGenerateDisabled` is true
- [x] Show tooltip message: "Input image required for Z Image Turbo" (via title attribute)
- [x] Style disabled button appropriately (opacity, cursor)
- [x] Add visual indicator near workflow selector when Z Image Turbo selected without image

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 7: Update Refine API Route

Extend the refine endpoint to support Z Image Turbo workflow.

### Tasks
- [x] Add `workflow` parameter to refine request validation
- [x] Apply same workflow selection logic as generate route
- [x] For Z Image Turbo refinements, use previous output as input image
- [x] Validate denoise parameter for refine requests

### Files
- `src/app/api/generate/[id]/refine/route.ts` (update)

---

## Phase 8: Integration and Polish

Final integration, error handling, and UX improvements.

### Tasks
- [ ] Update error alert component with Z Image Turbo specific messages
- [x] Ensure progress tracking works for Z Image Turbo (different step count)
- [x] Test workflow switching preserves compatible settings
- [x] Verify reference image upload works with Z Image Turbo
- [x] Add workflow type to generation history/metadata (stored in settings)
- [ ] Update any hardcoded Flux 2 references in UI text

### Files
- `src/components/generate/generation-error-alert.tsx` (update)
- Various component files as needed

---

## File Summary

### Modified Files
1. `src/lib/types/generation.ts` - Add WorkflowType, denoise, largestSize to settings
2. `src/lib/comfyui.ts` - Add buildZImageTurboWorkflow() function
3. `src/app/api/generate/route.ts` - Add workflow selection and validation
4. `src/app/api/generate/[id]/refine/route.ts` - Add workflow support for refine
5. `src/hooks/use-generation.ts` - Add workflow state and defaults switching
6. `src/components/generate/preview/preview-panel.tsx` - Add workflow selector, denoise slider, conditional UI
7. `src/components/generate/generation-error-alert.tsx` - Add Z Image Turbo error messages

### No New Files Required
All changes extend existing files from the ComfyUI integration.

---

## Workflow Node Reference

### Z Image Turbo Workflow Structure

[1] UNETLoader ─────────────────────────────────────┐
▼
[2] CLIPLoader ──► [5] CLIPTextEncode ──► [6] ConditioningZeroOut
│ │
│ ▼
[4] LoadImage ──► [9] ImageScale ──► [8] VAEEncode ──► [7] KSampler
│
[3] VAELoader ──────────────────────────────► [10] VAEDecode
│
[12] SaveImage

[14] ModelSamplingAuraFlow (connects to KSampler model input)


### User-Configurable Parameters Summary
| UI Control | Node | Parameter | Default |
|------------|------|-----------|---------|
| Prompt | 5 | `text` | - |
| Input Image | 4 | `image` | **Required** |
| Steps | 7 | `steps` | 9 |
| CFG | 7 | `cfg` | 1 |
| Denoise | 7 | `denoise` | 0.4 |
| Seed | 7 | `seed` | Random |
| Max Size | 9 | `largest_size` | 1024 |
| Shift | 14 | `shift` | 3 |