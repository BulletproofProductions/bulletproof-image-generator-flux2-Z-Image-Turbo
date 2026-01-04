# Bulletproof Image Upscaler - Requirements

## Overview
Extend the ComfyUI integration to support Bulletproof Image Upscaler (SeedVR2 4X) workflow using existing generate endpoint. ComfyUI runs locally on `127.0.0.1:8000`.

## User Preferences
- **Existing endpoint** - Use `/api/generate` endpoint
- **VRAM presets** - User-friendly Low/Standard/High options instead of raw tile sizes
- **2K default resolution** - Balanced quality and performance
- **Read-only prompt** - Display "UPSCALE" in prompt field (not editable)
- **Comparison view** - Show original and upscaled images side-by-side in results
- **Download button** - Only on upscaled image, not on original

## Functional Requirements

### FR-1: Workflow Selection
- Add "Bulletproof Upscaler (4X)" option to workflow selector dropdown
- Default selection remains: Flux 2

### FR-2: Bulletproof Upscaler Parameters
Based on workflow (`docs/technical/comfyui/Z-Image-Turbo-Upscale.json`):

| Parameter | Node | Options | Default |
|-----------|------|---------|---------|
| Input Image | Node 41 (LoadImage) | File | **Required** |
| Max Width | Node 18 (SeedVR2VideoUpscaler) | Based on resolution | 2048 (2K) |
| Max Height | Node 18 (SeedVR2VideoUpscaler) | Based on resolution | 2048 (2K) |
| VRAM Preset | Node 15 (SeedVR2LoadVAEModel) | Low/Standard/High | Standard |

### FR-3: VRAM Presets
User-friendly presets that map to VAE tile sizes:

| Preset | Tile Size | Use Case |
|--------|-----------|----------|
| Low VRAM | 256 | GPUs with 8GB or less, slower but stable |
| Standard | 512 | GPUs with 12-16GB, balanced |
| High VRAM | 1024 | GPUs with 24GB+, fastest processing |

### FR-4: Resolution Mapping (Default: 2K)
Map existing resolution dropdown to max output dimensions:

| Resolution | Max Width | Max Height |
|------------|-----------|------------|
| 1K | 1024 | 1024 |
| **2K** | **2048** | **2048** |
| 4K | 4096 | 4096 |

Note: Actual output size is input dimensions × 4, capped at max values.

### FR-5: Read-Only Prompt Field
When Bulletproof Upscaler is selected:
- Prompt input displays "UPSCALE" as value
- Field is disabled/read-only (not editable)
- Prompt value sent to API is "UPSCALE" (upscaler doesn't use prompt)
- Styled to indicate disabled state (opacity, cursor)

### FR-6: Conditional UI Controls
When Bulletproof Upscaler is selected:
- **Show**: Resolution dropdown (default 2K), VRAM Preset dropdown
- **Disabled**: Prompt field (shows "UPSCALE")
- **Hide**: Aspect Ratio, Steps, Guidance/CFG, Denoise, Seed

### FR-7: Input Image Validation
- Disable Generate button when upscaler selected without input image
- Show tooltip: "Input image required for Bulletproof Upscaler"
- Server returns 400 error if upscaler request lacks input image

### FR-8: Results Comparison View
When upscaler workflow completes:
- Display original input image alongside upscaled output image
- Show images in side-by-side layout (or stacked on mobile)
- Display labels beneath each image:
  - "Original" under input image
  - "Upscaled" under output image
- **Download button only on upscaled image** (not on original)
- Store original image URL in generation metadata for display

### FR-9: Progress Tracking
- Use existing SSE progress endpoint (`/api/generate/progress`)
- Progress tracking works with SeedVR2 workflow

## Non-Functional Requirements

### NFR-1: Backward Compatibility
Existing workflows (Flux 2, Z Image Turbo, Bulletproof Background) display single image in results (unchanged).

### NFR-2: Shared Infrastructure
Reuse existing generate endpoint, ComfyUI client, progress SSE, and storage.

### NFR-3: VRAM Consideration
Default tile size (512) balances quality and VRAM usage. Users with limited VRAM can select Low (256).

## Workflow Node Reference

### SeedVR2 Upscaler Workflow Structure

```
[41] LoadImage ──────────────────────────────────────────┐
                                                         │
[16] SeedVR2LoadDiTModel ───────────────────────────────┬┴─► [18] SeedVR2VideoUpscaler ─► [19] SaveImage
                                                        │
[15] SeedVR2LoadVAEModel ───────────────────────────────┘
```

### Fixed Model Configuration (Not User-Configurable)
| Node | Parameter | Value |
|------|-----------|-------|
| 16 | dit_model | `seedvr2_ema_7b_fp16.safetensors` |
| 16 | device | `cuda:0` |
| 15 | vae_model | `ema_vae_fp16.safetensors` |
| 15 | device | `cuda:0` |
| 18 | seed | 9527 |
| 18 | seed_mode | `fixed` |
| 18 | color_space | `lab` |
| 19 | filename_prefix | `BulletproofUpscaler` |

## Out of Scope
- Custom upscale factors (fixed at 4X by SeedVR2)
- Video upscaling (image only)
- Seed randomization (SeedVR2 works best with fixed seed)
- Auto-detect optimal tile size based on VRAM
