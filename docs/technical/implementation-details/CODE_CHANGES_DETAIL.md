# Exact Code Changes Made

## File 1: `src/lib/comfyui.ts`

### Change 1: Added Property to ComfyUIClient Class (Line 108)

**Location**: After `private progressCallbacks: Map<string, ProgressCallback[]> = new Map();`

**Added**:
```typescript
private lastInferenceProgress: Map<string, { value: number; max: number }> = new Map();
```

---

### Change 2: Modified "progress" Message Handler (Lines 220-236)

**Before**:
```typescript
else if (data.type === 'progress') {
  const { value, max, prompt_id } = data.data;
  console.log(`[ComfyUI] Progress event - prompt_id: ${prompt_id}, value: ${value}, max: ${max}`);
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
```

**After**:
```typescript
else if (data.type === 'progress') {
  const { value, max, prompt_id } = data.data;
  console.log(`[ComfyUI] Progress event - prompt_id: ${prompt_id}, value: ${value}, max: ${max}`);
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
      console.warn(`[ComfyUI] No callbacks registered for prompt_id: ${prompt_id}. Registered prompts:`, Array.from(this.progressCallbacks.keys()));
    }
  }
}
```

**Key Addition**: `this.lastInferenceProgress.set(prompt_id, { value, max });`

---

### Change 3: Restructured "progress_state" Message Handler (Lines 238-271)

**Before**:
```typescript
else if (data.type === 'progress_state') {
  const { prompt_id, nodes } = data.data;
  if (prompt_id && nodes && typeof nodes === 'object') {
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
      console.log(`[ComfyUI] Progress state event - prompt_id: ${prompt_id}, progress: ${totalValue}/${totalMax}, finished nodes: ${finishedNodes}/${Object.keys(nodes).length}`);
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
```

**After**:
```typescript
else if (data.type === 'progress_state') {
  const { prompt_id, nodes } = data.data;
  if (prompt_id && nodes && typeof nodes === 'object') {
    // Check if we have inference progress already tracked from "progress" messages
    const inferenceProgress = this.lastInferenceProgress.get(prompt_id);
    
    if (!inferenceProgress) {
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
        console.log(`[ComfyUI] Progress state event - prompt_id: ${prompt_id}, progress: ${totalValue}/${totalMax}, finished nodes: ${finishedNodes}/${Object.keys(nodes).length}`);
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
```

**Key Changes**:
1. Added check: `const inferenceProgress = this.lastInferenceProgress.get(prompt_id);`
2. Wrapped entire aggregate calculation in: `if (!inferenceProgress) { ... }`
3. This means: Only use aggregate if inference progress hasn't started yet

---

### Change 4: Updated Cleanup in connectToProgressSocket (Lines 166-173)

**Before**:
```typescript
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
    }
  }
};
```

**After**:
```typescript
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
```

**Key Addition**: `this.lastInferenceProgress.delete(promptId);`

---

### Change 5: Updated closeProgressSocket Method (Line 313)

**Before**:
```typescript
closeProgressSocket(): void {
  if (this.websocket) {
    this.websocket.close();
    this.websocket = null;
  }
  this.progressCallbacks.clear();
}
```

**After**:
```typescript
closeProgressSocket(): void {
  if (this.websocket) {
    this.websocket.close();
    this.websocket = null;
  }
  this.progressCallbacks.clear();
  this.lastInferenceProgress.clear();
}
```

**Key Addition**: `this.lastInferenceProgress.clear();`

---

## File 2: `src/hooks/use-generation.ts`

### Change: Enhanced Console Logging (Lines 114-122)

**Before**:
```typescript
eventSource.onmessage = (event) => {
  if (!isMounted) return;
  try {
    const data = JSON.parse(event.data);
    console.log('[useGeneration] SSE event received:', data);
    // ... rest of handler
```

**After**:
```typescript
eventSource.onmessage = (event) => {
  if (!isMounted) return;
  try {
    const data = JSON.parse(event.data);
    console.log('[useGeneration] SSE event received:', {
      type: data.type,
      percentage: data.percentage,
      step: data.currentStep,
      totalSteps: data.totalSteps,
      status: data.status,
    });
    // ... rest of handler
```

**Key Change**: Expanded console.log to show individual event properties for better debugging visibility.

---

## File 3: `src/lib/__tests__/comfyui-progress.test.ts` (NEW)

**File created with 7 regression tests**:
1. Test 1: Initial Connection
2. Test 2: Inference Progress Takes Priority
3. Test 3: Inference Progress Sequence
4. Test 4: Cleanup on Completion
5. Test 5: Multiple Concurrent Generations
6. Test 6: Aggregate Data Fallback During Setup
7. Test 7: Message Type Priority

All tests passing ✅

---

## Summary of Changes

| File | Type | Changes | Purpose |
|------|------|---------|---------|
| `src/lib/comfyui.ts` | Modified | Added tracking Map + 2 handlers + 2 cleanup locations | Track inference progress separately, prioritize it over aggregate |
| `src/hooks/use-generation.ts` | Modified | Enhanced console logging | Better debugging visibility |
| `src/lib/__tests__/comfyui-progress.test.ts` | New | 7 regression tests | Verify fix and prevent regression |

**Total Changes**: 5 code changes + 1 new test file

**Impact**: Minimal and localized to progress tracking logic

**Risk**: Low - changes are backward compatible and well-tested

---

## How to Verify the Changes

1. Open `src/lib/comfyui.ts` and search for `lastInferenceProgress` (should find 5+ occurrences)
2. Open `src/hooks/use-generation.ts` and check the enhanced console.log in onmessage handler
3. Run `pnpm vitest run src/lib/__tests__/comfyui-progress.test.ts` to verify tests pass
4. Generate an image and watch server logs for WebSocket callbacks with correct max values

---

## Expected Log Output After Fix

### Backend Console (when generating an image):
```
[Progress API] Starting progress tracking for generationId: xxx, image 1/1
[Progress API] Generation details - comfyuiPromptId: yyy, totalSteps: 20, status: pending

[ComfyUI] Progress state event - prompt_id: yyy, progress: 0/3
[ComfyUI] Found 1 callbacks for prompt_id yyy
[Progress API] WebSocket callback triggered for yyy: 0/3 (0%)
[Progress API] Sending event: progress { ... step: 0, totalSteps: 3 }

[ComfyUI] Progress event - prompt_id: yyy, value: 1, max: 20
[ComfyUI] Progress update for yyy: 1/20
[ComfyUI] Found 1 callbacks for prompt_id yyy
[Progress API] WebSocket callback triggered for yyy: 1/20 (5%)
[Progress API] Sending event: progress { ... step: 1, totalSteps: 20 }

[ComfyUI] Progress event - prompt_id: yyy, value: 2, max: 20
... (continues with increments) ...

[ComfyUI] Progress event - prompt_id: yyy, value: 20, max: 20
[Progress API] WebSocket callback triggered for yyy: 20/20 (100%)
[Progress API] Sending event: progress { ... step: 20, totalSteps: 20 }
```

### Frontend Console (when generating an image):
```
[useGeneration] SSE event received: { type: 'connected', percentage: undefined, step: undefined, totalSteps: undefined, status: 'Connecting to ComfyUI...' }

[useGeneration] SSE event received: { type: 'progress', percentage: 0, step: 0, totalSteps: 3, status: 'Connected to ComfyUI' }

[useGeneration] SSE event received: { type: 'progress', percentage: 5, step: 1, totalSteps: 20, status: 'Step 1 of 20' }

[useGeneration] SSE event received: { type: 'progress', percentage: 10, step: 2, totalSteps: 20, status: 'Step 2 of 20' }

... (increments continue) ...

[useGeneration] SSE event received: { type: 'progress', percentage: 100, step: 20, totalSteps: 20, status: 'Step 20 of 20' }

[useGeneration] Generation complete event received for generation: xxx
```

**Key Indicator of Fix Working**: `totalSteps: 20` in the progress events (was `totalSteps: 3` before the fix)

---

## Before vs After Comparison

### BEFORE THE FIX ❌
```
SSE Event 1: { type: 'progress', step: 0, totalSteps: 3, percentage: 0 }
SSE Event 2: { type: 'progress', step: 3, totalSteps: 3, percentage: 100 }  ← WRONG!
SSE Event 3: { type: 'progress', step: 3, totalSteps: 3, percentage: 100 }  ← No updates!
...
Frontend Display: "Step 3/3 and 100%" (WRONG - should be 20/20)
```

### AFTER THE FIX ✅
```
SSE Event 1: { type: 'progress', step: 0, totalSteps: 3, percentage: 0 }
SSE Event 2: { type: 'progress', step: 1, totalSteps: 20, percentage: 5 }   ← Inference starts!
SSE Event 3: { type: 'progress', step: 2, totalSteps: 20, percentage: 10 }  ← Updates!
SSE Event 4: { type: 'progress', step: 3, totalSteps: 20, percentage: 15 }  ← Updates!
...
SSE Event 21: { type: 'progress', step: 20, totalSteps: 20, percentage: 100 } ← Complete!
Frontend Display: "Step 1/20 → 2/20 → ... → 20/20" (CORRECT!)
```
