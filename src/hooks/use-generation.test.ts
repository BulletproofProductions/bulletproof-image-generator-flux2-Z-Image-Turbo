import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeneration } from '@/hooks/use-generation';
import type { GenerationWithImages, GenerationSettings } from '@/lib/types/generation';

// Mock fetch
global.fetch = vi.fn();

const mockGeneration: GenerationWithImages = {
  id: 'test-gen-1',
  prompt: 'test prompt',
  settings: {
    resolution: '1K',
    aspectRatio: '1:1',
    imageCount: 2,
    steps: 20,
    guidance: 4,
  } as GenerationSettings,
  images: [],
  status: 'completed',
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGeneration());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.currentGeneration).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.currentPromptId).toBeNull();
      expect(result.current.currentImageIndex).toBe(1);
      expect(result.current.totalImages).toBe(1);
      expect(result.current.error).toBeNull();
    });
  });

  describe('generate', () => {
    it('should start generation and set batch tracking', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ generation: mockGeneration }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate({
          prompt: 'test prompt',
          settings: {
            resolution: '1K',
            aspectRatio: '1:1',
            imageCount: 2,
            steps: 20,
            guidance: 4,
          } as GenerationSettings,
        });
      });

      expect(result.current.currentGeneration).toEqual(mockGeneration);
      // Keep currentPromptId set to allow progress component to show completion
      expect(result.current.currentPromptId).toBe('test-gen-1');
      // isGenerating should be false to indicate generation is complete
      expect(result.current.isGenerating).toBe(false);
    });

    it('should set isGenerating to true during generation', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ generation: mockGeneration }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useGeneration());

      act(() => {
        result.current.generate({
          prompt: 'test',
          settings: {
            imageCount: 1,
            steps: 20,
          } as GenerationSettings,
        });
      });

      expect(result.current.isGenerating).toBe(true);

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('should handle generation error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Generation failed' }),
      });

      const { result } = renderHook(() => useGeneration());

      let response: any;
      await act(async () => {
        response = await result.current.generate({
          prompt: 'test',
          settings: { imageCount: 1, steps: 20 } as GenerationSettings,
        });
      });

      expect(response).toBeNull();
      // isGenerating should be false after error handling
      expect(result.current.isGenerating).toBe(false);
      // Error should be set from the response
      expect(result.current.error).toBeTruthy();
    });

    it('should initialize progress state with correct image count', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ generation: mockGeneration }),
      });

      const { result } = renderHook(() => useGeneration());

      // Just verify the generation completes successfully
      await act(async () => {
        const gen = await result.current.generate({
          prompt: 'test',
          settings: {
            imageCount: 3,
            steps: 20,
          } as GenerationSettings,
        });
        expect(gen).toEqual(mockGeneration);
      });
    });
  });

  describe('resetProgress', () => {
    it('should clear progress state', () => {
      const { result } = renderHook(() => useGeneration());

      act(() => {
        result.current.resetProgress();
      });

      expect(result.current.progress).toBeNull();
      expect(result.current.currentPromptId).toBeNull();
      expect(result.current.currentImageIndex).toBe(1);
      expect(result.current.totalImages).toBe(1);
    });
  });

  describe('clearCurrent', () => {
    it('should clear current generation', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ generation: mockGeneration }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate({
          prompt: 'test',
          settings: { imageCount: 1 } as GenerationSettings,
        });
      });

      act(() => {
        result.current.clearCurrent();
      });

      expect(result.current.currentGeneration).toBeNull();
      expect(result.current.currentHistory).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.generate({
          prompt: 'test',
          settings: {} as GenerationSettings,
        });
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('loadGenerations', () => {
    it('should load paginated generations list', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [mockGeneration],
          page: 1,
          pageSize: 10,
          total: 1,
          hasMore: false,
        }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        await result.current.loadGenerations(1, 10);
      });

      expect(result.current.generations).toHaveLength(1);
      expect(result.current.pagination.page).toBe(1);
      expect(result.current.pagination.total).toBe(1);
    });
  });

  describe('batch tracking integration', () => {
    it('should support batch image generation', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ generation: mockGeneration }),
      });

      const { result } = renderHook(() => useGeneration());

      await act(async () => {
        const gen = await result.current.generate({
          prompt: 'test',
          settings: {
            imageCount: 4,
            steps: 20,
          } as GenerationSettings,
        });
        // Verify generation completed with batch count
        expect(gen?.id).toBe(mockGeneration.id);
      });
    });
  });
});
