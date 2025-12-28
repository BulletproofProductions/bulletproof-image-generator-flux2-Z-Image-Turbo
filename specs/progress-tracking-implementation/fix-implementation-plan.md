Plan: Fix Real-Time Progress Updates and Image Display
Overview
The implementation is partially working (backend generates images successfully), but three critical issues prevent proper UX:

Timing Issue: comfyuiPromptId is stored after progress tracking begins, causing null lookups
WebSocket Not Sending Progress Events: No execution_progress updates received despite connection
Frontend Not Displaying Generated Images: Images are generated but not shown in results pane
Root Causes
Issue 1: Race Condition with comfyuiPromptId Storage
Progress SSE connection starts immediately after generation starts (line in generate/route.ts)
But comfyuiPromptId is only stored AFTER the prompt is queued (inside the async loop)
Result: First progress check finds comfyuiPromptId: null
Issue 2: WebSocket Progress Events Not Received
Logs show WebSocket progress received: false despite connection established
connectToProgressSocket callback is never being triggered
Likely cause: execution_progress event type/format mismatch or prompt_id key mismatch
Issue 3: Frontend Not Refetching Images After Completion
Progress "complete" event received by frontend
But frontend hook doesn't refetch the generation record to get image URLs
Images exist in DB but not displayed because frontend has stale data
Implementation Steps
1. Fix Race Condition: Store comfyuiPromptId Before Starting Async Work
File: route.ts:195-210

Move the comfyuiPromptId storage outside the async generation loop
Store it immediately after queuePrompt() returns, before any other async work
This ensures the ID is in the database before progress API queries it
2. Debug and Fix WebSocket Progress Events
Files: comfyui.ts:181-240 and route.ts:145-160

Add logging to WebSocket onmessage to see actual event format from ComfyUI
Verify event.data structure has type: "execution_progress" and data.prompt_id fields
Check if prompt_id in events matches the one being registered for callbacks
Ensure callback is properly registered BEFORE WebSocket messages arrive
3. Refetch Generation with Images on Completion
File: use-generation.ts:125-135

When "complete" event received, fetch the updated generation record
Use loadGeneration(generationId) to get fresh data with image URLs
Update currentGeneration state so results pane displays images
4. Verify Frontend EventSource Connection
File: use-generation.ts:102-145

Add console logging to track SSE events received from backend
Verify progress updates are being processed (not silently failing)
Check that EventSource is properly opened and stays connected during generation
Further Considerations
Database Persistence vs In-Memory Map: Consider whether storing comfyuiPromptId in DB (current approach) is slower than in-memory mapping. If DB writes are delayed, may need to use the in-memory generationPromptIdMap approach already in place.

Multiple Sequential Generations: Verify that EventSource cleanup between generations doesn't break subsequent progress tracking.

WebSocket vs Polling Fallback: Since WebSocket events aren't triggering, polling fallback is the current lifeline. Ensure polling happens with appropriate frequency (currently 2 seconds per logs).

Image URLs in Response: Verify the POST /api/generate endpoint is returning the generated images in its response so frontend has them immediately upon completion.