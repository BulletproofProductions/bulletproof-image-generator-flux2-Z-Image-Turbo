import { comfyui } from "@/lib/comfyui";
import { db } from "@/lib/db";
import { generations } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface ProgressUpdate {
  type: "progress" | "complete" | "error" | "connected";
  currentStep?: number;
  totalSteps?: number;
  percentage?: number;
  imageIndex?: number;
  totalImages?: number;
  status?: string;
  message?: string;
}

/**
 * GET /api/generate/progress
 * Server-Sent Events endpoint for real-time generation progress
 * Uses ComfyUI WebSocket for step-by-step updates with fallback to polling
 * 
 * The promptId parameter is actually the generation database ID.
 * We need to look up the ComfyUI prompt_id from the generation record.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get("promptId"); // Note: this is generation.id, not comfyui prompt_id
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

  const stream = new ReadableStream({
    async start(controller) {
      let isAborted = false;
      let pollInterval: ReturnType<typeof setTimeout> | null = null;
      let progressCleanup: (() => void) | null = null;
      let comfyuiPromptId: string | null = null;
      let lastPercent = 0;

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
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('[Progress API] Error sending event:', error);
          isAborted = true;
        }
      };

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
          // Already closed
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

      comfyuiPromptId = generation.comfyuiPromptId || null;
      // Parse settings if needed (it may be a plain object or a JSON string)
      let settings: any = generation.settings;
      if (typeof settings === "string") {
        try {
          settings = JSON.parse(settings);
        } catch {
          settings = {};
        }
      }
      const totalSteps = settings?.steps || 20;
      let lastStep = 0;
      
      console.log(`[Progress API] Generation details - comfyuiPromptId: ${comfyuiPromptId}, totalSteps: ${totalSteps}, status: ${generation.status}`);
      
      sendEvent({
        type: "progress",
        status: "Connected to ComfyUI",
        imageIndex,
        totalImages,
        currentStep: 0,
        totalSteps,
        percentage: 0,
      });

      if (comfyuiPromptId) {
        // Use ComfyUI WebSocket for real progress
        console.log(`[Progress API] Registering WebSocket callback for comfyuiPromptId: ${comfyuiPromptId}`);
        progressCleanup = comfyui.connectToProgressSocket(comfyuiPromptId, ({ value, max }) => {
          if(lastPercent >= 100) return; // Ignore any updates after completion
          webSocketProgressReceived = true;
          // Use totalSteps from settings, not the 'max' from WebSocket which may be incorrect
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

      // Poll for completion in the background (in case WebSocket doesn't send completion)
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
