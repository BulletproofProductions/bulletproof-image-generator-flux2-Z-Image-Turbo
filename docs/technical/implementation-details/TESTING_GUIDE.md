# Quick Start - Testing Real-Time Progress

## Prerequisites
- ComfyUI server running on `http://127.0.0.1:8000` (usually started separately)
- Database configured in `.env` (PostgreSQL)

## Starting the App

```bash
# Terminal 1: Start the development server
cd d:\dev\bulletproof-image-generator
pnpm dev
# App will be available at http://localhost:3000
```

## Testing the Feature

### Method 1: Via UI (Recommended)
1. Open http://localhost:3000 in your browser
2. Go to the generation page
3. Enter a prompt (e.g., "A beautiful sunset")
4. Set image count to 1
5. Click "Generate"
6. Watch the progress bar update in real-time:
   - Shows percentage (0-100%)
   - Shows step count (e.g., "Step 5 / 20")
   - Shows status message
7. After completion:
   - Progress bar reaches 100%
   - Generated image appears in the results section

### Method 2: Via API (For Testing)
```powershell
# Post a generation request
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/generate" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        prompt = "A cat wearing sunglasses"
        settings = @{
            width = 512
            height = 512
            steps = 10
            guidance = 7.5
            imageCount = 1
        }
    } | ConvertTo-Json)

$generationId = ($response.Content | ConvertFrom-Json).id

# Open progress stream (shows real-time updates)
$progressUrl = "http://localhost:3000/api/generate/progress?promptId=$generationId&imageIndex=1&totalImages=1"
Invoke-WebRequest -Uri $progressUrl
```

## Monitoring Logs

### Server Logs (Terminal running `pnpm dev`)
Watch for these messages:
```
[Generate API] Queued prompt for generation [ID]: [PROMPT_ID]
[Generate API] Stored comfyuiPromptId for generation [ID]: [PROMPT_ID]
[ComfyUI] WebSocket connection established
[ComfyUI] Execution progress event - prompt_id: [ID], value: 5, max: 20
[Progress API] Sending event: progress ... percentage: 25
[Progress API] Sending event: complete ... 100%
```

### Browser Console (Press F12 → Console)
Watch for these messages:
```
[useGeneration] Opening EventSource for generation: [ID]
[useGeneration] SSE event received: progress {percentage: 25, step: 5}
[useGeneration] Generation complete event received for generation: [ID]
[useGeneration] Refetching generation: [ID]
```

## Troubleshooting

### Issue: Progress bar stuck at 0%
**Steps to debug**:
1. Check server logs for `[Generate API] Stored comfyuiPromptId...`
   - If missing: Database write failed
   - Check database connection in `.env`

2. Check if ComfyUI is running:
   ```bash
   curl http://127.0.0.1:8000/api/system
   ```
   - If error: Start ComfyUI server

3. Look for WebSocket errors in logs:
   ```
   [ComfyUI] No callbacks registered for prompt_id: ...
   ```
   - Indicates prompt_id mismatch

### Issue: Images don't appear after generation
**Steps to debug**:
1. Check browser console for refetch log:
   ```
   [useGeneration] Refetching generation:
   ```
   - If missing: Completion event didn't trigger

2. Check if images are in the database:
   ```sql
   SELECT id, status, images FROM generations 
   WHERE id = '[generation-id]' 
   LIMIT 1;
   ```

3. Check API response:
   ```bash
   curl http://localhost:3000/api/generations/[generation-id]
   ```
   - Should return images array in response

### Issue: Build fails
```bash
# Clean and rebuild
rm -r .next
pnpm build
```

## Performance Notes

- Progress updates stream in real-time (1-2 second frequency)
- Each update includes: percentage, step count, total steps, status
- SSE connection stays open until generation completes
- Fallback polling checks every 2 seconds if WebSocket stalls
- Database queries are optimized with proper indexes

## Next Steps

After confirming the feature works:
1. Test with multiple images (set `imageCount: 2` or more)
2. Test cancellation (requires additional backend endpoint)
3. Test with different step counts (10, 20, 50 steps)
4. Monitor performance with network throttling (DevTools)
5. Test with image reference features (if implemented)

## Useful Links

- Main App: http://localhost:3000
- API Endpoint: http://localhost:3000/api/generate
- Progress Stream: http://localhost:3000/api/generate/progress?promptId=[ID]
- Generation History: http://localhost:3000/api/generations
- ComfyUI: http://127.0.0.1:8000
