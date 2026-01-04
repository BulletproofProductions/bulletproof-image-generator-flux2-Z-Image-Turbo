# Bulletproof Image Upscaler - Implementation Plan

## Phase 1: Extend Types

### Tasks
- [ ] Add `"bulletproof-upscaler"` to `WorkflowType` union
- [ ] Add `VRAMPreset` type: `"low" | "standard" | "high"`
- [ ] Add `vramPreset?: VRAMPreset` to `GenerationSettings`
- [ ] Add `originalImageUrl?: string` to generation result type

### Files
- [src/lib/types/generation.ts](src/lib/types/generation.ts)

---

## Phase 2: Create Workflow Builder

### Tasks
- [ ] Create `BulletproofUpscalerWorkflowOptions` interface
- [ ] Create `VRAM_PRESET_MAP`: `{ low: 256, standard: 512, high: 1024 }`
- [ ] Implement `buildBulletproofUpscalerWorkflow()` mapping to nodes 41, 15, 16, 18, 19

### Files
- [src/lib/comfyui.ts](src/lib/comfyui.ts)

---

## Phase 3: Update Generate API Route

### Tasks
- [ ] Add `"bulletproof-upscaler"` to valid workflows
- [ ] Add validation: upscaler requires input image
- [ ] Add `vramPreset` validation (default: standard)
- [ ] Add workflow building branch
- [ ] Store `originalImageUrl` in generation result

### Files
- [src/app/api/generate/route.ts](src/app/api/generate/route.ts)

---

## Phase 4: Update Settings Hook

### Tasks
- [ ] Add `vramPreset` state (default: `"standard"`)
- [ ] Update `setWorkflow()` for upscaler: set `resolution: "2K"`, `vramPreset: "standard"`

### Files
- [src/hooks/use-prompt-builder.ts](src/hooks/use-prompt-builder.ts)

---

## Phase 5: Update Prompt Builder Pane

### Tasks
- [ ] When upscaler selected: make prompt read-only, display "UPSCALE"

### Files
- [src/components/generate/prompt-builder/prompt-builder-panel.tsx](src/components/generate/prompt-builder/prompt-builder-panel.tsx)

---

## Phase 6: Update Preview Panel UI

### Tasks
- [ ] Add workflow option: "Bulletproof Upscaler (4X)"
- [ ] Add VRAM Preset dropdown (Low/Standard/High)
- [ ] Show Resolution (default 2K), hide Aspect Ratio/Steps/Guidance/Denoise/Seed

### Files
- [src/components/generate/preview/preview-panel.tsx](src/components/generate/preview/preview-panel.tsx)

---

## Phase 7: Results Comparison View

### Tasks
- [ ] Create side-by-side layout for upscaler results
- [ ] Display original image (no download button)
- [ ] Display upscaled image with download button
- [ ] Add "Original" and "Upscaled" labels beneath images
- [ ] Responsive stacking on mobile

### Files
- [src/components/generate/results/generation-results.tsx](src/components/generate/results/generation-results.tsx)

---

## Phase 8: Polish

### Tasks
- [ ] Update Generate button disabled state
- [ ] Add input image required tooltip
- [ ] Update error messages

### Files
- [src/components/generate/preview/preview-panel.tsx](src/components/generate/preview/preview-panel.tsx)
- [src/components/generate/generation-error-alert.tsx](src/components/generate/generation-error-alert.tsx)

---

## File Summary

| File | Changes |
|------|---------|
| [src/lib/types/generation.ts](src/lib/types/generation.ts) | Add types |
| [src/lib/comfyui.ts](src/lib/comfyui.ts) | Add workflow builder |
| [src/app/api/generate/route.ts](src/app/api/generate/route.ts) | Add validation and workflow branch |
| [src/hooks/use-prompt-builder.ts](src/hooks/use-prompt-builder.ts) | Add vramPreset, defaults |
| [src/components/generate/prompt-builder/prompt-builder-panel.tsx](src/components/generate/prompt-builder/prompt-builder-panel.tsx) | Read-only prompt |
| [src/components/generate/preview/preview-panel.tsx](src/components/generate/preview/preview-panel.tsx) | VRAM dropdown, conditional UI |
| [src/components/generate/results/generation-results.tsx](src/components/generate/results/generation-results.tsx) | Comparison view |

---

## Results Display Mockup
