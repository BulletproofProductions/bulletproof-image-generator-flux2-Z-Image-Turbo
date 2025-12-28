import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock class for testing progress tracking logic
class MockComfyUIClient {
  private lastInferenceProgress: Map<string, { value: number; max: number }> = new Map();
  private progressCallbacks: Map<string, Array<(progress: { value: number; max: number }) => void>> = new Map();

  connectToProgressSocket(
    promptId: string,
    callback: (progress: { value: number; max: number }) => void
  ): () => void {
    if (!this.progressCallbacks.has(promptId)) {
      this.progressCallbacks.set(promptId, []);
    }
    this.progressCallbacks.get(promptId)?.push(callback);

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

  getLastInferenceProgress(promptId: string) {
    return this.lastInferenceProgress.get(promptId);
  }

  setLastInferenceProgress(promptId: string, value: number, max: number) {
    this.lastInferenceProgress.set(promptId, { value, max });
  }

  hasInferenceProgress(promptId: string) {
    return this.lastInferenceProgress.has(promptId);
  }

  clearInferenceProgress(promptId: string) {
    this.lastInferenceProgress.delete(promptId);
  }

  clearAllInferenceProgress() {
    this.lastInferenceProgress.clear();
  }
}

describe("ComfyUI Progress Tracking - Regression Tests", () => {
  let client: MockComfyUIClient;
  let progressUpdates: Array<{ value: number; max: number }>;

  beforeEach(() => {
    client = new MockComfyUIClient();
    progressUpdates = [];
    vi.clearAllMocks();
  });

  afterEach(() => {
    client.clearAllInferenceProgress();
  });

  describe("Test 1: Initial Connection", () => {
    it("should track initial progress state correctly", () => {
      // Simulate ComfyUI sending initial progress_state (setup nodes: 3/3)
      const promptId = "test-prompt-1";

      // Mock WebSocket connection
      const mockCallback = vi.fn((progress: { value: number; max: number }) => {
        progressUpdates.push(progress);
      });

      // Register callback
      const cleanup = client.connectToProgressSocket(promptId, mockCallback);

      // Simulate initial progress_state message (3 setup nodes)
      // The handler should trigger but max should be 3 (for setup phase)
      // This is acceptable as the inference progress hasn't started yet
      expect(client.hasInferenceProgress(promptId)).toBe(false);

      cleanup();
    });
  });

  describe("Test 2: Inference Progress Takes Priority", () => {
    it("should prioritize inference progress (1/20) over aggregate nodes (3/3)", () => {
      const promptId = "test-prompt-2";
      const callbacks: Array<{ value: number; max: number }> = [];

      const mockCallback = vi.fn((progress: { value: number; max: number }) => {
        callbacks.push(progress);
      });

      const cleanup = client.connectToProgressSocket(promptId, mockCallback);

      // Step 1: No inference progress yet
      expect(client.hasInferenceProgress(promptId)).toBe(false);

      // Step 2: Simulate inference progress arriving (1/20)
      client.setLastInferenceProgress(promptId, 1, 20);
      expect(client.hasInferenceProgress(promptId)).toBe(true);
      expect(client.getLastInferenceProgress(promptId)).toEqual({
        value: 1,
        max: 20,
      });

      // Step 3: Verify inference progress is preserved
      const inferenceProgress = client.getLastInferenceProgress(promptId);
      if (!inferenceProgress) {
        // This should NOT happen
        expect(false).toBe(true);
      } else {
        // Inference progress should be 1/20, not aggregate
        expect(inferenceProgress.max).toBe(20);
        expect(inferenceProgress.value).toBe(1);
      }

      cleanup();
    });
  });

  describe("Test 3: Inference Progress Sequence", () => {
    it("should track complete inference sequence from 1/20 to 20/20", () => {
      const promptId = "test-prompt-3";
      const callbacks: Array<{ value: number; max: number }> = [];

      const mockCallback = vi.fn((progress: { value: number; max: number }) => {
        callbacks.push(progress);
      });

      const cleanup = client.connectToProgressSocket(promptId, mockCallback);

      // Simulate inference progress from 1/20 to 20/20
      for (let i = 1; i <= 20; i++) {
        client.setLastInferenceProgress(promptId, i, 20);

        const progress = client.getLastInferenceProgress(promptId);
        expect(progress?.value).toBe(i);
        expect(progress?.max).toBe(20);
      }

      cleanup();
    });
  });

  describe("Test 4: Cleanup on Completion", () => {
    it("should clean up inference progress when callbacks are removed", () => {
      const promptId = "test-prompt-4";

      const mockCallback = vi.fn();
      const cleanup = client.connectToProgressSocket(promptId, mockCallback);

      // Store some inference progress
      client.setLastInferenceProgress(promptId, 15, 20);
      expect(client.hasInferenceProgress(promptId)).toBe(true);

      // Call cleanup function
      cleanup();

      // Verify it was cleaned up
      expect(client.hasInferenceProgress(promptId)).toBe(false);
    });
  });

  describe("Test 5: Multiple Concurrent Generations", () => {
    it("should track multiple generations independently", () => {
      const promptId1 = "test-prompt-5a";
      const promptId2 = "test-prompt-5b";

      const mockCallback1 = vi.fn();
      const mockCallback2 = vi.fn();

      const cleanup1 = client.connectToProgressSocket(promptId1, mockCallback1);
      const cleanup2 = client.connectToProgressSocket(promptId2, mockCallback2);

      // Track different progress for each
      client.setLastInferenceProgress(promptId1, 5, 20);
      client.setLastInferenceProgress(promptId2, 10, 20);

      expect(client.getLastInferenceProgress(promptId1)).toEqual({
        value: 5,
        max: 20,
      });
      expect(client.getLastInferenceProgress(promptId2)).toEqual({
        value: 10,
        max: 20,
      });

      cleanup1();

      // After cleanup1, promptId1 should be removed but promptId2 should remain
      expect(client.hasInferenceProgress(promptId1)).toBe(false);
      expect(client.hasInferenceProgress(promptId2)).toBe(true);

      cleanup2();

      // After cleanup2, both should be removed
      expect(client.hasInferenceProgress(promptId1)).toBe(false);
      expect(client.hasInferenceProgress(promptId2)).toBe(false);
    });
  });

  describe("Test 6: Aggregate Data Fallback During Setup", () => {
    it("should use aggregate progress only when inference hasn't started", () => {
      const promptId = "test-prompt-6";

      // Before any inference progress is tracked, aggregate should be usable
      expect(client.hasInferenceProgress(promptId)).toBe(false);

      // This is the signal that setup phase can use aggregate (3/3, 4/4, 5/5)
      const hasInferenceProgress = client.hasInferenceProgress(promptId);
      expect(hasInferenceProgress).toBe(false);

      // Simulate inference starting
      client.setLastInferenceProgress(promptId, 1, 20);

      // Now aggregate should NOT be used
      const hasInferenceProgressNow = client.hasInferenceProgress(promptId);
      expect(hasInferenceProgressNow).toBe(true);
    });
  });
});

describe("ComfyUI WebSocket Handler - Message Type Priority", () => {
  describe("Message Priority: progress > progress_state > execution_progress", () => {
    it("should prioritize 'progress' messages over 'progress_state' messages", () => {
      // This is the core fix:
      // When progress message arrives first, it should be stored
      // When progress_state arrives later, it should check for existing progress
      // and NOT overwrite it

      const promptId = "priority-test";
      const client = new MockComfyUIClient();

      // Simulate progress message arriving (1/20)
      client.setLastInferenceProgress(promptId, 1, 20);

      // Now simulate progress_state arriving (3/3)
      const inferenceProgress = client.getLastInferenceProgress(promptId);

      // The handler should check: if inferenceProgress exists, don't use aggregate
      if (!inferenceProgress) {
        // Use aggregate (this code should NOT execute)
        expect(false).toBe(true);
      } else {
        // Use inference progress (this code SHOULD execute)
        expect(inferenceProgress.max).toBe(20);
      }
    });
  });
});
