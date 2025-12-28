# Z Image Turbo Integration - Requirements

## Overview
Extend the ComfyUI integration to support Z Image Turbo image-to-image workflow alongside Flux 2. ComfyUI runs locally on `127.0.0.1:8000`.

## User Preferences
- **Manual workflow selection** - User explicitly chooses between Flux 2 and Z Image Turbo
- **Flux 2 as default** - New generations default to Flux 2 workflow
- **Manual prompting** - User provides prompt text (no auto-captioning)
- **Input image required** - Block generation if Z Image Turbo selected without image

## Functional Requirements

### FR-1: Workflow Selection
- Add workflow selector dropdown in Preview Panel
- Options: "Flux 2 (Text-to-Image)" and "Z Image Turbo (Image-to-Image)"
- Default selection: Flux 2
- Persist selection during session

### FR-2: Z Image Turbo Parameters
Based on workflow (`docs/technical/comfyui/image-to-image-with-z-image-turbo.json`):

| Parameter | Node | Range | Default |
|-----------|------|-------|---------|
| Prompt | Node 5 (CLIPTextEncode) | Text | - |
| Input Image | Node 4 (LoadImage) | File | **Required** |
| Steps | Node 7 (KSampler) | 1-20 | 9 |
| CFG | Node 7 (KSampler) | 1-5 | 1 |
| Denoise | Node 7 (KSampler) | 0.1-1.0 | 0.4 |
| Seed | Node 7 (KSampler) | Number | Random |
| Max Size | Node 9 (ImageScaleToMaxDimension) | Pixels | 1024 |
| Shift | Node 14 (ModelSamplingAuraFlow) | Number | 3 |

### FR-3: Conditional UI Controls
When Z Image Turbo is selected:
- **Show**: Denoise slider (0.1-1.0, step 0.05, default 0.4)
- **Hide**: Resolution and Aspect Ratio selectors (determined by input image)
- **Adjust defaults**: Steps=9, CFG=1

When Flux 2 is selected:
- **Hide**: Denoise slider
- **Show**: Resolution and Aspect Ratio selectors
- **Adjust defaults**: Steps=20, Guidance=4

### FR-4: Input Image Validation
- Disable Generate button when Z Image Turbo selected and no reference image uploaded
- Show tooltip: "Input image required for Z Image Turbo"
- Server returns 400 error if Z Image Turbo request lacks input image

### FR-5: Excluded Nodes
The following nodes from the workflow are excluded (not needed for API usage):
- Node 16 (Florence2Run) - Auto-captioning
- Node 18 (Florence2ModelLoader) - Caption model
- Node 20 (ShowText) - Debug display

## Non-Functional Requirements

### NFR-1: Backward Compatibility
Existing Flux 2 functionality must remain unchanged. Default behavior matches current implementation.

### NFR-2: Shared Infrastructure
Reuse existing ComfyUI client, progress tracking, and storage mechanisms.

## Out of Scope
- Auto-captioning with Florence2
- Auto-switching workflow based on image presence
- Custom workflow uploads