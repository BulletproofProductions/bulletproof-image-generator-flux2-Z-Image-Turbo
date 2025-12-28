/**
 * ComfyUI API Client
 * Handles all communication with the ComfyUI server
 */

import type { ImageResolution, AspectRatio } from "@/lib/types/generation";

// ==========================================
// Types
// ==========================================

export interface ComfyUIWorkflow {
  [nodeId: string]: {
    inputs: Record<string, unknown>;
    class_type: string;
    _meta?: { title: string };
  };
}

export interface QueuePromptResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

export interface HistoryOutput {
  images?: Array<{
    filename: string;
    subfolder: string;
    type: string;
  }>;
}

export interface HistoryEntry {
  prompt: [number, string, Record<string, unknown>, Record<string, unknown>];
  outputs: Record<string, HistoryOutput>;
  status: {
    status_str: string;
    completed: boolean;
    messages: Array<[string, Record<string, unknown>]>;
  };
}

export interface WorkflowOptions {
  prompt: string;
  width: number;
  height: number;
  steps?: number | undefined;
  guidance?: number | undefined;
  seed?: number | undefined;
  referenceImageFilename?: string | undefined;
}

export interface ZImageTurboWorkflowOptions {
  prompt: string;
  inputImageFilename: string; // Required - LoadImage node
  steps?: number | undefined; // 1-20, default 9
  cfg?: number | undefined; // 1-5, default 1
  denoise?: number | undefined; // 0.1-1.0, default 0.4
  seed?: number | undefined;
  largestSize?: number | undefined; // Max dimension, default 1024
  shift?: number | undefined; // ModelSamplingAuraFlow shift, default 3
}

// ==========================================
// Resolution Mapping
// ==========================================

const RESOLUTION_MAP: Record<ImageResolution, Record<AspectRatio, { width: number; height: number }>> = {
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
};

export function getResolutionDimensions(
  resolution: ImageResolution,
  aspectRatio: AspectRatio
): { width: number; height: number } {
  return RESOLUTION_MAP[resolution][aspectRatio];
}

// ==========================================
// Progress Tracking Types
// ==========================================

export interface ProgressCallback {
  (progress: { value: number; max: number }): void;
}

// ==========================================
// ComfyUI Client Class
// ==========================================

export class ComfyUIClient {
  private baseUrl: string;
  private progressCallbacks: Map<string, ProgressCallback[]> = new Map();
  private websocket: WebSocket | null = null;
  private lastInferenceProgress: Map<string, { value: number; max: number }> = new Map();

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.COMFYUI_URL || "http://127.0.0.1:8000";
  }

  /**
   * Queue a workflow prompt for execution
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
   * Get execution history for a prompt
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
   * Returns a cleanup function to close the connection
   */
  connectToProgressSocket(promptId: string, callback: ProgressCallback): () => void {
    // Add callback to the map
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
   * Create WebSocket connection to ComfyUI
   */
  private createWebSocketConnection(): void {
    try {
      const wsUrl = this.getWebSocketUrl();
      // Only create WebSocket in Node.js environment (server-side)
      if (typeof WebSocket === 'undefined') {
        console.log('[ComfyUI] WebSocket not available in this environment');
        return; // WebSocket not available in this environment
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
          if (data.type === 'execution_progress') {
            const { value, max, prompt_id } = data.data;
            console.log(`[ComfyUI] *** execution_progress: prompt_id=${prompt_id}, value=${value}, max=${max}`);
            if (prompt_id && value !== undefined && max !== undefined) {
              console.log(`[ComfyUI] Progress update for ${prompt_id}: ${value}/${max}`);
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
          // Handle execution_progress messages (alternative format)
          else if (data.type === 'progress') {
            const { value, max, prompt_id } = data.data;
            console.log(`[ComfyUI] *** progress: prompt_id=${prompt_id}, value=${value}, max=${max}`);
            if (prompt_id && value !== undefined && max !== undefined) {
              // Track the latest inference progress for this prompt
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
          else if (data.type === 'progress_state') {
            const { prompt_id, nodes } = data.data;
            if (prompt_id && nodes && typeof nodes === 'object') {
              // Check if we have inference progress already tracked from "progress" messages
              const inferenceProgress = this.lastInferenceProgress.get(prompt_id);
              console.log(`[ComfyUI] Progress state for ${prompt_id} - has inference progress: ${!!inferenceProgress}`);
              
              if (!inferenceProgress) {
                console.log(`[ComfyUI] No inference progress yet, using aggregate for ${prompt_id}`);
                // Only use aggregate node progress if we haven't seen inference progress yet
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
        // Reconnection will be handled by subsequent connection attempts
        this.websocket = null;
      };

      this.websocket.onclose = () => {
        console.log('[ComfyUI] WebSocket connection closed');
        this.websocket = null;
      };
    } catch (error) {
      console.error('[ComfyUI] Failed to create WebSocket connection:', error);
      // WebSocket not available (likely client-side)
      this.websocket = null;
    }
  }

  /**
   * Close WebSocket connection
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
   * Fetch a generated image as a buffer
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
   * Upload a reference image to ComfyUI
   */
  async uploadImage(buffer: Buffer, filename: string): Promise<{ name: string; subfolder: string; type: string }> {
    const formData = new FormData();
    // Convert Buffer to Uint8Array for Blob compatibility
    const uint8Array = new Uint8Array(buffer);
    const blob = new Blob([uint8Array], { type: "image/png" });
    formData.append("image", blob, filename);
    formData.append("overwrite", "true");

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
   * Wait for a prompt to complete execution
   * Polls the history endpoint until completion (no timeout - generations can take hours)
   */
  async waitForCompletion(promptId: string): Promise<HistoryEntry> {
    const pollInterval = 500; // 500ms between polls

    while (true) {
      const history = await this.getHistory(promptId);

      if (history && history.status?.completed) {
        return history;
      }

      // Check for errors in status messages
      if (history?.status?.status_str === "error") {
        const errorMessages = history.status.messages
          .filter((msg) => msg[0] === "execution_error")
          .map((msg) => JSON.stringify(msg[1]))
          .join(", ");
        throw new Error(`Workflow execution failed: ${errorMessages || "Unknown error"}`);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Check if ComfyUI server is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Build a Flux 2 workflow from options
   */
  buildFlux2Workflow(options: WorkflowOptions): ComfyUIWorkflow {
    const {
      prompt,
      width,
      height,
      steps = 20,
      guidance = 4,
      seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      referenceImageFilename,
    } = options;

    // Base workflow structure
    const workflow: ComfyUIWorkflow = {
      // CLIP Text Encode (Positive Prompt)
      "6": {
        inputs: {
          text: prompt,
          clip: ["38", 0],
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "CLIP Text Encode (Positive Prompt)" },
      },
      // VAE Decode
      "8": {
        inputs: {
          samples: ["13", 0],
          vae: ["10", 0],
        },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" },
      },
      // Save Image
      "9": {
        inputs: {
          filename_prefix: "Flux2",
          images: ["8", 0],
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
      },
      // Load VAE
      "10": {
        inputs: {
          vae_name: "flux2-vae.safetensors",
        },
        class_type: "VAELoader",
        _meta: { title: "Load VAE" },
      },
      // Load Diffusion Model
      "12": {
        inputs: {
          unet_name: "flux2_dev_fp8mixed.safetensors",
          weight_dtype: "default",
        },
        class_type: "UNETLoader",
        _meta: { title: "Load Diffusion Model" },
      },
      // Sampler Custom Advanced
      "13": {
        inputs: {
          noise: ["25", 0],
          guider: ["22", 0],
          sampler: ["16", 0],
          sigmas: ["48", 0],
          latent_image: ["47", 0],
        },
        class_type: "SamplerCustomAdvanced",
        _meta: { title: "SamplerCustomAdvanced" },
      },
      // KSampler Select
      "16": {
        inputs: {
          sampler_name: "euler",
        },
        class_type: "KSamplerSelect",
        _meta: { title: "KSamplerSelect" },
      },
      // Basic Guider
      "22": {
        inputs: {
          model: ["12", 0],
          conditioning: ["26", 0], // Will be modified if reference image is used
        },
        class_type: "BasicGuider",
        _meta: { title: "BasicGuider" },
      },
      // Random Noise
      "25": {
        inputs: {
          noise_seed: seed,
        },
        class_type: "RandomNoise",
        _meta: { title: "RandomNoise" },
      },
      // Flux Guidance
      "26": {
        inputs: {
          guidance: guidance,
          conditioning: ["6", 0],
        },
        class_type: "FluxGuidance",
        _meta: { title: "FluxGuidance" },
      },
      // CLIP Loader
      "38": {
        inputs: {
          clip_name: "mistral_3_small_flux2_bf16.safetensors",
          type: "flux2",
          device: "default",
        },
        class_type: "CLIPLoader",
        _meta: { title: "Load CLIP" },
      },
      // Empty Flux 2 Latent Image
      "47": {
        inputs: {
          width: width,
          height: height,
          batch_size: 1,
        },
        class_type: "EmptyFlux2LatentImage",
        _meta: { title: "Empty Flux 2 Latent" },
      },
      // Flux2 Scheduler
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
    if (referenceImageFilename) {
      // Reference Latent
      workflow["43"] = {
        inputs: {
          conditioning: ["26", 0],
          latent: ["44", 0],
        },
        class_type: "ReferenceLatent",
        _meta: { title: "ReferenceLatent" },
      };
      // VAE Encode for reference
      workflow["44"] = {
        inputs: {
          pixels: ["45", 0],
          vae: ["10", 0],
        },
        class_type: "VAEEncode",
        _meta: { title: "VAE Encode" },
      };
      // Image Scale To Total Pixels
      workflow["45"] = {
        inputs: {
          upscale_method: "lanczos",
          megapixels: 1,
          image: ["46", 0],
        },
        class_type: "ImageScaleToTotalPixels",
        _meta: { title: "ImageScaleToTotalPixels" },
      };
      // Load Image
      workflow["46"] = {
        inputs: {
          image: referenceImageFilename,
        },
        class_type: "LoadImage",
        _meta: { title: "Load Image" },
      };

      // Update BasicGuider to use ReferenceLatent output
      const basicGuider = workflow["22"];
      if (basicGuider) {
        basicGuider.inputs.conditioning = ["43", 0];
      }
    }

    return workflow;
  }

  /**
   * Build a Z Image Turbo workflow for image-to-image generation
   * Based on workflow: docs/technical/comfyui/image-to-image-with-z-image-turbo.json
   * Excludes Florence2 nodes (16, 18, 20) - not needed for API usage
   */
  buildZImageTurboWorkflow(options: ZImageTurboWorkflowOptions): ComfyUIWorkflow {
    const {
      prompt,
      inputImageFilename,
      steps = 9,
      cfg = 1,
      denoise = 0.4,
      seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      largestSize = 1024,
      shift = 3,
    } = options;

    const workflow: ComfyUIWorkflow = {
      // Node 1: UNETLoader - Load Z Image Turbo model
      "1": {
        inputs: {
          unet_name: "z_image_turbo_fp8_e4m3fn.safetensors",
          weight_dtype: "default",
        },
        class_type: "UNETLoader",
        _meta: { title: "Load Diffusion Model" },
      },
      // Node 2: CLIPLoader - Load CLIP model
      "2": {
        inputs: {
          clip_name: "qwen_3_4b.safetensors",
          type: "lumina2",
          device: "default",
        },
        class_type: "CLIPLoader",
        _meta: { title: "Load CLIP" },
      },
      // Node 3: VAELoader - Load VAE
      "3": {
        inputs: {
          vae_name: "ae.safetensors",
        },
        class_type: "VAELoader",
        _meta: { title: "Load VAE" },
      },
      // Node 4: LoadImage - Input image (required)
      "4": {
        inputs: {
          image: inputImageFilename,
        },
        class_type: "LoadImage",
        _meta: { title: "Load Image" },
      },
      // Node 5: CLIPTextEncode - Prompt
      "5": {
        inputs: {
          text: prompt,
          clip: ["2", 0],
        },
        class_type: "CLIPTextEncode",
        _meta: { title: "CLIP Text Encode (Prompt)" },
      },
      // Node 6: ConditioningZeroOut - Negative conditioning
      "6": {
        inputs: {
          conditioning: ["5", 0],
        },
        class_type: "ConditioningZeroOut",
        _meta: { title: "ConditioningZeroOut" },
      },
      // Node 7: KSampler - Main sampler
      "7": {
        inputs: {
          seed: seed,
          steps: steps,
          cfg: cfg,
          sampler_name: "res_multistep",
          scheduler: "simple",
          denoise: denoise,
          model: ["14", 0],
          positive: ["5", 0],
          negative: ["6", 0],
          latent_image: ["8", 0],
        },
        class_type: "KSampler",
        _meta: { title: "KSampler" },
      },
      // Node 8: VAEEncode - Encode input image to latent
      "8": {
        inputs: {
          pixels: ["9", 0],
          vae: ["3", 0],
        },
        class_type: "VAEEncode",
        _meta: { title: "VAE Encode" },
      },
      // Node 9: ImageScaleToMaxDimension - Scale input image
      "9": {
        inputs: {
          upscale_method: "area",
          largest_size: largestSize,
          image: ["4", 0],
        },
        class_type: "ImageScaleToMaxDimension",
        _meta: { title: "ImageScaleToMaxDimension" },
      },
      // Node 10: VAEDecode - Decode latent to image
      "10": {
        inputs: {
          samples: ["7", 0],
          vae: ["3", 0],
        },
        class_type: "VAEDecode",
        _meta: { title: "VAE Decode" },
      },
      // Node 12: SaveImage - Save output
      "12": {
        inputs: {
          filename_prefix: "ZImageTurbo",
          images: ["10", 0],
        },
        class_type: "SaveImage",
        _meta: { title: "Save Image" },
      },
      // Node 14: ModelSamplingAuraFlow - Apply model sampling
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
   * Get WebSocket URL for real-time progress updates
   */
  getWebSocketUrl(): string {
    const httpUrl = new URL(this.baseUrl);
    const wsProtocol = httpUrl.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${httpUrl.host}/ws`;
  }
}

// Export singleton instance
export const comfyui = new ComfyUIClient();
