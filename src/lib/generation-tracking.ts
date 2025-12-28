/**
 * In-memory tracking of generation IDs to ComfyUI prompt IDs
 * Allows progress API to look up the actual ComfyUI prompt_id for a given generation
 * 
 * This is necessary because generation.id is a database UUID, but ComfyUI needs
 * its own prompt_id to track progress. We store this mapping during async generation.
 */

interface GenerationTrackingEntry {
  promptId: string;
  createdAt: number;
}

const generationPromptIdMap = new Map<string, GenerationTrackingEntry>();

// Clean up entries older than 1 hour
const CLEANUP_INTERVAL = 60 * 60 * 1000;
const ENTRY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

setInterval(() => {
  const now = Date.now();
  for (const [generationId, entry] of generationPromptIdMap.entries()) {
    if (now - entry.createdAt > ENTRY_TIMEOUT) {
      console.log(`[GenerationTracking] Cleaning up expired entry for generation ${generationId}`);
      generationPromptIdMap.delete(generationId);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Register a generation with its ComfyUI prompt ID
 */
export function registerGenerationPromptId(generationId: string, promptId: string): void {
  console.log(`[GenerationTracking] Registered generation ${generationId} -> prompt ${promptId}`);
  generationPromptIdMap.set(generationId, {
    promptId,
    createdAt: Date.now(),
  });
}

/**
 * Get the ComfyUI prompt ID for a generation
 */
export function getGenerationPromptId(generationId: string): string | null {
  const entry = generationPromptIdMap.get(generationId);
  if (entry) {
    console.log(`[GenerationTracking] Found prompt ID for generation ${generationId}: ${entry.promptId}`);
    return entry.promptId;
  }
  console.warn(`[GenerationTracking] No prompt ID found for generation ${generationId}`);
  return null;
}

/**
 * Unregister a generation (call when done)
 */
export function unregisterGenerationPromptId(generationId: string): void {
  console.log(`[GenerationTracking] Unregistered generation ${generationId}`);
  generationPromptIdMap.delete(generationId);
}
