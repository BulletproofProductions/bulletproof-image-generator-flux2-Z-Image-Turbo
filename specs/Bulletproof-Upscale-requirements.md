# Bulletproof Image Upscaler - Requirements

## Overview
Extend the ComfyUI integration to support Bulletproof Image Upscaler (SeedVR2 4X) workflow using existing generate endpoint. ComfyUI runs locally on `127.0.0.1:8000`.

## Functional Requirements

### FR-1: Workflow Selection
- Add "Bulletproof Upscaler (4X)" option to workflow selector dropdown
- Default selection remains: Flux 2

### FR-2: Bulletproof Upscaler Parameters

| Parameter | Node | Options | Default |
|-----------|------|---------|---------|
| Input Image | Node 41 (LoadImage) | File | **Required** |
| Max Width/Height | Node 18 (SeedVR2VideoUpscaler) | Based on resolution | 2048 (2K) |
| VRAM Preset | Node 15 (SeedVR2LoadVAEModel) | Low/Standard/High | Standard |

### FR-3: VRAM Presets

| Preset | Tile Size | Use Case |
|--------|-----------|----------|
| Low VRAM | 256 | GPUs with 8GB or less |
| Standard | 512 | GPUs with 12-16GB |
| High VRAM | 1024 | GPUs with 24GB+ |

### FR-4: Resolution Mapping (Default: 2K)

| Resolution | Max Width | Max Height |
|------------|-----------|------------|
| 1K | 1024 | 1024 |
| **2K** | **2048** | **2048** |
| 4K | 4096 | 4096 |

### FR-5: Read-Only Prompt Field
When Bulletproof Upscaler is selected:
- Prompt input displays "UPSCALE" (read-only, not editable)
- Styled to indicate disabled state

### FR-6: Conditional UI Controls
When Bulletproof Upscaler is selected:
- **Show**: Resolution dropdown (default 2K), VRAM Preset dropdown
- **Disabled**: Prompt field (shows "UPSCALE")
- **Hide**: Aspect Ratio, Steps, Guidance/CFG, Denoise, Seed

### FR-7: Input Image Validation
- Disable Generate button when upscaler selected without input image
- Show tooltip: "Input image required for Bulletproof Upscaler"

### FR-8: Results Comparison View
When upscaler workflow completes:
- Side-by-side layout: original (left) and upscaled (right)
- Responsive: stack vertically on mobile
- Labels beneath each image: "Original" and "Upscaled"
- **Download button only on upscaled image** (not on original)

### FR-9: Progress Tracking
- Use existing SSE progress endpoint

## Non-Functional Requirements

### NFR-1: Backward Compatibility
Existing workflows display single image with download button (unchanged).

### NFR-2: Shared Infrastructure
Reuse existing generate endpoint, ComfyUI client, progress SSE, and storage.

## Out of Scope
- Custom upscale factors (fixed at 4X)
- Video upscaling
- Seed customization