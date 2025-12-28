# Real-Time Progress Tracking - Technical Deep Dive

## Architecture Overview

The real-time progress tracking system uses a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (React/Next.js)                                         │
│ ├─ useGeneration hook (src/hooks/use-generation.ts)             │
│ ├─ Progress component (displays bar/percentage/steps)           │
│ └─ EventSource listener (connects to /api/generate/progress)    │
└────────────────────────┬────────────────────────────────────────┘
                         │ SSE (Server-Sent Events)
                         │ HTTP/1.1 persistent connection
                         │ One-way: Server → Client streaming
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Backend (Node.js/Next.js API Routes)                            │
│ ├─ /api/generate (POST)                                         │
│ │  └─ Queues prompt to ComfyUI, stores prompt_id in DB        │
│ │                                                              │
│ └─ /api/generate/progress (GET)                               │
│    ├─ Looks up comfyuiPromptId from database                  │
│    ├─ Registers callback with WebSocket handler               │
│    ├─ Streams SSE events to frontend                          │
│    └─ Falls back to polling every 2 seconds                   │
└────────────────────────┬─────────────────────────────────────┘
                         │ WebSocket (ws://127.0.0.1:8000/ws)
                         │ Persistent bi-directional connection
                         │ Receives: execution_progress events
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ ComfyUI Server (External Python Service)                         │
│ ├─ Executes image generation workflow                           │
│ ├─ Broadcasts execution_progress events via WebSocket           │
│ │  {type: "execution_progress", data: {value, max, prompt_id}} │
│ └─ Stores results in output directory                           │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend: EventSource Listener

**File**: `src/hooks/use-generation.ts` (lines 95-175)

```typescript
// Establishes persistent connection to SSE endpoint
eventSource = new EventSource(
  `/api/generate/progress?promptId=${currentPromptId}&imageIndex=${imageIndex}&totalImages=${totalImages}`
);

// Listens for three types of events
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case "progress":
      // Real-time updates: {currentStep, totalSteps, percentage, status}
      setProgress(data);
      break;
    case "complete":
      // Generation finished: {percentage: 100, status: "Complete"}
      setIsGenerating(false);
      // IMPORTANT: Refetch generation to get images
      loadGeneration(currentGeneration.id);
      break;
    case "error":
      // Something went wrong: {message, status}
      handleError(data.message);
      break;
  }
};

// Clean up on unmount or when generation completes
return () => {
  if (eventSource) eventSource.close();
};
```

**Key Features**:
- Opens connection only when `isGenerating` is true
- Closes connection automatically on unmount
- Handles three event types for different scenarios
- Refetches generation record on completion to show images

### 2. Backend: Progress Streaming Endpoint

**File**: `src/app/api/generate/progress/route.ts`

#### Connection Flow
```
1. GET /api/generate/progress?promptId=[ID]&imageIndex=1&totalImages=1
   │
2. ReadableStream is created (SSE protocol)
   │
3. Look up generation record in DB
   ├─ Retrieve comfyuiPromptId from generations table
   ├─ Extract settings (totalSteps = settings.steps)
   └─ Validate generation exists
   │
4. Connect to ComfyUI WebSocket
   ├─ Create connection to ws://127.0.0.1:8000/ws
   ├─ Register progress callback for prompt_id
   └─ WebSocket handler waits for execution_progress events
   │
5. Send initial "connected" event
   │
6. Two concurrent streams now active:
   ├─ WebSocket: Listens for real-time progress from ComfyUI
   └─ Polling: Checks every 2 seconds for completion (fallback)
   │
7. On each progress event:
   └─ Calculate: percentage = (currentStep / totalSteps) * 100
      Send: SSE event with {type: "progress", percentage, step, status}
   │
8. On completion (polling detects status change):
   └─ Send: SSE event with {type: "complete", percentage: 100}
      Then: Close stream
```

#### Event Structure

**Sent to Frontend** (SSE format):
```
data: {"type":"progress","currentStep":5,"totalSteps":20,"percentage":25,"status":"Step 5 of 20"}\n\n
```

**Received from ComfyUI** (WebSocket format):
```json
{
  "type": "execution_progress",
  "data": {
    "value": 5,
    "max": 20,
    "prompt_id": "60d6c6d8-febf-4eea-8e69-442896eff10b"
  }
}
```

### 3. Backend: ComfyUI WebSocket Handler

**File**: `src/lib/comfyui.ts` (lines 140-230)

```typescript
// Map to store callbacks for each prompt_id
private progressCallbacks = new Map<string, Array<ProgressCallback>>();

// Register callback for a specific prompt_id
connectToProgressSocket(promptId: string, callback: ProgressCallback): () => void {
  // Add to map
  if (!this.progressCallbacks.has(promptId)) {
    this.progressCallbacks.set(promptId, []);
  }
  this.progressCallbacks.get(promptId)?.push(callback);
  
  // Create WebSocket if not exists
  if (!this.websocket) {
    this.createWebSocketConnection();
  }
  
  // Return cleanup function
  return () => {
    // Remove callback when no longer needed
    const callbacks = this.progressCallbacks.get(promptId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.progressCallbacks.delete(promptId);
      }
    }
  };
}

// WebSocket message handler
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'execution_progress') {
    const { value, max, prompt_id } = data.data;
    
    // Find all callbacks registered for this prompt_id
    const callbacks = this.progressCallbacks.get(prompt_id);
    if (callbacks) {
      // Invoke each callback with progress data
      callbacks.forEach(callback => {
        callback({ value, max });
      });
    }
  }
};
```

**Key Concepts**:
- Single WebSocket connection shared across all prompts
- Callback registry maps prompt_id → [callbacks]
- Each prompt can have multiple listeners (though typically 1)
- Callbacks are cleanup-safe (can be removed mid-stream)

### 4. Database Schema

**File**: `src/lib/schema.ts`

```typescript
pgTable('generations', {
  id: text('id').primaryKey(),
  prompt: text('prompt').notNull(),
  settings: jsonb('settings').notNull(), // Contains: {steps, guidance, ...}
  status: pgEnum('generation_status')(['pending', 'generating', 'complete', 'failed']),
  errorMessage: text('error_message'),
  comfyuiPromptId: text('comfyui_prompt_id'), // Link to ComfyUI prompt
  images: jsonb('images'), // Array of image URLs after generation
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // ... other fields
});
```

## Timing and Race Conditions

### Critical Issue: Storage Timing

**Problem**:
Progress endpoint queries for `comfyuiPromptId` immediately, but it's stored asynchronously inside the loop.

```
Time  Event                                            Issue
────  ─────────────────────────────────────────────────────────
 0ms  POST /api/generate starts
      ├─ Creates generation record
      └─ Starts async generation loop (doesn't wait)
      
 1ms  Client opens EventSource connection
      │
 5ms  GET /api/generate/progress starts
      ├─ Queries database for generation
      ├─ Retrieves comfyuiPromptId
      │  └─ ⚠️ Could be NULL if i===0 loop hasn't run yet!
      └─ Registers callback with NULL prompt_id
      
10ms  POST /api/generate loop iteration i===0:
      ├─ Calls queuePrompt()
      ├─ Gets prompt_id: "60d6c6d8-..."
      └─ Updates database with comfyuiPromptId
          (First registration above already happened!)
          
15ms  ComfyUI sends execution_progress
      ├─ Callback handler looks for registered "60d6c6d8-..."
      ├─ None found! (was registered as NULL)
      └─ Event is lost!
```

**Solution**:
✅ Move comfyuiPromptId storage immediately after queuePrompt, before entering async wait loop.

Current implementation stores ID right after queueing:
```typescript
const queueResult = await comfyui.queuePrompt(workflow);
if (i === 0 && queueResult.prompt_id) {
  await db.update(generations)
    .set({ comfyuiPromptId: queueResult.prompt_id })
    .where(eq(generations.id, generation.id));
}
```

This ensures the database has the correct prompt_id before:
1. Progress endpoint queries it
2. ComfyUI sends any events
3. WebSocket callbacks are registered

## Event Flow Diagram

```
Timeline of a successful generation:

0ms   User clicks Generate
      │
      └─→ POST /api/generate
          ├─ DB: INSERT generation (status='pending')
          ├─ ComfyUI: queuePrompt(workflow)
          │  └─ Returns: {prompt_id: "60d6c6d8-..."}
          ├─ DB: UPDATE generation SET comfyuiPromptId="60d6c6d8-..."
          │  ✅ Database now has correct prompt_id
          │
          └─ Async generation starts (don't wait for)
             ├─ ComfyUI: waitForCompletion(prompt_id)
             └─ ... (image processing for 30-120 seconds)
      
1ms   Frontend receives generation ID
      │
      └─→ EventSource /api/generate/progress?promptId=[ID]
          ├─ DB: SELECT generation WHERE id=[ID]
          │  └─ comfyuiPromptId: "60d6c6d8-..." ✅ Found it!
          │
          ├─ Connect to WebSocket ws://127.0.0.1:8000/ws
          │
          ├─ Register callback for "60d6c6d8-..."
          │  └─ progressCallbacks.set("60d6c6d8-...", [callback])
          │
          └─ Start polling timer (every 2 seconds)
      
10ms  ComfyUI starts generating
      │
      └─ 🎬 Execution starts...
         Step 1 → Step 2 → Step 3 ... → Step 20
      
12ms  ComfyUI: Step 3 complete
      │
      └─ WebSocket: broadcast execution_progress
         {type: "execution_progress", data: {value: 3, max: 20, prompt_id: "60d6c6d8-..."}}
      
12ms  Backend receives WebSocket event
      │
      ├─ Message handler parses: value=3, max=20, prompt_id="60d6c6d8-..."
      │
      ├─ Look up callbacks: progressCallbacks.get("60d6c6d8-...")
      │  └─ Found: [callback] ✅
      │
      ├─ Calculate: percentage = (3/20)*100 = 15%
      │
      └─ Callback invokes: ({value: 3, max: 20})
         │
         └─ SSE sendEvent()
            └─ Stream to client: "data: {type: 'progress', currentStep: 3, ...}\n\n"

13ms  Frontend receives SSE event
      │
      └─ setProgress({currentStep: 3, totalSteps: 20, percentage: 15})
         │
         └─ UI updates: Progress bar now at 15%
            "Step 3 of 20" displayed
      
... (repeat for steps 4-20) ...

80ms  ComfyUI: Step 20 complete
      │
      └─ WebSocket: execution_progress (value: 20, max: 20)
         → Backend → SSE → Frontend
         → UI: "Step 20 of 20" (100%)

90ms  ComfyUI: Image processing complete
      │
      ├─ Save image files
      │
      └─ Update generation status
      
90ms  Backend polling detects completion
      │
      ├─ Query: SELECT status FROM generations WHERE id=[ID]
      │  └─ status: 'complete' ✅
      │
      └─ SSE sendEvent({type: 'complete', percentage: 100})
         │
         └─ Close stream

91ms  Frontend receives 'complete' event
      │
      ├─ setProgress({...100%...})
      │
      └─ loadGeneration(generationId)  // 🔄 Refetch!
         │
         └─ GET /api/generations/[ID]
            │
            ├─ DB: SELECT * FROM generations WHERE id=[ID]
            │  └─ images: [{url: "...", timestamp: ...}]  ✅
            │
            └─ Update state with fresh generation record
      
92ms  Frontend receives fresh generation data
      │
      └─ currentGeneration.images is now populated
         │
         └─ UI renders: Images appear in results pane
            Generation complete! 🎉
```

## Debugging Tips

### Enable All Logging
The implementation includes detailed console.logs at each step. To see them:

**Terminal (Server Logs)**:
```bash
pnpm dev 2>&1 | grep -E "Generate API|ComfyUI|Progress API"
```

**Browser (Client Logs)**:
```javascript
// Open DevTools Console (F12 → Console)
// Should see: [useGeneration] ... messages
```

### Check Database State
```sql
-- See if comfyuiPromptId is stored
SELECT id, status, comfyui_prompt_id, images 
FROM generations 
WHERE id = '[generation-id]' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Verify WebSocket Connection
```javascript
// In browser console
const ws = new WebSocket('ws://127.0.0.1:8000/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (e) => console.log('Received:', JSON.parse(e.data));
```

### Check Event Format from ComfyUI
```javascript
// Sample execution_progress event that should arrive:
{
  "type": "execution_progress",
  "data": {
    "value": 5,
    "max": 20,
    "prompt_id": "60d6c6d8-febf-4eea-8e69-442896eff10b"
  }
}
```

## Performance Considerations

1. **WebSocket vs Polling**
   - WebSocket: Real-time, ~0 latency, ~1 event/step
   - Polling: 2-second intervals, ~2 second latency, backup only
   - Hybrid approach provides best user experience + reliability

2. **SSE Message Size**
   - Each message ~200 bytes (progress data)
   - ~20 steps = ~4KB per generation
   - Minimal bandwidth impact

3. **Database Queries**
   - Initial lookup: 1 query
   - Polling: 1 query every 2 seconds (max 5-10 queries)
   - Total: ~15 queries per generation (very efficient)

4. **Memory Usage**
   - EventSource: ~1KB per connection
   - WebSocket: ~1KB per connection
   - Callback registry: ~0.5KB per prompt_id
   - Scales linearly with concurrent generations

## Production Deployment

### Environment Variables
```env
# .env.production
DATABASE_URL=postgresql://user:pass@host:5432/db
COMFYUI_URL=http://localhost:8000  # Or production ComfyUI address
```

### Scaling Considerations
1. **Load Balancer**: Use sticky sessions for SSE (each client connects to one server)
2. **WebSocket Pool**: Share single ComfyUI WebSocket across server instances
3. **Redis Pub/Sub**: Broadcast progress events across servers if horizontally scaled
4. **Connection Limits**: Monitor EventSource connections per server (typical: 100-1000)

## Future Improvements

1. **Add Reconnection Logic**
   - Auto-reconnect if connection drops
   - Resume progress from last known state

2. **Implement Cancel Endpoint**
   - `POST /api/generate/[id]/cancel`
   - Sends cancel command to ComfyUI
   - Updates progress to "cancelled"

3. **Add Estimated Time Remaining**
   - Track step time: `timePerStep = elapsed / currentStep`
   - Estimate: `timeRemaining = timePerStep * (totalSteps - currentStep)`
   - Display: "~45 seconds remaining"

4. **Better Error Recovery**
   - Retry failed generations automatically
   - Show error details in UI
   - Allow user to retry with different settings

5. **Compression**
   - Gzip SSE events if they grow larger
   - Reduce bandwidth on slow connections

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Status**: Complete and tested
