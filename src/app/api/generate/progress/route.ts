/**
 * @fileoverview Progress Tracking API - Server-Sent Events for Real-time Updates
 * 
 * This endpoint provides real-time progress updates for image generation
 * using Server-Sent Events (SSE). It bridges the ComfyUI WebSocket connection
 * to HTTP clients that can't connect directly to ComfyUI.
 * 
 * ## Architecture
 * 
 * ```
 * ┌──────────┐    WebSocket    ┌──────────┐      SSE       ┌──────────┐
 * │ ComfyUI  │ ──────────────▶ │ Next.js  │ ─────────────▶ │ Browser  │
 * │ Server   │    Progress     │ API      │   Progress     │ Client   │
 * └──────────┘    Events       └──────────┘   Events       └──────────┘
 * ```
 * 
 * ## Event Types
 * 
 * | Type | Description | Fields |
 * |------|-------------|--------|
 * | connected | Initial connection established | status, imageIndex, totalImages |
 * | progress | Diffusion step completed | currentStep, totalSteps, percentage |
 * | complete | Generation finished successfully | percentage: 100 |
 * | error | Generation failed | message |
 * 
 * ## Progress Tracking Strategy
 * 
 * 1. **WebSocket (Primary)**: Connects to ComfyUI WebSocket for real-time
 *    step-by-step progress updates during diffusion.
 * 
 * 2. **Database Polling (Fallback)**: Polls the database every 2 seconds
 *    to detect completion/failure in case WebSocket misses events.
 * 
 * This dual approach ensures reliable progress tracking even if the
 * WebSocket connection is interrupted or ComfyUI doesn't send events.
 * 
 * ## Query Parameters
 * 
 * - `promptId`: Generation database ID (NOT ComfyUI prompt_id)
 * - `imageIndex`: Current image being generated (1-based)
 * - `totalImages`: Total images in this generation
 * 
 * ## Usage
 * 
 * ```javascript
 * const eventSource = new EventSource(
 *   `/api/generate/progress?promptId=${generationId}&imageIndex=1&totalImages=2`
 * );
 * 
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   if (data.type === 'progress') {
 *     updateProgressBar(data.percentage);
 *   } else if (data.type === 'complete') {
 *     eventSource.close();
 *   }
 * };
 * ```
 * 
 * @module api/generate/progress
 */

import { comfyui } from "@/lib/comfyui";
import { db } from "@/lib/db";
import { generations } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Disable static optimization - SSE requires dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Structure of progress update events sent to clients
 */
interface ProgressUpdate {
  /** Event type: connected, progress, complete, or error */
  type: "progress" | "complete" | "error" | "connected";
  /** Current diffusion step number */
  currentStep?: number;
  /** Total steps in the diffusion process */
  totalSteps?: number;
  /** Percentage complete (0-100) */
  percentage?: number;
  /** Current image index (1-based) */
  imageIndex?: number;
  /** Total images being generated */
  totalImages?: number;
  /** Human-readable status message */
  status?: string;
  /** Error message (for error events) */
  message?: string;
}

/**
 * GET /api/generate/progress
 * 
 * Server-Sent Events endpoint for real-time generation progress.
 * Bridges ComfyUI WebSocket to HTTP clients.
 * 
 * @param request - Next.js request object with searchParams
 * @returns SSE stream with progress events
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Note: promptId parameter is actually the generation database ID,
  // not the ComfyUI prompt_id. We look up the ComfyUI ID from the database.
  const generationId = searchParams.get("promptId");
  const imageIndex = parseInt(searchParams.get("imageIndex") || "1", 10);
  const totalImages = parseInt(searchParams.get("totalImages") || "1", 10);

  console.log(`[Progress API] Starting progress tracking for generationId: ${generationId}, image ${imageIndex}/${totalImages}`);

  if (!generationId) {
    return new Response(JSON.stringify({ error: "promptId (generation ID) is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  let webSocketProgressReceived = false;

  // Create SSE stream using ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      let isAborted = false;
      let pollInterval: ReturnType<typeof setTimeout> | null = null;
      let progressCleanup: (() => void) | null = null;
      let comfyuiPromptId: string | null = null;
      let lastPercent = 0;

      /**
       * Send an SSE event to the client
       * @param data - Progress update data to send
       */
      const sendEvent = (data: ProgressUpdate) => {
        if (isAborted) return;
        try {
          console.log(`[Progress API] Sending event: ${data.type}`, {
            generationId,
            comfyuiPromptId,
            percentage: data.percentage,
            step: data.currentStep,
            totalSteps: data.totalSteps,
          });
          // SSE format: "data: <json>\n\n"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('[Progress API] Error sending event:', error);
          isAborted = true;
        }
      };

      /**
       * Clean up resources when connection closes
       */
      const cleanup = () => {
        console.log(`[Progress API] Cleaning up for generationId: ${generationId}. WebSocket progress received: ${webSocketProgressReceived}`);
        isAborted = true;
        if (pollInterval) {
          clearTimeout(pollInterval);
          pollInterval = null;
        }
        if (progressCleanup) {
          progressCleanup();
          progressCleanup = null;
        }
        try {
          controller.close();
        } catch {
          // Already closed - ignore
        }
      };

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        console.log(`[Progress API] Client disconnected for generationId: ${generationId}`);
        cleanup();
      });

      // Send initial connected event
      sendEvent({ 
        type: "connected", 
        status: "Connecting to ComfyUI...",
        imageIndex,
        totalImages,
      });

      // Check if ComfyUI is available
      const isAvailable = await comfyui.healthCheck();
      if (!isAvailable) {
        console.error(`[Progress API] ComfyUI health check failed for generationId: ${generationId}`);
        sendEvent({
          type: "error",
          message: "ComfyUI is not running",
          status: "Error",
        });
        cleanup();
        return;
      }

      // Get the generation record to find comfyuiPromptId
      const [generation] = await db
        .select()
        .from(generations)
        .where(eq(generations.id, generationId));

      if (!generation) {
        console.warn(`[Progress API] Generation not found: ${generationId}`);
        sendEvent({
          type: "error",
          message: "Generation not found",
          status: "Error",
        });
        cleanup();
        return;
      }

      // Extract ComfyUI prompt ID and settings from generation record
      comfyuiPromptId = generation.comfyuiPromptId || null;
      
      // Parse settings (may be object or JSON string)
      let settings: Record<string, unknown> = {};
      if (typeof generation.settings === "string") {
        try {
          settings = JSON.parse(generation.settings);
        } catch {
          settings = {};
        }
      } else if (generation.settings) {
        settings = generation.settings as Record<string, unknown>;
      }
      
      const totalSteps = (settings?.steps as number) || 20;
      let lastStep = 0;
      
      console.log(`[Progress API] Generation details - comfyuiPromptId: ${comfyuiPromptId}, totalSteps: ${totalSteps}, status: ${generation.status}`);
      
      // Send initial progress update
      sendEvent({
        type: "progress",
        status: "Connected to ComfyUI",
        imageIndex,
        totalImages,
        currentStep: 0,
        totalSteps,
        percentage: 0,
      });

      // ================================================================
      // PRIMARY: WebSocket Progress Tracking
      // ================================================================
      if (comfyuiPromptId) {
        console.log(`[Progress API] Registering WebSocket callback for comfyuiPromptId: ${comfyuiPromptId}`);
        
        // Register callback for WebSocket progress events
        progressCleanup = comfyui.connectToProgressSocket(comfyuiPromptId, ({ value, max }) => {
          if (lastPercent >= 100) return; // Ignore updates after completion
          
          webSocketProgressReceived = true;
          // Use totalSteps from settings, not WebSocket 'max' which may be incorrect
          const percent = Math.round((value / totalSteps) * 100);
          lastStep = value;
          lastPercent = percent;
          
          console.log(`[Progress API] WebSocket callback triggered for ${comfyuiPromptId}: ${value}/${totalSteps} (${percent}%)`);
          sendEvent({
            type: "progress",
            currentStep: value,
            totalSteps: totalSteps,
            percentage: percent,
            imageIndex,
            totalImages,
            status: `Step ${value} of ${max}`,
          });
        });
      } else {
        console.warn(`[Progress API] No comfyuiPromptId found for generation: ${generationId}`);
      }

      // ================================================================
      // FALLBACK: Database Polling for Completion Detection
      // ================================================================
      // Poll every 2 seconds in case WebSocket doesn't send completion event
      const pollForCompletion = async () => {
        if (isAborted) return;
        
        try {
          const [gen] = await db
            .select()
            .from(generations)
            .where(eq(generations.id, generationId));
            
          if (!gen) {
            sendEvent({
              type: "error",
              message: "Generation not found",
              status: "Error",
            });
            cleanup();
            return;
          }
          
          // Check for completion
          if (gen.status === "completed") {
            sendEvent({
              type: "complete",
              currentStep: lastStep || totalSteps,
              totalSteps,
              percentage: 100,
              imageIndex,
              totalImages,
              status: `Image ${imageIndex} of ${totalImages} - Generation complete!`,
            });
            // Cleanup immediately to stop polling
            if (pollInterval) {
              clearTimeout(pollInterval);
              pollInterval = null;
            }
            cleanup();
            return;
          }
          if (gen.status === "failed") {
            sendEvent({
              type: "error",
              message: gen.errorMessage || "Generation failed",
              status: "Error",
            });
            // Cleanup immediately to stop polling
            if (pollInterval) {
              clearTimeout(pollInterval);
              pollInterval = null;
            }
            cleanup();
            return;
          }
          pollInterval = setTimeout(pollForCompletion, 2000);
        } catch (error) {
          sendEvent({
            type: "error",
            message: error instanceof Error ? error.message : "Polling failed",
            status: "Error",
          });
          cleanup();
        }
      };
      pollForCompletion();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
