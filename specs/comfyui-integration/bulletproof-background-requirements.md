# Bulletproof Background Integration - Requirements

## Overview
Extend the ComfyUI integration to support the "Bulletproof Background" inpainting workflow. This workflow uses Z Image Turbo with SAM3 segmentation to automatically detect a person in an image and replace the background while preserving the subject. ComfyUI runs locally on `127.0.0.1:8000`.

## User Preferences
- **Manual workflow selection** - User explicitly chooses Bulletproof Background from dropdown
- **Automatic person detection** - SAM3 model segments the person automatically
- **Manual prompting** - User provides prompt text describing the new background
- **Input image required** - Block generation if no input image provided

## Functional Requirements

### FR-1: Workflow Selection
- Add "Bulletproof Background (Inpainting)" option to workflow selector dropdown in Preview Panel
- Position after existing workflows: Flux 2, Z Image Turbo
- Persist selection during session

### FR-2: Bulletproof Background Parameters
Based on workflow (`docs/technical/comfyui/inpainting-with-z-image-turbo.json`):

| Parameter | Node | Range | Default |
|-----------|------|-------|---------|
| Prompt (new background) | Node 12 (CLIPTextEncode) | Text | - |
| Input Image | Node 41 (LoadImage) | File | **Required** |
| Steps | Node 16 (KSampler) | 1-20 | 9 |
| CFG | Node 16 (KSampler) | 1-5 | 1 |
| Denoise | Node 16 (KSampler) | 0.1-1.0 | 0.9 |
| Seed | Node 16 (KSampler) | Number | Random |
| Shift | Node 53 (ModelSamplingAuraFlow) | 1-10 | 3 |
| Detection Confidence | Node 66 (SAM3Grounding) | 0.1-1.0 | 0.2 |
| Subject to Detect | Node 66 (SAM3Grounding) | Text | "person" |
| Mask Invert | Node 78 (InpaintCropImproved) | Boolean | true |
| Mask Blend Pixels | Node 78 (InpaintCropImproved) | 0-32 | 8 |
| Output Width | Node 78 (InpaintCropImproved) | Pixels | 1024 |
| Output Height | Node 78 (InpaintCropImproved) | Pixels | 1024 |

### FR-3: Conditional UI Controls
When Bulletproof Background is selected:
- **Show**: Denoise slider (0.1-1.0, step 0.05, default 0.9)
- **Show**: Detection confidence slider (0.1-1.0, step 0.1, default 0.2)
- **Show**: Subject text input (default: "person")
- **Hide**: Resolution and Aspect Ratio selectors (output is 1024x1024)
- **Adjust defaults**: Steps=9, CFG=1, Denoise=0.9

### FR-4: Input Image Validation
- Disable Generate button when Bulletproof Background selected and no reference image uploaded
- Show tooltip: "Input image required for Bulletproof Background"
- Server returns 400 error if Bulletproof Background request lacks input image

### FR-5: Model Requirements
The workflow requires the following models to be present in ComfyUI:
- **UNET**: `z_image_turbo_bf16.safetensors`
- **CLIP**: `qwen_3_4b.safetensors` (type: lumina2)
- **VAE**: `ae.safetensors`
- **SAM3**: `models/sam3/sam3.pt`

### FR-6: Excluded Nodes (Preview/Debug Only)
The following nodes from the workflow are for preview/debug and not needed for API usage:
- Node 81 (MaskToImage) - Debug mask visualization
- Node 82 (PreviewImage) - Preview mask
- Node 111 (Image Comparer) - Before/after comparison
- Node 118 (PreviewImage) - Preview segmentation result

## Technical Workflow Details

### Segmentation Pipeline
1. Load input image (Node 41)
2. Load SAM3 model (Node 67)
3. Segment subject using text prompt (Node 66)
4. Crop and prepare mask for inpainting (Node 78)

### Inpainting Pipeline
1. Load UNET, CLIP, VAE models (Nodes 55, 54, 56)
2. Encode background prompt (Node 12)
3. Zero out negative conditioning (Node 52)
4. Apply differential diffusion (Node 17)
5. Set up inpaint model conditioning (Node 10)
6. Sample with KSampler (Node 16)
7. Decode latent (Node 25)
8. Stitch inpainted region back (Node 79)

## Non-Functional Requirements

### NFR-1: Backward Compatibility
Existing Flux 2 and Z Image Turbo functionality must remain unchanged. Default behavior matches current implementation.

### NFR-2: Shared Infrastructure
Reuse existing ComfyUI client, progress tracking, and storage mechanisms.

### NFR-3: Performance Considerations
SAM3 segmentation adds processing time. Expected generation time: 15-30 seconds depending on hardware.

## Out of Scope
- Custom mask drawing/editing
- Multiple subject detection
- Subject selection from detected objects
- Custom SAM3 model selection
