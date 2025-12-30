# Bulletproof Background Integration - Implementation Plan

## Phase 1: Extend Types and ComfyUI Client

Add the Bulletproof Background workflow builder and extend generation types.

### Tasks
- [ ] Add `"bulletproof-background"` to `WorkflowType` union in `src/lib/types/generation.ts`
- [ ] Add `detectionConfidence`, `subjectPrompt`, `maskBlendPixels` fields to `GenerationSettings` interface
- [ ] Create `BulletproofBackgroundWorkflowOptions` interface in `src/lib/comfyui.ts`
- [ ] Implement `buildBulletproofBackgroundWorkflow(options)` function mapping to workflow nodes:
  - Node 55: UNETLoader (`z_image_turbo_bf16.safetensors`)
  - Node 54: CLIPLoader (`qwen_3_4b.safetensors`, type: `lumina2`)
  - Node 56: VAELoader (`ae.safetensors`)
  - Node 41: LoadImage (input image filename) **[User Input]**
  - Node 67: LoadSAM3Model (`models/sam3/sam3.pt`)
  - Node 66: SAM3Grounding (`confidence_threshold`, `text_prompt`) **[User Input]**
  - Node 78: InpaintCropImproved (mask settings) **[Configurable]**
  - Node 12: CLIPTextEncode (background prompt) **[User Input]**
  - Node 52: ConditioningZeroOut (automatic)
  - Node 53: ModelSamplingAuraFlow (`shift`) **[User Input]**
  - Node 17: DifferentialDiffusion (`strength`)
  - Node 10: InpaintModelConditioning (automatic)
  - Node 16: KSampler (`seed`, `steps`, `cfg`, `denoise`) **[User Input]**
  - Node 25: VAEDecode (automatic)
  - Node 79: InpaintStitchImproved (automatic)
  - Node XX: SaveImage (automatic - need to add)
- [ ] Exclude preview/debug nodes (81, 82, 111, 118) from workflow builder

### Files
- `src/lib/types/generation.ts` (update)
- `src/lib/comfyui.ts` (update)

---

## Phase 2: Update Generate API Route

Modify the generate API route to support Bulletproof Background workflow selection.

### Tasks
- [ ] Add `workflow: "bulletproof-background"` parameter validation
- [ ] Add `detectionConfidence` parameter validation (range: 0.1-1.0, default: 0.2)
- [ ] Add `subjectPrompt` parameter validation (default: "person")
- [ ] Add `maskBlendPixels` parameter validation (range: 0-32, default: 8)
- [ ] Add conditional logic for workflow selection:
  - If `workflow === "bulletproof-background"`: require input image, use `buildBulletproofBackgroundWorkflow()`
  - If `workflow === "z-image-turbo"`: use existing `buildZImageTurboWorkflow()`
  - If `workflow === "flux2"`: use existing `buildFlux2Workflow()`
- [ ] Return 400 error with message "Input image required for Bulletproof Background" when missing
- [ ] Apply workflow-specific default values:
  - Bulletproof Background: `steps=9`, `cfg=1`, `denoise=0.9`, `shift=3`, `detectionConfidence=0.2`
  - Z Image Turbo: `steps=9`, `cfg=1`, `denoise=0.4`, `shift=3`
  - Flux 2: `steps=20`, `guidance=4`

### Files
- `src/app/api/generate/route.ts` (update)

---

## Phase 3: Update Generation Hook

Extend the generation hook with Bulletproof Background-specific state management.

### Tasks
- [ ] Add `"bulletproof-background"` to workflow options
- [ ] Add `detectionConfidence` to settings state (default: `0.2`)
- [ ] Add `subjectPrompt` to settings state (default: `"person"`)
- [ ] Add `maskBlendPixels` to settings state (default: `8`)
- [ ] Update `setWorkflow(workflow)` function to handle new workflow:
  - When switching to Bulletproof Background: set `steps=9`, `guidance=1`, `denoise=0.9`, `detectionConfidence=0.2`
  - Reset other workflow defaults when switching away
- [ ] Update `canGenerate` computed value:
  - If Bulletproof Background: `hasReferenceImage && hasPrompt`
  - If Z Image Turbo: `hasReferenceImage && hasPrompt`
  - If Flux 2: `hasPrompt`

### Files
- `src/hooks/use-prompt-builder.ts` (update)

---

## Phase 4: Add Workflow Selector UI Option

Add Bulletproof Background to workflow selection dropdown.

### Tasks
- [ ] Add new option to workflow selector:
  - "Bulletproof Background (Inpainting)" - value: `"bulletproof-background"`
- [ ] Update selector to show all three options:
  - "Flux 2 (Text-to-Image)" - value: `"flux2"`
  - "Z Image Turbo (Image-to-Image)" - value: `"z-image-turbo"`
  - "Bulletproof Background (Inpainting)" - value: `"bulletproof-background"`
- [ ] Wire `onChange` to handle new workflow value

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 5: Conditional Settings Display

Show/hide settings based on Bulletproof Background workflow.

### Tasks
- [ ] Add denoise slider (visible for Bulletproof Background):
  - Range: 0.1 to 1.0
  - Step: 0.05
  - Default: 0.9 (higher than Z Image Turbo)
  - Label: "Denoise Strength"
  - Helper text: "Higher = more background transformation"
- [ ] Add detection confidence slider (only for Bulletproof Background):
  - Range: 0.1 to 1.0
  - Step: 0.1
  - Default: 0.2
  - Label: "Detection Confidence"
  - Helper text: "Lower = more sensitive detection"
- [ ] Add subject text input (only for Bulletproof Background):
  - Default: "person"
  - Label: "Subject to Preserve"
  - Helper text: "What to detect and keep (e.g., person, cat, dog)"
- [ ] Hide Resolution selector when Bulletproof Background selected
- [ ] Hide Aspect Ratio selector when Bulletproof Background selected
- [ ] Update Steps slider for Bulletproof Background: range 1-20, default 9
- [ ] Update CFG slider for Bulletproof Background: range 1-5, default 1

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 6: Input Image Validation UI

Disable Generate button and show validation message.

### Tasks
- [ ] Update `isGenerateDisabled` computed value to include Bulletproof Background:
  - `(workflow === "bulletproof-background" || workflow === "z-image-turbo") && !referenceImage`
- [ ] Show tooltip message: "Input image required for Bulletproof Background" when applicable
- [ ] Add info text explaining the workflow: "Automatically detects and preserves the subject while replacing the background"

### Files
- `src/components/generate/preview/preview-panel.tsx` (update)

---

## Phase 7: Update Refine API Route

Extend the refine endpoint to support Bulletproof Background workflow.

### Tasks
- [ ] Add `workflow: "bulletproof-background"` parameter to refine request validation
- [ ] Apply same workflow selection logic as generate route
- [ ] For Bulletproof Background refinements, use previous output as input image
- [ ] Validate new parameters (detectionConfidence, subjectPrompt) for refine requests

### Files
- `src/app/api/generate/[id]/refine/route.ts` (update)

---

## Phase 8: Integration and Polish

Final integration, error handling, and UX improvements.

### Tasks
- [ ] Update error alert component with Bulletproof Background specific messages:
  - "SAM3 model not found" error handling
  - "Subject not detected in image" error handling
- [ ] Ensure progress tracking works for Bulletproof Background (different node count)
- [ ] Test workflow switching preserves compatible settings
- [ ] Verify reference image upload works with Bulletproof Background
- [ ] Add workflow type to generation history/metadata (stored in settings)
- [ ] Add helpful placeholder text for background prompt: "Describe the new background..."

### Files
- `src/components/generate/generation-error-alert.tsx` (update)
- Various component files as needed

---

## File Summary

### Modified Files
1. `src/lib/types/generation.ts` - Add "bulletproof-background" to WorkflowType, add new settings fields
2. `src/lib/comfyui.ts` - Add buildBulletproofBackgroundWorkflow() function
3. `src/app/api/generate/route.ts` - Add workflow selection and validation
4. `src/app/api/generate/[id]/refine/route.ts` - Add workflow support for refine
5. `src/hooks/use-prompt-builder.ts` - Add workflow state and defaults switching
6. `src/components/generate/preview/preview-panel.tsx` - Add workflow option, new sliders, conditional UI
7. `src/components/generate/generation-error-alert.tsx` - Add Bulletproof Background error messages

### No New Files Required
All changes extend existing files from the ComfyUI integration.

---

## Workflow Node Reference

### Bulletproof Background Workflow Structure

```
                                    [67] LoadSAM3Model
                                           │
[41] LoadImage ──────────────────► [66] SAM3Grounding ──► [78] InpaintCropImproved
         │                                                        │
         │                                                   ┌────┴────┐
         │                                                   │  mask   │  pixels
         │                                                   │         │
         │                                                   ▼         ▼
[54] CLIPLoader ──► [12] CLIPTextEncode ──► [52] ConditioningZeroOut
                            │                        │
                            ▼                        ▼
                     [10] InpaintModelConditioning ◄─┘
                            │
                            ▼
[55] UNETLoader ──► [53] ModelSamplingAuraFlow ──► [17] DifferentialDiffusion
                                                           │
                                                           ▼
                                                    [16] KSampler
                                                           │
                                                           ▼
[56] VAELoader ─────────────────────────────────► [25] VAEDecode
                                                           │
                                                           ▼
                                                    [79] InpaintStitchImproved
                                                           │
                                                           ▼
                                                    [XX] SaveImage
```

### Node Details from Workflow JSON

| Node ID | Class Type | Purpose | Key Parameters |
|---------|------------|---------|----------------|
| 10 | InpaintModelConditioning | Set up inpainting conditioning | noise_mask=true |
| 12 | CLIPTextEncode | Encode background prompt | text **[User Input]** |
| 16 | KSampler | Main sampling | seed, steps=9, cfg=1, denoise=0.9 |
| 17 | DifferentialDiffusion | Control diffusion strength | strength=1 |
| 25 | VAEDecode | Decode latent to image | automatic |
| 41 | LoadImage | Load input image | image **[User Input]** |
| 52 | ConditioningZeroOut | Zero out negative | automatic |
| 53 | ModelSamplingAuraFlow | Model sampling config | shift=3 |
| 54 | CLIPLoader | Load CLIP model | qwen_3_4b.safetensors, lumina2 |
| 55 | UNETLoader | Load diffusion model | z_image_turbo_bf16.safetensors |
| 56 | VAELoader | Load VAE | ae.safetensors |
| 66 | SAM3Grounding | Segment subject | confidence_threshold=0.2, text_prompt="person" |
| 67 | LoadSAM3Model | Load SAM3 | models/sam3/sam3.pt |
| 78 | InpaintCropImproved | Prepare mask & crop | mask_invert=true, mask_blend_pixels=8 |
| 79 | InpaintStitchImproved | Stitch result back | automatic |

### User-Configurable Parameters Summary

| UI Control | Node | Parameter | Default | Range |
|------------|------|-----------|---------|-------|
| Background Prompt | 12 | `text` | - | Text |
| Input Image | 41 | `image` | **Required** | File |
| Steps | 16 | `steps` | 9 | 1-20 |
| CFG | 16 | `cfg` | 1 | 1-5 |
| Denoise | 16 | `denoise` | 0.9 | 0.1-1.0 |
| Seed | 16 | `seed` | Random | Number |
| Shift | 53 | `shift` | 3 | 1-10 |
| Detection Confidence | 66 | `confidence_threshold` | 0.2 | 0.1-1.0 |
| Subject Prompt | 66 | `text_prompt` | "person" | Text |
| Mask Blend | 78 | `mask_blend_pixels` | 8 | 0-32 |

### Fixed Parameters (Not Exposed to UI)

| Node | Parameter | Value | Reason |
|------|-----------|-------|--------|
| 17 | strength | 1 | Optimal for inpainting |
| 54 | clip_name | qwen_3_4b.safetensors | Required for Z Image Turbo |
| 54 | type | lumina2 | Required for Z Image Turbo |
| 55 | unet_name | z_image_turbo_bf16.safetensors | Required model |
| 56 | vae_name | ae.safetensors | Required VAE |
| 67 | model_path | models/sam3/sam3.pt | Required SAM3 model |
| 78 | mask_invert | true | Preserve subject, replace background |
| 78 | output_target_width | 1024 | Standard output size |
| 78 | output_target_height | 1024 | Standard output size |
| 78 | output_resize_to_target_size | true | Ensure consistent output |

---

## Testing Checklist

### Unit Tests
- [ ] `buildBulletproofBackgroundWorkflow()` generates correct node structure
- [ ] All node connections are properly mapped
- [ ] Default values are applied correctly
- [ ] User parameters override defaults

### Integration Tests
- [ ] API route accepts bulletproof-background workflow type
- [ ] API returns 400 when input image missing
- [ ] Progress tracking reports correct step count
- [ ] Generated image is saved and returned correctly

### E2E Tests
- [ ] Workflow selector shows Bulletproof Background option
- [ ] Settings UI updates when workflow selected
- [ ] Generate button disabled without input image
- [ ] Full generation flow completes successfully
- [ ] Refine endpoint works with Bulletproof Background

---

## Dependencies

### Required ComfyUI Custom Nodes
- **SAM3** - For person segmentation (LoadSAM3Model, SAM3Grounding)
- **Inpaint Improved** - For crop/stitch operations (InpaintCropImproved, InpaintStitchImproved)

### Required Models
- `z_image_turbo_bf16.safetensors` - Main diffusion model
- `qwen_3_4b.safetensors` - CLIP text encoder
- `ae.safetensors` - VAE
- `models/sam3/sam3.pt` - SAM3 segmentation model
