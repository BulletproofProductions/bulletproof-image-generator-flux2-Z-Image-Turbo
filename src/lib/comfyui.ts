/**
 * @fileoverview ComfyUI API Client - Handles all communication with the ComfyUI server
 * 
 * This module provides a comprehensive client for interacting with a local ComfyUI server,
 * including workflow execution, real-time progress tracking, and image handling.
 * 
 * ## Architecture Overview
 * 
 * ```
 * ┌─────────────────────┐     REST API      ┌─────────────────────┐
 * │    Next.js App      │ ◄───────────────► │   ComfyUI Server    │
 * │   (ComfyUIClient)   │                   │  (localhost:8000)   │
 * │                     │   WebSocket       │                     │
 * │                     │ ◄───────────────► │   Progress Events   │
 * └─────────────────────┘                   └─────────────────────┘
 * ```
 * 
 * ## Supported Workflows
 * 
 * The client can build 4 different workflow types:
 * 
 * 1. **Flux 2** (`buildFlux2Workflow`) - Text-to-image with optional reference
 *    - Uses: flux2_dev_fp8mixed model, mistral CLIP
 *    - Supports: Resolution/aspect control, guidance, optional reference images
 * 
 * 2. **Z Image Turbo** (`buildZImageTurboWorkflow`) - Fast image-to-image
 *    - Uses: z_image_turbo_fp8_e4m3fn model, qwen CLIP
 *    - Input: Required reference image, outputs transformation
 * 
 * 3. **Bulletproof Background** (`buildBulletproofBackgroundWorkflow`) - Background replacement
 *    - Uses: SAM3 for segmentation, Z Image Turbo for inpainting
 *    - Input: Image with subject, outputs new background while preserving subject
 * 
 * 4. **Bulletproof Upscaler** (`buildBulletproofUpscalerWorkflow`) - 4X upscaling
 *    - Uses: SeedVR2 DiT model
 *    - Input: Low-res image, outputs high-resolution version
 * 
 * ## Real-Time Progress Tracking
 * 
 * The client maintains a WebSocket connection to receive progress updates:
 * - `execution_progress` - Overall execution progress
 * - `progress` - Step-by-step inference progress (preferred)
 * - `progress_state` - Node-level progress (fallback)
 * 
 * ## Usage Example
 * 
 * ```typescript
 * import { comfyui, getResolutionDimensions } from "@/lib/comfyui";
 * 
 * // Build and queue a workflow
 * const dims = getResolutionDimensions("2K", "16:9");
 * const workflow = comfyui.buildFlux2Workflow({
 *   prompt: "A beautiful sunset over mountains",
 *   width: dims.width,
 *   height: dims.height,
 *   steps: 20,
 *   guidance: 4
 * });
 * 
 * const { prompt_id } = await comfyui.queuePrompt(workflow);
 * 
 * // Track progress via WebSocket
 * const cleanup = comfyui.connectToProgressSocket(prompt_id, ({ value, max }) => {
 *   console.log(`Progress: ${value}/${max}`);
 * });
 * 
 * // Wait for completion and get images
 * const history = await comfyui.waitForCompletion(prompt_id);
 * cleanup();
 * ```
 * 
 * @module lib/comfyui
 * @see {@link https://docs.comfy.org/essentials/comfyui_server ComfyUI Server Documentation}
 */

import type { ImageResolution, AspectRatio, VRAMPreset } from "@/lib/types/generation";

// ==========================================
// Type Definitions
// ==========================================

/**
 * ComfyUI workflow structure - a dictionary of nodes keyed by node ID
 * 
 * Each node contains:
 * - `inputs`: Key-value pairs for node inputs (can reference other nodes via [nodeId, outputIndex])
 * - `class_type`: The ComfyUI node class name
 * - `_meta`: Optional metadata (title shown in UI)
 * 
 * @example
 * ```typescript
 * const workflow: ComfyUIWorkflow = {
 *   "6": {
 *     inputs: { text: "A sunset", clip: ["38", 0] },
 *     class_type: "CLIPTextEncode",
 *     _meta: { title: "Positive Prompt" }
 *   }
 * };
 * ```
 */
export interface ComfyUIWorkflow {
  [nodeId: string]: {
    inputs: Record<string, unknown>;
    class_type: string;
    _meta?: { title: string };
  };
}

/**
 * Response from POST /prompt endpoint after queuing a workflow
 * 
 * @property prompt_id - Unique identifier for tracking this execution
 * @property number - Queue position number
 * @property node_errors - Any validation errors from nodes
 */
export interface QueuePromptResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

/**
 * Output from a single node in the execution history
 * 
 * Image-producing nodes (SaveImage, etc.) populate the `images` array
 * with information needed to fetch the generated images.
 */
export interface HistoryOutput {
  images?: Array<{
    filename: string;
    subfolder: string;
    type: string;
  }>;
}

/**
 * Full execution history entry for a completed prompt
 * 
 * Retrieved from GET /history/{prompt_id} after execution completes.
 * Contains the original prompt, all node outputs, and execution status.
 */
export interface HistoryEntry {
  prompt: [number, string, Record<string, unknown>, Record<string, unknown>];
  outputs: Record<string, HistoryOutput>;
  status: {
    status_str: string;
    completed: boolean;
    messages: Array<[string, Record<string, unknown>]>;
  };
}

/**
 * Options for building a Flux 2 text-to-image workflow
 * 
 * @property prompt - Text description of the desired image
 * @property width - Output width in pixels (use getResolutionDimensions)
 * @property height - Output height in pixels (use getResolutionDimensions)
 * @property steps - Number of diffusion steps (default: 20, range: 1-50)
 * @property guidance - CFG guidance scale (default: 4, range: 1-10)
 * @property seed - Random seed for reproducibility (default: random)
 * @property referenceImageFilename - Optional reference image for style transfer
 */
export interface WorkflowOptions {
  prompt: string;
  width: number;
  height: number;
  steps?: number | undefined;
  guidance?: number | undefined;
  seed?: number | undefined;
  referenceImageFilename?: string | undefined;
}

/**
 * Options for building a Z Image Turbo image-to-image workflow
 * 
 * Z Image Turbo is optimized for fast image transformation with
 * fewer steps than standard diffusion models.
 * 
 * @property prompt - Text description guiding the transformation
 * @property inputImageFilename - Required: filename from uploadImage() call
 * @property steps - Diffusion steps (default: 9, range: 1-20)
 * @property cfg - CFG scale (default: 1, range: 1-5, low values recommended)
 * @property denoise - Denoising strength (default: 0.4, range: 0.1-1.0)
 *                     Lower = preserve more original, Higher = more creative
 * @property seed - Random seed for reproducibility
 * @property largestSize - Max dimension in pixels (default: 1024)
 * @property shift - ModelSamplingAuraFlow shift parameter (default: 3)
 */
export interface ZImageTurboWorkflowOptions {
  prompt: string;
  inputImageFilename: string;
  steps?: number | undefined;
  cfg?: number | undefined;
  denoise?: number | undefined;
  seed?: number | undefined;
  largestSize?: number | undefined;
  shift?: number | undefined;
}

/**
 * Options for building a Bulletproof Background replacement workflow
 * 
 * This workflow uses SAM3 for automatic subject segmentation and
 * Z Image Turbo for inpainting the background while preserving the subject.
 * 
 * ## Workflow Pipeline
 * ```
 * Input Image → SAM3 Segmentation → Mask Inversion → Inpaint Background → Output
 * ```
 * 
 * @property prompt - Description of the new background (not the subject)
 * @property inputImageFilename - Required: filename from uploadImage() call
 * @property steps - Diffusion steps (default: 9)
 * @property cfg - CFG scale (default: 1)
 * @property denoise - Denoising strength (default: 0.9, high for background replacement)
 * @property seed - Random seed for reproducibility
 * @property shift - ModelSamplingAuraFlow shift (default: 3)
 * @property detectionConfidence - SAM3 detection threshold (default: 0.2, lower = more sensitive)
 * @property subjectToDetect - Text prompt for SAM3 segmentation (default: "person")
 * @property maskBlendPixels - Edge blending in pixels (default: 8)
 * @property outputWidth - Final output width (default: 1024)
 * @property outputHeight - Final output height (default: 1024)
 */
export interface BulletproofBackgroundWorkflowOptions {
  prompt: string;
  inputImageFilename: string;
  steps?: number | undefined;
  cfg?: number | undefined;
  denoise?: number | undefined;
  seed?: number | undefined;
  shift?: number | undefined;
  detectionConfidence?: number | undefined;
  subjectToDetect?: string | undefined;
  maskBlendPixels?: number | undefined;
  outputWidth?: number | undefined;
  outputHeight?: number | undefined;
}

/**
 * Options for building a Bulletproof Upscaler workflow
 * 
 * Uses SeedVR2 (Seed Video/Image Upscaler version 2) for high-quality
 * 4X upscaling with AI enhancement.
 * 
 * ## VRAM Considerations
 * The tile size affects VRAM usage significantly:
 * - `low`: 256px tiles - ~4GB VRAM, slower but works on most GPUs
 * - `standard`: 512px tiles - ~8GB VRAM, good balance
 * - `high`: 1024px tiles - ~16GB+ VRAM, fastest if you have the memory
 * 
 * @property inputImageFilename - Required: filename from uploadImage() call
 * @property resolution - Target shortest edge resolution (default: 1080)
 * @property maxResolution - Maximum dimension limit (default: 4096)
 * @property vramPreset - Memory usage preset: "low" | "standard" | "high"
 * @property seed - Random seed for reproducibility (default: 9527)
 */
export interface BulletproofUpscalerWorkflowOptions {
  inputImageFilename: string;
  resolution?: number | undefined;
  maxResolution?: number | undefined;
  vramPreset?: VRAMPreset | undefined;
  seed?: number | undefined;
}

/**
 * Maps VRAM preset names to tile sizes for the upscaler
 * 
 * Larger tiles = faster processing but more VRAM required.
 * The tile_overlap is always 128px to ensure seamless stitching.
 */
export const VRAM_PRESET_MAP: Record<VRAMPreset, number> = {
  low: 256,      // ~4GB VRAM - for older GPUs or limited memory
  standard: 512, // ~8GB VRAM - recommended for most modern GPUs
  high: 1024,    // ~16GB+ VRAM - for high-end GPUs (RTX 4090, etc.)
};

// ==========================================
// Resolution Mapping
// ==========================================

/**
 * Resolution mapping table for converting resolution presets and aspect ratios to pixel dimensions
 * 
 * This lookup table provides pre-calculated dimensions optimized for each combination of:
 * - Resolution tier: 1K (1024px), 2K (2048px), 4K (4096px)
 * - Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4, 21:9
 * 
 * Dimensions are calculated to maintain the target resolution while respecting
 * the aspect ratio, with values rounded to common standard sizes.
 * 
 * ## Usage
 * ```typescript
 * const { width, height } = getResolutionDimensions("2K", "16:9");
 * // Returns: { width: 2560, height: 1440 }
 * ```
 */
const RESOLUTION_MAP: Record<ImageResolution, Record<AspectRatio, { width: number; height: number }>> = {
  // 1K tier (~1 megapixel)
  "1K": {
    "1:1": { width: 1024, height: 1024 },   // Square - perfect for portraits, icons
    "16:9": { width: 1280, height: 720 },   // Widescreen - video, landscape
    "9:16": { width: 720, height: 1280 },   // Portrait - mobile, stories
    "4:3": { width: 1152, height: 864 },    // Classic - traditional photography
    "3:4": { width: 864, height: 1152 },    // Portrait classic
    "21:9": { width: 1344, height: 576 },   // Ultrawide - cinematic
  },
  // 2K tier (~4 megapixels)
  "2K": {
    "1:1": { width: 2048, height: 2048 },
    "16:9": { width: 2560, height: 1440 },  // 1440p / QHD
    "9:16": { width: 1440, height: 2560 },
    "4:3": { width: 2304, height: 1728 },
    "3:4": { width: 1728, height: 2304 },
    "21:9": { width: 2688, height: 1152 },
  },
  // 4K tier (~16 megapixels)
  "4K": {
    "1:1": { width: 4096, height: 4096 },
    "16:9": { width: 3840, height: 2160 },  // 4K UHD
    "9:16": { width: 2160, height: 3840 },
    "4:3": { width: 4096, height: 3072 },
    "3:4": { width: 3072, height: 4096 },
    "21:9": { width: 5120, height: 2160 },  // 5K ultrawide
  },
};

/**
 * Get pixel dimensions for a resolution and aspect ratio combination
 * 
 * @param resolution - Target resolution tier: "1K" | "2K" | "4K"
 * @param aspectRatio - Desired aspect ratio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9"
 * @returns Object with `width` and `height` in pixels
 * 
 * @example
 * ```typescript
 * const dims = getResolutionDimensions("2K", "16:9");
 * console.log(dims); // { width: 2560, height: 1440 }
 * ```
 */
export function getResolutionDimensions(
  resolution: ImageResolution,
  aspectRatio: AspectRatio
): { width: number; height: number } {
  return RESOLUTION_MAP[resolution][aspectRatio];
}

// ==========================================
// Progress Tracking Types
// ==========================================

/**
 * Callback function type for receiving progress updates
 * 
 * @param progress - Current progress with `value` (current step) and `max` (total steps)
 * 
 * @example
 * ```typescript
 * const onProgress: ProgressCallback = ({ value, max }) => {
 *   const percentage = Math.round((value / max) * 100);
 *   console.log(`${percentage}% complete`);
 * };
 * ```
 */
export interface ProgressCallback {
  (progress: { value: number; max: number }): void;
}

// ==========================================
// ComfyUI Client Class
// ==========================================

/**
 * ComfyUI API Client - Main class for interacting with ComfyUI server
 * 
 * Provides methods for:
 * - Queuing workflow prompts for execution
 * - Polling execution history for completion
 * - Real-time progress tracking via WebSocket
 * - Uploading reference images
 * - Fetching generated images
 * - Building workflow JSON for all supported workflow types
 * 
 * ## Singleton Usage
 * A pre-configured singleton instance is exported as `comfyui`:
 * ```typescript
 * import { comfyui } from "@/lib/comfyui";
 * await comfyui.queuePrompt(workflow);
 * ```
 * 
 * ## Custom Instance
 * Create a custom instance for different server URLs:
 * ```typescript
 * const client = new ComfyUIClient("http://192.168.1.100:8188");
 * ```
 */
export class ComfyUIClient {
  /** Base URL of the ComfyUI server (default: http://127.0.0.1:8000) */
  private baseUrl: string;
  
  /** Map of prompt_id → array of progress callbacks for WebSocket updates */
  private progressCallbacks: Map<string, ProgressCallback[]> = new Map();
  
  /** Active WebSocket connection for progress updates (null if not connected) */
  private websocket: WebSocket | null = null;
  
  /** 
   * Cache of last received inference progress per prompt_id.
   * Used to prioritize inference progress over aggregate node progress.
   */
  private lastInferenceProgress: Map<string, { value: number; max: number }> = new Map();

  /**
   * Create a new ComfyUI client instance
   * 
   * @param baseUrl - ComfyUI server URL (default: process.env.COMFYUI_URL or http://127.0.0.1:8000)
   */
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.COMFYUI_URL || "http://127.0.0.1:8000";
  }

  /**
   * Queue a workflow prompt for execution on ComfyUI
   * 
   * Sends the workflow JSON to ComfyUI's /prompt endpoint to be queued
   * for execution. Returns immediately with a prompt_id that can be used
   * to track progress and poll for completion.
   * 
   * @param workflow - ComfyUI workflow object (use build*Workflow methods to create)
   * @returns Promise resolving to queue response with prompt_id
   * @throws Error if the request fails or workflow validation fails
   * 
   * @example
   * ```typescript
   * const workflow = comfyui.buildFlux2Workflow({ prompt: "A cat", width: 1024, height: 1024 });
   * const { prompt_id } = await comfyui.queuePrompt(workflow);
   * console.log(`Queued with ID: ${prompt_id}`);
   * ```
   */
  async queuePrompt(workflow: ComfyUIWorkflow): Promise<QueuePromptResponse> {
    const response = await fetch(`${this.baseUrl}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to queue prompt: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get execution history for a specific prompt
   * 
   * Polls the /history/{prompt_id} endpoint to check execution status
   * and retrieve outputs after completion.
   * 
   * @param promptId - The prompt_id returned from queuePrompt()
   * @returns Promise resolving to history entry, or null if not found
   * @throws Error if the request fails
   */
  async getHistory(promptId: string): Promise<HistoryEntry | null> {
    const response = await fetch(`${this.baseUrl}/history/${promptId}`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.status}`);
    }

    const data = await response.json();
    return data[promptId] || null;
  }

  /**
   * Connect to ComfyUI WebSocket for real-time progress updates
   * 
   * Registers a callback to receive progress updates for a specific prompt.
   * Multiple callbacks can be registered for the same prompt_id.
   * 
   * ## WebSocket Message Types Handled
   * - `execution_progress`: Overall execution progress
   * - `progress`: Step-by-step inference progress (preferred, more accurate)
   * - `progress_state`: Aggregate node-level progress (fallback)
   * 
   * @param promptId - The prompt_id to track
   * @param callback - Function called with { value, max } on each progress update
   * @returns Cleanup function to unregister the callback
   * 
   * @example
   * ```typescript
   * const cleanup = comfyui.connectToProgressSocket(promptId, ({ value, max }) => {
   *   setProgress(Math.round((value / max) * 100));
   * });
   * 
   * // Later, when done tracking:
   * cleanup();
   * ```
   */
  connectToProgressSocket(promptId: string, callback: ProgressCallback): () => void {
    // Add callback to the map for this prompt_id
    if (!this.progressCallbacks.has(promptId)) {
      this.progressCallbacks.set(promptId, []);
    }
    this.progressCallbacks.get(promptId)?.push(callback);

    // Create or reuse WebSocket connection
    if (!this.websocket) {
      this.createWebSocketConnection();
    }

    // Return cleanup function
    return () => {
      const callbacks = this.progressCallbacks.get(promptId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.progressCallbacks.delete(promptId);
          this.lastInferenceProgress.delete(promptId);
        }
      }
    };
  }

  /**
   * Create WebSocket connection to ComfyUI server
   * 
   * Establishes a persistent WebSocket connection for receiving real-time
   * progress updates during workflow execution. The connection is reused
   * across multiple prompt executions.
   * 
   * ## Message Types Handled
   * 
   * 1. `execution_progress` - Overall execution progress per prompt_id
   * 2. `progress` - Step-by-step inference progress (most accurate)
   * 3. `progress_state` - Aggregate node progress (fallback when no inference progress)
   * 
   * ## Progress Priority
   * Inference progress (`progress` messages) are preferred over aggregate
   * node progress (`progress_state`). If inference progress is received,
   * subsequent `progress_state` messages are ignored for that prompt_id.
   * 
   * @private
   */
  private createWebSocketConnection(): void {
    try {
      const wsUrl = this.getWebSocketUrl();
      // Only create WebSocket in Node.js environment (server-side)
      if (typeof WebSocket === 'undefined') {
        console.log('[ComfyUI] WebSocket not available in this environment');
        return;
      }
      
      console.log(`[ComfyUI] Attempting WebSocket connection to ${wsUrl}`);
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('[ComfyUI] WebSocket connection established');
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[ComfyUI] WebSocket message received:', JSON.stringify(data).substring(0, 200));

          // Handle execution_progress messages from ComfyUI
          // This is the primary progress event type
          if (data.type === 'execution_progress') {
            const { value, max, prompt_id } = data.data;
            console.log(`[ComfyUI] *** execution_progress: prompt_id=${prompt_id}, value=${value}, max=${max}`);
            if (prompt_id && value !== undefined && max !== undefined) {
              console.log(`[ComfyUI] Progress update for ${prompt_id}: ${value}/${max}`);
              // Find and invoke all registered callbacks for this prompt_id
              const callbacks = this.progressCallbacks.get(prompt_id);
              if (callbacks) {
                console.log(`[ComfyUI] Found ${callbacks.length} callbacks for prompt_id ${prompt_id}`);
                callbacks.forEach((callback) => {
                  callback({ value, max });
                });
              } else {
                console.warn(`[ComfyUI] No callbacks registered for prompt_id: ${prompt_id}. Registered prompts:`, Array.from(this.progressCallbacks.keys()));
              }
            }
          }
          // Handle 'progress' messages (alternative format, more accurate for inference steps)
          // These provide step-by-step progress during the diffusion process
          else if (data.type === 'progress') {
            const { value, max, prompt_id } = data.data;
            console.log(`[ComfyUI] *** progress: prompt_id=${prompt_id}, value=${value}, max=${max}`);
            if (prompt_id && value !== undefined && max !== undefined) {
              // Cache this inference progress to prioritize over aggregate progress
              this.lastInferenceProgress.set(prompt_id, { value, max });
              console.log(`[ComfyUI] Progress update for ${prompt_id}: ${value}/${max}`);
              const callbacks = this.progressCallbacks.get(prompt_id);
              if (callbacks) {
                console.log(`[ComfyUI] Found ${callbacks.length} callbacks for prompt_id ${prompt_id}`);
                callbacks.forEach((callback) => {
                  callback({ value, max });
                });
              } else {
                console.warn(`[ComfyUI] No callbacks registered for prompt_id: ${prompt_id}`);
              }
            }
          }
          // Handle progress_state messages (newer ComfyUI versions)
          // Only use if we haven't received "progress" messages (which are more accurate)
          // This aggregates progress across all nodes in the workflow
          else if (data.type === 'progress_state') {
            const { prompt_id, nodes } = data.data;
            if (prompt_id && nodes && typeof nodes === 'object') {
              // Check if we have inference progress already tracked from "progress" messages
              const inferenceProgress = this.lastInferenceProgress.get(prompt_id);
              console.log(`[ComfyUI] Progress state for ${prompt_id} - has inference progress: ${!!inferenceProgress}`);
              
              if (!inferenceProgress) {
                console.log(`[ComfyUI] No inference progress yet, using aggregate for ${prompt_id}`);
                // Aggregate progress from all nodes as a fallback
                let totalValue = 0;
                let totalMax = 0;
                let finishedNodes = 0;
                
                Object.values(nodes).forEach((node: any) => {
                  if (node.value !== undefined && node.max !== undefined) {
                    totalValue += node.value;
                    totalMax += node.max;
                    if (node.state === 'finished') {
                      finishedNodes++;
                    }
                  }
                });
                
                // Only report progress if we have valid max values
                if (totalMax > 0) {
                  console.log(`[ComfyUI] *** progress_state aggregate: prompt_id=${prompt_id}, value=${totalValue}, max=${totalMax}, finished nodes: ${finishedNodes}/${Object.keys(nodes).length}`);
                  const callbacks = this.progressCallbacks.get(prompt_id);
                  if (callbacks) {
                    console.log(`[ComfyUI] Found ${callbacks.length} callbacks for prompt_id ${prompt_id}`);
                    callbacks.forEach((callback) => {
                      callback({ value: totalValue, max: totalMax });
                    });
                  } else {
                    console.warn(`[ComfyUI] No callbacks registered for prompt_id: ${prompt_id}. Registered prompts:`, Array.from(this.progressCallbacks.keys()));
                  }
                }
              }
            }
          }
          else {
            console.log(`[ComfyUI] Non-progress message type: ${data.type}`);
          }
        } catch (error) {
          console.error('[ComfyUI] Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('[ComfyUI] WebSocket error:', error);
        // Reset connection state - reconnection will happen on next connectToProgressSocket call
        this.websocket = null;
      };

      this.websocket.onclose = () => {
        console.log('[ComfyUI] WebSocket connection closed');
        this.websocket = null;
      };
    } catch (error) {
      console.error('[ComfyUI] Failed to create WebSocket connection:', error);
      // WebSocket not available (likely client-side environment)
      this.websocket = null;
    }
  }

  /**
   * Close WebSocket connection and clear all registered callbacks
   * 
   * Should be called when shutting down or when progress tracking is no longer needed.
   * Clears the callback map and progress cache.
   */
  closeProgressSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.progressCallbacks.clear();
    this.lastInferenceProgress.clear();
  }

  /**
   * Fetch a generated image as a Buffer
   * 
   * Retrieves an image from ComfyUI's output directory via the /view endpoint.
   * The filename, subfolder, and type are obtained from the history outputs.
   * 
   * @param filename - Image filename (e.g., "Flux2_00001_.png")
   * @param subfolder - Subfolder within output directory (usually empty string)
   * @param type - Output type (usually "output" for generated images)
   * @returns Promise resolving to image data as a Node.js Buffer
   * @throws Error if the image cannot be fetched
   * 
   * @example
   * ```typescript
   * const history = await comfyui.waitForCompletion(promptId);
   * const images = history.outputs["9"].images;
   * for (const img of images) {
   *   const buffer = await comfyui.getImage(img.filename, img.subfolder, img.type);
   *   // Save buffer to file or upload to storage
   * }
   * ```
   */
  async getImage(filename: string, subfolder: string, type: string): Promise<Buffer> {
    const params = new URLSearchParams({
      filename,
      subfolder,
      type,
    });

    const response = await fetch(`${this.baseUrl}/view?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to get image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Upload a reference image to ComfyUI's input directory
   * 
   * Images must be uploaded before they can be used in workflows that require
   * input images (Z Image Turbo, Bulletproof Background, Bulletproof Upscaler).
   * 
   * @param buffer - Image data as a Node.js Buffer
   * @param filename - Desired filename (e.g., "reference_123.png")
   * @returns Promise resolving to upload result with final name, subfolder, and type
   * @throws Error if the upload fails
   * 
   * @example
   * ```typescript
   * // Fetch image from storage and upload to ComfyUI
   * const imageBuffer = await fetchImageBuffer(avatarUrl);
   * const uploadResult = await comfyui.uploadImage(imageBuffer, "avatar_ref.png");
   * 
   * // Use in workflow
   * const workflow = comfyui.buildZImageTurboWorkflow({
   *   prompt: "Transform to oil painting",
   *   inputImageFilename: uploadResult.name
   * });
   * ```
   */
  async uploadImage(buffer: Buffer, filename: string): Promise<{ name: string; subfolder: string; type: string }> {
    const formData = new FormData();
    // Convert Buffer to Uint8Array for Blob compatibility in fetch API
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], { type: "image/png" });
    formData.append("image", blob, filename);
    formData.append("overwrite", "true"); // Replace existing file with same name

    const response = await fetch(`${this.baseUrl}/upload/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Wait for a prompt to complete execution (blocking poll)
   * 
   * Polls the /history/{prompt_id} endpoint every 500ms until the workflow
   * completes successfully or fails with an error. This method has no timeout
   * because some generations (especially upscaling) can take hours.
   * 
   * @param promptId - The prompt_id returned from queuePrompt()
   * @returns Promise resolving to the completed history entry with outputs
   * @throws Error if the workflow execution fails
   * 
   * @example
   * ```typescript
   * const { prompt_id } = await comfyui.queuePrompt(workflow);
   * 
   * // This blocks until generation completes (could be minutes/hours)
   * const history = await comfyui.waitForCompletion(prompt_id);
   * 
   * // Extract generated images from the SaveImage node (node "9" in Flux2 workflow)
   * const saveImageOutput = history.outputs["9"];
   * const images = saveImageOutput?.images || [];
   * ```
   */
  async waitForCompletion(promptId: string): Promise<HistoryEntry> {
    const pollInterval = 500; // Poll every 500ms for responsive completion detection

    while (true) {
      const history = await this.getHistory(promptId);

      // Check if execution completed successfully
      if (history && history.status?.completed) {
        return history;
      }

      // Check for execution errors in status messages
      if (history?.status?.status_str === "error") {
        // Extract error details from status messages
        const errorMessages = history.status.messages
          .filter((msg) => msg[0] === "execution_error")
          .map((msg) => JSON.stringify(msg[1]))
          .join(", ");
        throw new Error(`Workflow execution failed: ${errorMessages || "Unknown error"}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Check if ComfyUI server is available and healthy
   * 
   * Performs a quick health check by hitting the /system_stats endpoint
   * with a 5-second timeout. Useful for checking server availability
   * before attempting to queue workflows.
   * 
   * @returns Promise resolving to true if server is healthy, false otherwise
   * 
   * @example
   * ```typescript
   * const isHealthy = await comfyui.healthCheck();
   * if (!isHealthy) {
   *   throw new Error("ComfyUI server is not available");
   * }
   * ```
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Build a Flux 2 text-to-image workflow
   * 
   * Creates a ComfyUI workflow JSON for the Flux 2 model, which excels at
   * high-quality text-to-image generation with optional reference image support.
   * 
   * ## Workflow Node Graph
   * ```
   * ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   * │ CLIP Loader  │────►│ Text Encode  │────►│ FluxGuidance │
   * │    (38)      │     │     (6)      │     │    (26)      │
   * └──────────────┘     └──────────────┘     └──────┬───────┘
   *                                                   │
   * ┌──────────────┐     ┌──────────────┐           ▼
   * │ UNET Loader  │────►│ BasicGuider  │◄────────────────────
   * │    (12)      │     │    (22)      │
   * └──────────────┘     └──────┬───────┘
   *                              │
   * ┌──────────────┐     ┌──────▼───────┐     ┌──────────────┐
   * │ EmptyLatent  │────►│   Sampler    │────►│  VAE Decode  │
   * │    (47)      │     │    (13)      │     │     (8)      │
   * └──────────────┘     └──────────────┘     └──────┬───────┘
   *                                                   │
   * ┌──────────────┐                          ┌──────▼───────┐
   * │  VAE Loader  │─────────────────────────►│  Save Image  │
   * │    (10)      │                          │     (9)      │
   * └──────────────┘                          └──────────────┘
   * ```
   * 
   * ## Reference Image Support
   * When `referenceImageFilename` is provided, additional nodes are added:
   * - LoadImage (46) → ImageScaleToTotalPixels (45) → VAEEncode (44) → ReferenceLatent (43)
   * - The BasicGuider (22) is rewired to use ReferenceLatent output
   * 
   * @param options - Workflow configuration options
   * @returns ComfyUI workflow JSON ready for queuePrompt()
   */
  buildFlux2Workflow(options: WorkflowOptions): ComfyUIWorkflow {
    const {
      prompt,
      width,
      height,
      steps = 20,           // Default 20 steps for quality
      guidance = 4,         // Default guidance scale
      seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      referenceImageFilename,
    } = options;

    // Base workflow structure - nodes are referenced by string IDs
    const workflow: ComfyUIWorkflow = {
      // Node 6: CLIP Text Encode - Converts text prompt to conditioning
      "6": {
        inputs: {
          text: prompt,
          clip: ["38", 0], // Reference to CLIP Loader output
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "CLIP Text Encode (Positive Prompt)" },
      },
      // Node 8: VAE Decode - Converts latent to pixel space
      "8": {
        inputs: {
          samples: ["13", 0], // Reference to Sampler output
          vae: ["10", 0],     // Reference to VAE Loader output
        },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" },
      },
      // Node 9: Save Image - Outputs final image to ComfyUI's output folder
      "9": {
        inputs: {
          filename_prefix: "Flux2", // Images saved as Flux2_00001_.png, etc.
          images: ["8", 0],         // Reference to VAE Decode output
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
      },
      // Node 10: VAE Loader - Loads the Flux 2 VAE model
      "10": {
        inputs: {
          vae_name: "flux2-vae.safetensors",
        },
        class_type: "VAELoader",
        _meta: { title: "Load VAE" },
      },
      // Node 12: UNET Loader - Loads the main diffusion model
      "12": {
        inputs: {
          unet_name: "flux2_dev_fp8mixed.safetensors", // FP8 mixed precision for memory efficiency
          weight_dtype: "default",
        },
        class_type: "UNETLoader",
        _meta: { title: "Load Diffusion Model" },
      },
      // Node 13: Sampler Custom Advanced - Main sampling loop
      "13": {
        inputs: {
          noise: ["25", 0],        // Random noise
          guider: ["22", 0],       // Guidance configuration
          sampler: ["16", 0],      // Sampler algorithm
          sigmas: ["48", 0],       // Noise schedule
          latent_image: ["47", 0], // Initial latent
        },
        class_type: "SamplerCustomAdvanced",
        _meta: { title: "SamplerCustomAdvanced" },
      },
      // Node 16: KSampler Select - Selects the sampling algorithm
      "16": {
        inputs: {
          sampler_name: "euler", // Euler sampler - fast and reliable
        },
        class_type: "KSamplerSelect",
        _meta: { title: "KSamplerSelect" },
      },
      // Node 22: Basic Guider - Applies guidance to the diffusion process
      "22": {
        inputs: {
          model: ["12", 0],       // Reference to UNET
          conditioning: ["26", 0], // Will be modified if reference image is used
        },
        class_type: "BasicGuider",
        _meta: { title: "BasicGuider" },
      },
      // Node 25: Random Noise - Generates initial noise for diffusion
      "25": {
        inputs: {
          noise_seed: seed, // Seed for reproducibility
        },
        class_type: "RandomNoise",
        _meta: { title: "RandomNoise" },
      },
      // Node 26: Flux Guidance - Applies Flux-specific guidance scaling
      "26": {
        inputs: {
          guidance: guidance, // CFG scale (higher = more prompt adherence)
          conditioning: ["6", 0],
        },
        class_type: "FluxGuidance",
        _meta: { title: "FluxGuidance" },
      },
      // Node 38: CLIP Loader - Loads the text encoder model
      "38": {
        inputs: {
          clip_name: "mistral_3_small_flux2_bf16.safetensors", // Mistral-based CLIP
          type: "flux2",
          device: "default",
        },
        class_type: "CLIPLoader",
        _meta: { title: "Load CLIP" },
      },
      // Node 47: Empty Flux 2 Latent Image - Creates initial latent at target resolution
      "47": {
        inputs: {
          width: width,
          height: height,
          batch_size: 1,
        },
        class_type: "EmptyFlux2LatentImage",
        _meta: { title: "Empty Flux 2 Latent" },
      },
      // Node 48: Flux2 Scheduler - Generates noise schedule for diffusion
      "48": {
        inputs: {
          steps: steps,
          width: width,
          height: height,
        },
        class_type: "Flux2Scheduler",
        _meta: { title: "Flux2Scheduler" },
      },
    };

    // Add reference image nodes if a reference image is provided
    // This enables style transfer / image-to-image capabilities
    if (referenceImageFilename) {
      // Node 43: Reference Latent - Incorporates reference image into conditioning
      workflow["43"] = {
        inputs: {
          conditioning: ["26", 0],
          latent: ["44", 0],
        },
        class_type: "ReferenceLatent",
        _meta: { title: "ReferenceLatent" },
      };
      // Node 44: VAE Encode - Encodes reference image to latent space
      workflow["44"] = {
        inputs: {
          pixels: ["45", 0],
          vae: ["10", 0],
        },
        class_type: "VAEEncode",
        _meta: { title: "VAE Encode" },
      };
      // Node 45: Image Scale To Total Pixels - Resizes reference image
      workflow["45"] = {
        inputs: {
          upscale_method: "lanczos", // High-quality scaling algorithm
          megapixels: 1,             // Scale to ~1 megapixel
          image: ["46", 0],
        },
        class_type: "ImageScaleToTotalPixels",
        _meta: { title: "ImageScaleToTotalPixels" },
      };
      // Node 46: Load Image - Loads the reference image from ComfyUI's input folder
      workflow["46"] = {
        inputs: {
          image: referenceImageFilename, // Filename from uploadImage() result
        },
        class_type: "LoadImage",
        _meta: { title: "Load Image" },
      };

      // Rewire BasicGuider to use ReferenceLatent output instead of direct FluxGuidance
      const basicGuider = workflow["22"];
      if (basicGuider) {
        basicGuider.inputs.conditioning = ["43", 0]; // Point to ReferenceLatent
      }
    }

    return workflow;
  }

  /**
   * Build a Z Image Turbo workflow for fast image-to-image generation
   * 
   * Z Image Turbo is optimized for quick image transformations with fewer steps
   * than standard diffusion models. It uses a specialized model trained for
   * fast inference while maintaining quality.
   * 
   * ## Workflow Node Graph
   * ```
   * ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   * │ Load Image   │────►│ Scale Image  │────►│  VAE Encode  │
   * │    (4)       │     │    (9)       │     │     (8)      │
   * └──────────────┘     └──────────────┘     └──────┬───────┘
   *                                                   │
   * ┌──────────────┐     ┌──────────────┐           ▼
   * │ CLIP Loader  │────►│ Text Encode  │────►┌──────────────┐
   * │    (2)       │     │    (5)       │     │   KSampler   │
   * └──────────────┘     └──────┬───────┘     │     (7)      │
   *                              │            └──────┬───────┘
   * ┌──────────────┐     ┌──────▼───────┐           │
   * │ UNET Loader  │────►│ ModelSampling│────►──────┘
   * │    (1)       │     │    (14)      │
   * └──────────────┘     └──────────────┘
   *                                           ┌──────────────┐
   *                                           │  VAE Decode  │
   *                                           │    (10)      │
   *                                           └──────┬───────┘
   *                                                   │
   *                                           ┌──────▼───────┐
   *                                           │  Save Image  │
   *                                           │    (12)      │
   *                                           └──────────────┘
   * ```
   * 
   * ## Key Differences from Flux 2
   * - Requires input image (not text-only)
   * - Uses res_multistep sampler
   * - Lower CFG (default 1) for better results
   * - Fewer steps (default 9) for fast iteration
   * - Uses qwen_3_4b CLIP model
   * 
   * @param options - Workflow configuration options
   * @returns ComfyUI workflow JSON ready for queuePrompt()
   */
  buildZImageTurboWorkflow(options: ZImageTurboWorkflowOptions): ComfyUIWorkflow {
    const {
      prompt,
      inputImageFilename,
      steps = 9,           // Fewer steps than Flux 2 for speed
      cfg = 1,             // Low CFG works best with this model
      denoise = 0.4,       // Moderate denoise preserves original structure
      seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      largestSize = 1024,  // Max dimension to prevent OOM
      shift = 3,           // ModelSamplingAuraFlow shift parameter
    } = options;

    const workflow: ComfyUIWorkflow = {
      // Node 1: UNET Loader - Load Z Image Turbo model (FP8 for memory efficiency)
      "1": {
        inputs: {
          unet_name: "z_image_turbo_fp8_e4m3fn.safetensors",
          weight_dtype: "default",
        },
        class_type: "UNETLoader",
        _meta: { title: "Load Diffusion Model" },
      },
      // Node 2: CLIP Loader - Load qwen CLIP model (different from Flux 2)
      "2": {
        inputs: {
          clip_name: "qwen_3_4b.safetensors",
          type: "lumina2",
          device: "default",
        },
        class_type: "CLIPLoader",
        _meta: { title: "Load CLIP" },
      },
      // Node 3: VAE Loader - Standard autoencoder
      "3": {
        inputs: {
          vae_name: "ae.safetensors",
        },
        class_type: "VAELoader",
        _meta: { title: "Load VAE" },
      },
      // Node 4: Load Image - Input image (required for img2img)
      "4": {
        inputs: {
          image: inputImageFilename, // Must be uploaded first via uploadImage()
        },
        class_type: "LoadImage",
        _meta: { title: "Load Image" },
      },
      // Node 5: CLIP Text Encode - Encode the transformation prompt
      "5": {
        inputs: {
          text: prompt,
          clip: ["2", 0],
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "CLIP Text Encode (Prompt)" },
      },
      // Node 6: Conditioning Zero Out - Creates empty negative conditioning
      // Z Image Turbo works best with zeroed negative conditioning
      "6": {
        inputs: {
          conditioning: ["5", 0],
        },
        class_type: "ConditioningZeroOut",
        _meta: { title: "ConditioningZeroOut" },
      },
      // Node 7: KSampler - Main sampling with res_multistep algorithm
      "7": {
        inputs: {
          seed: seed,
          steps: steps,
          cfg: cfg,                       // Low CFG recommended
          sampler_name: "res_multistep",  // Specialized sampler for this model
          scheduler: "simple",
          denoise: denoise,               // Controls how much to change from original
          model: ["14", 0],               // Uses ModelSamplingAuraFlow output
          positive: ["5", 0],
          negative: ["6", 0],
          latent_image: ["8", 0],
        },
        class_type: "KSampler",
        _meta: { title: "KSampler" },
      },
      // Node 8: VAE Encode - Encode input image to latent space
      "8": {
        inputs: {
          pixels: ["9", 0],  // Scaled image
          vae: ["3", 0],
        },
        class_type: "VAEEncode",
        _meta: { title: "VAE Encode" },
      },
      // Node 9: Image Scale To Max Dimension - Resize input to fit memory
      "9": {
        inputs: {
          upscale_method: "area",        // Area sampling for downscaling
          largest_size: largestSize,     // Cap maximum dimension
          image: ["4", 0],
        },
        class_type: "ImageScaleToMaxDimension",
        _meta: { title: "ImageScaleToMaxDimension" },
      },
      // Node 10: VAE Decode - Convert latent back to pixels
      "10": {
        inputs: {
          samples: ["7", 0],
          vae: ["3", 0],
        },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" },
      },
      // Node 12: Save Image - Output final transformed image
      "12": {
        inputs: {
          filename_prefix: "ZImageTurbo",
          images: ["10", 0],
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
      },
      // Node 14: ModelSamplingAuraFlow - Applies AuraFlow sampling modifications
      // The shift parameter controls the noise schedule
      "14": {
        inputs: {
          shift: shift,
          model: ["1", 0],
        },
        class_type: "ModelSamplingAuraFlow",
        _meta: { title: "ModelSamplingAuraFlow" },
      },
    };

    return workflow;
  }

  /**
   * Build a Bulletproof Background workflow for intelligent background replacement
   * 
   * This workflow combines SAM3 (Segment Anything Model 3) for automatic subject
   * segmentation with Z Image Turbo for inpainting. The subject is preserved while
   * the background is replaced according to the text prompt.
   * 
   * ## Pipeline Overview
   * ```
   * Input Image ──► SAM3 Segmentation ──► Mask Inversion ──► Inpaint Crop
   *                       │                                       │
   *                       ▼                                       ▼
   *              Subject Detection               Background Inpainting
   *              (e.g., "person")                 (Z Image Turbo)
   *                                                     │
   *                                                     ▼
   *                                              Stitch & Output
   * ```
   * 
   * ## Key Components
   * - **SAM3Grounding (66)**: Detects and segments the subject based on text prompt
   * - **InpaintCropImproved (78)**: Prepares masked region for inpainting
   * - **KSampler (16)**: Z Image Turbo inpainting with high denoise (0.9)
   * - **InpaintStitchImproved (79)**: Blends inpainted background with original subject
   * 
   * ## Mask Behavior
   * The mask is inverted (`mask_invert: true`) so that the BACKGROUND is inpainted,
   * not the subject. The subject remains untouched.
   * 
   * @param options - Workflow configuration options
   * @returns ComfyUI workflow JSON ready for queuePrompt()
   */
  buildBulletproofBackgroundWorkflow(options: BulletproofBackgroundWorkflowOptions): ComfyUIWorkflow {
    const {
      prompt,                         // Description of the NEW background
      inputImageFilename,
      steps = 9,
      cfg = 1,
      denoise = 0.9,                  // High denoise for complete background replacement
      seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      shift = 3,
      detectionConfidence = 0.2,      // Lower threshold = more sensitive detection
      subjectToDetect = "person",     // SAM3 text prompt for segmentation
      maskBlendPixels = 8,            // Edge blending for seamless compositing
      outputWidth = 1024,
      outputHeight = 1024,
    } = options;

    const workflow: ComfyUIWorkflow = {
      // Node 10: InpaintModelConditioning - Sets up conditioning for inpainting
      // Combines positive/negative conditioning with mask and pixels
      "10": {
        inputs: {
          noise_mask: true,            // Apply noise only to masked area
          positive: ["12", 0],         // Background description
          negative: ["52", 0],         // Zeroed negative
          vae: ["56", 0],
          pixels: ["78", 1],           // Cropped image from InpaintCrop
          mask: ["78", 2],             // Processed mask from InpaintCrop
        },
        class_type: "InpaintModelConditioning",
        _meta: { title: "InpaintModelConditioning" },
      },
      // Node 12: CLIP Text Encode - Encodes the new background description
      "12": {
        inputs: {
          text: prompt,                // e.g., "A sunny beach with palm trees"
          clip: ["54", 0],
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "CLIP Text Encode (Prompt)" },
      },
      // Node 16: KSampler - Main inpainting sampler
      "16": {
        inputs: {
          seed: seed,
          steps: steps,
          cfg: cfg,
          sampler_name: "res_multistep",
          scheduler: "simple",
          denoise: denoise,            // High value for full background replacement
          model: ["17", 0],            // DifferentialDiffusion output
          positive: ["10", 0],         // InpaintModelConditioning positive
          negative: ["10", 1],         // InpaintModelConditioning negative
          latent_image: ["10", 2],     // InpaintModelConditioning latent
        },
        class_type: "KSampler",
        _meta: { title: "KSampler" },
      },
      // Node 17: DifferentialDiffusion - Enables gradient-based mask blending
      // Provides smoother transitions at mask edges
      "17": {
        inputs: {
          strength: 1,
          model: ["53", 0],
        },
        class_type: "DifferentialDiffusion",
        _meta: { title: "Differential Diffusion" },
      },
      // Node 25: VAE Decode - Converts inpainted latent to pixels
      "25": {
        inputs: {
          samples: ["16", 0],
          vae: ["56", 0],
        },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" },
      },
      // Node 41: Load Image - Input image with subject and original background
      "41": {
        inputs: {
          image: inputImageFilename,
        },
        class_type: "LoadImage",
        _meta: { title: "Load Image" },
      },
      // Node 52: ConditioningZeroOut - Empty negative conditioning
      "52": {
        inputs: {
          conditioning: ["12", 0],
        },
        class_type: "ConditioningZeroOut",
        _meta: { title: "ConditioningZeroOut" },
      },
      // Node 53: ModelSamplingAuraFlow - AuraFlow sampling for Z Image Turbo
      "53": {
        inputs: {
          shift: shift,
          model: ["55", 0],
        },
        class_type: "ModelSamplingAuraFlow",
        _meta: { title: "ModelSamplingAuraFlow" },
      },
      // Node 54: CLIP Loader - qwen CLIP for Z Image Turbo
      "54": {
        inputs: {
          clip_name: "qwen_3_4b.safetensors",
          type: "lumina2",
          device: "default",
        },
        class_type: "CLIPLoader",
        _meta: { title: "Load CLIP" },
      },
      // Node 55: UNET Loader - Z Image Turbo model (bf16 version for inpainting)
      "55": {
        inputs: {
          unet_name: "z_image_turbo_bf16.safetensors", // BF16 version for better quality
          weight_dtype: "default",
        },
        class_type: "UNETLoader",
        _meta: { title: "Load Diffusion Model" },
      },
      // Node 56: VAE Loader - Standard autoencoder
      "56": {
        inputs: {
          vae_name: "ae.safetensors",
        },
        class_type: "VAELoader",
        _meta: { title: "Load VAE" },
      },
      // Node 66: SAM3Grounding - Segments subject using text prompt
      // Uses Segment Anything Model 3 for automatic subject detection
      "66": {
        inputs: {
          confidence_threshold: detectionConfidence, // Lower = more detections
          text_prompt: subjectToDetect,              // What to segment (e.g., "person")
          max_detections: -1,                        // No limit
          offload_model: false,
          sam3_model: ["67", 0],
          image: ["41", 0],
        },
        class_type: "SAM3Grounding",
        _meta: { title: "SAM3 Text Segmentation" },
      },
      // Node 67: LoadSAM3Model - Loads SAM3 model weights
      "67": {
        inputs: {
          model_path: "models/sam3/sam3.pt",
        },
        class_type: "LoadSAM3Model",
        _meta: { title: "(down)Load SAM3 Model" },
      },
      // Node 78: InpaintCropImproved - Prepares mask and crops for efficient inpainting
      // This node handles mask processing, cropping, and output sizing
      "78": {
        inputs: {
          downscale_algorithm: "bilinear",
          upscale_algorithm: "bicubic",
          preresize: false,
          preresize_mode: "ensure minimum resolution",
          preresize_min_width: 1024,
          preresize_min_height: 1024,
          preresize_max_width: 16384,
          preresize_max_height: 16384,
          mask_fill_holes: false,
          mask_expand_pixels: 0,
          mask_invert: true,           // CRITICAL: Invert to paint BACKGROUND, not subject
          mask_blend_pixels: maskBlendPixels, // Edge feathering
          mask_hipass_filter: 0.1,
          extend_for_outpainting: false,
          extend_up_factor: 1,
          extend_down_factor: 1,
          extend_left_factor: 1,
          extend_right_factor: 1,
          context_from_mask_extend_factor: 1.1,
          output_resize_to_target_size: true,
          output_target_width: outputWidth,
          output_target_height: outputHeight,
          output_padding: "8",
          image: ["41", 0],
          mask: ["66", 0],             // Mask from SAM3
        },
        class_type: "InpaintCropImproved",
        _meta: { title: "✂️ Inpaint Crop (Improved)" },
      },
      // Node 79: InpaintStitchImproved - Stitches inpainted region back
      // Composites the new background with the preserved subject
      "79": {
        inputs: {
          stitcher: ["78", 0],         // Stitcher info from InpaintCrop
          inpainted_image: ["25", 0],  // Decoded inpainted result
        },
        class_type: "InpaintStitchImproved",
        _meta: { title: "✂️ Inpaint Stitch (Improved)" },
      },
      // Node 80: Save Image - Output final composited image
      "80": {
        inputs: {
          filename_prefix: "BulletproofBackground",
          images: ["79", 0],
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
      },
    };

    return workflow;
  }

  /**
   * Build a Bulletproof Upscaler workflow for high-quality 4X image upscaling
   * 
   * Uses SeedVR2 (Seed Video/Image Upscaler version 2), an AI-powered upscaler
   * that adds realistic detail while scaling images up to 4X. Unlike simple
   * interpolation, this model generates plausible high-frequency details.
   * 
   * ## VRAM Management
   * The workflow uses tiled processing to handle large images without OOM errors.
   * Tile size is controlled by the `vramPreset` option:
   * 
   * | Preset   | Tile Size | VRAM Required | Speed    |
   * |----------|-----------|---------------|----------|
   * | low      | 256px     | ~4GB          | Slow     |
   * | standard | 512px     | ~8GB          | Medium   |
   * | high     | 1024px    | ~16GB+        | Fast     |
   * 
   * ## Output Dimensions
   * - `resolution`: Target shortest edge (e.g., 1080 for 1080p)
   * - `maxResolution`: Hard limit for any dimension (prevents OOM on huge images)
   * 
   * @param options - Workflow configuration options
   * @returns ComfyUI workflow JSON ready for queuePrompt()
   */
  buildBulletproofUpscalerWorkflow(options: BulletproofUpscalerWorkflowOptions): ComfyUIWorkflow {
    const {
      inputImageFilename,
      resolution = 1080,       // Target shortest edge (1080p)
      maxResolution = 4096,    // Cap maximum dimension
      vramPreset = "standard",
      seed = 9527,             // Default seed from original workflow
    } = options;

    // Map VRAM preset to tile size for encode/decode operations
    const tileSize = VRAM_PRESET_MAP[vramPreset];

    const workflow: ComfyUIWorkflow = {
      // Node 15: SeedVR2LoadVAEModel - Load VAE with tiled processing
      // Tile size controls memory usage vs speed tradeoff
      "15": {
        inputs: {
          model: "ema_vae_fp16.safetensors",
          device: "cuda:0",
          encode_tiled: true,              // Use tiled encoding
          encode_tile_size: tileSize,      // From VRAM preset
          encode_tile_overlap: 128,        // Overlap for seamless stitching
          decode_tiled: true,              // Use tiled decoding
          decode_tile_size: tileSize,
          decode_tile_overlap: 128,
          tile_debug: "false",
          offload_device: "cpu",           // Offload when not in use
        },
        class_type: "SeedVR2LoadVAEModel",
        _meta: { title: "SeedVR2 Load VAE Model" },
      },
      // Node 16: SeedVR2LoadDiTModel - Load the main DiT upscaling model
      // This is a 7B parameter model that generates high-frequency details
      "16": {
        inputs: {
          model: "seedvr2_ema_7b_fp16.safetensors",
          device: "cuda:0",
          blocks_to_swap: 36,              // Memory optimization - swap blocks to CPU
          offload_device: "cpu",
          attention_mode: "sdpa",          // Scaled Dot-Product Attention
        },
        class_type: "SeedVR2LoadDiTModel",
        _meta: { title: "SeedVR2 Load DiT Model" },
      },
      // Node 18: SeedVR2VideoUpscaler - Main upscaling operation
      // Despite the name, this handles single images as well
      "18": {
        inputs: {
          seed: seed,
          resolution: resolution,          // Target shortest edge
          max_resolution: maxResolution,   // Maximum dimension cap
          batch_size: 5,                   // Internal processing batch size
          uniform_batch_size: false,
          color_correction: "lab",         // LAB color space correction for consistency
          offload_device: "cpu",
          image: ["41", 0],                // Input image
          dit: ["16", 0],                  // DiT model
          vae: ["15", 0],                  // VAE for encode/decode
        },
        class_type: "SeedVR2VideoUpscaler",
        _meta: { title: "SeedVR2 Video Upscaler" },
      },
      // Node 19: Save Image - Output upscaled image
      "19": {
        inputs: {
          filename_prefix: "BulletproofUpscaler",
          images: ["18", 0],
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
      },
      // Node 41: Load Image - Input low-resolution image
      "41": {
        inputs: {
          image: inputImageFilename,
        },
        class_type: "LoadImage",
        _meta: { title: "Load Image" },
      },
    };

    return workflow;
  }

  /**
   * Get WebSocket URL for real-time progress updates
   * 
   * Converts the HTTP base URL to a WebSocket URL, handling both
   * http/ws and https/wss protocol mappings.
   * 
   * @returns WebSocket URL string (e.g., "ws://127.0.0.1:8000/ws")
   */
  getWebSocketUrl(): string {
    const httpUrl = new URL(this.baseUrl);
    const wsProtocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${httpUrl.host}/ws`;
  }
}

// ==========================================
// Singleton Export
// ==========================================

/**
 * Pre-configured singleton instance of ComfyUIClient
 * 
 * Uses the default server URL (process.env.COMFYUI_URL or http://127.0.0.1:8000).
 * Import this for most use cases rather than creating a new instance.
 * 
 * @example
 * ```typescript
 * import { comfyui } from "@/lib/comfyui";
 * 
 * const healthy = await comfyui.healthCheck();
 * const workflow = comfyui.buildFlux2Workflow({ ... });
 * const { prompt_id } = await comfyui.queuePrompt(workflow);
 * ```
 */
export const comfyui = new ComfyUIClient();
