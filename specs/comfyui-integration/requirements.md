# ComfyUI Integration - Requirements

## Overview
Replace the stub image generator with a real ComfyUI integration using the Flux 2 workflow. ComfyUI runs locally on `127.0.0.1:8000`.

## User Preferences
- **No fallback** - Require ComfyUI to be running (remove stub generator)
- **WebSocket progress** - Show real-time step-by-step progress during generation
- **Full settings** - Allow users to configure Steps, Guidance, and Seed

## Functional Requirements

### FR-1: ComfyUI API Integration
- Connect to ComfyUI instance at configurable URL (default: `http://127.0.0.1:8000`)
- Queue generation workflows via POST `/prompt` endpoint
- Poll execution status via GET `/history/{prompt_id}`
- Fetch generated images via GET `/view`
- Upload reference images via POST `/upload/image`

### FR-2: Configurable Generation Parameters
Based on the Flux 2 workflow (`docs/technical/comfyui/image_flux2.json`):

| Parameter | Node | Range | Default |
|-----------|------|-------|---------|
| Prompt | Node 6 (CLIPTextEncode) | Text | - |
| Steps | Node 48 (Flux2Scheduler) | 1-50 | 20 |
| Guidance | Node 26 (FluxGuidance) | 1-10 | 4 |
| Seed | Node 25 (RandomNoise) | Number | Random |
| Width/Height | Nodes 47, 48 | Pixels | Based on resolution + aspect ratio |
| Reference Image | Node 46 (LoadImage) | File | Optional |

### FR-3: Resolution Presets
Map resolution + aspect ratio settings to actual pixel dimensions:

| Resolution | 1:1 | 16:9 | 9:16 | 4:3 | 3:4 | 21:9 |
|------------|-----|------|------|-----|-----|------|
| 1K | 1024x1024 | 1280x720 | 720x1280 | 1152x864 | 864x1152 | 1344x576 |
| 2K | 2048x2048 | 2560x1440 | 1440x2560 | 2304x1728 | 1728x2304 | 2688x1152 |

### FR-4: Real-time Progress Updates
- Display step-by-step progress during generation (e.g., "Step 12/20")
- Show percentage completion via progress bar
- Use Server-Sent Events (SSE) to stream progress from server to client
- Server connects to ComfyUI WebSocket (`ws://127.0.0.1:8000/ws`) for real-time updates

### FR-5: User Interface Controls
Add the following controls to the Preview Panel:
- **Steps slider**: Range 1-50, default 20
- **Guidance slider**: Range 1-10, default 4
- **Seed input**: Optional number field, shows "Random" placeholder when empty

### FR-6: Error Handling
- Display clear error message when ComfyUI is not running
- Handle generation timeout (60 second maximum)
- Log and display ComfyUI workflow errors

## Non-Functional Requirements

### NFR-1: No Fallback Mode
The stub generator will be removed. If ComfyUI is not available, generation should fail with a clear error message.

### NFR-2: Environment Configuration
Support `COMFYUI_URL` environment variable for configuring the ComfyUI endpoint.

## Out of Scope
- Unit and E2E testing
- Authentication/authorization
- Multiple ComfyUI instances
- Custom workflow uploads
