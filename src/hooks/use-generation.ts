"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  GenerationSettings,
  GenerationWithImages,
  GenerationHistoryEntry,
  PaginatedResponse,
  AvatarType,
} from "@/lib/types/generation";

/**
 * Play the success sound
 */
function playSuccessSound(): void {
  try {
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => {
      console.error("Failed to play success sound:", err);
    });
  } catch (err) {
    console.error("Error initializing audio:", err);
  }
}

interface GenerateInput {
  prompt: string;
  settings: GenerationSettings;
  referenceImages?: {
    avatarId: string;
    type: AvatarType;
  }[];
}

interface RefineInput {
  generationId: string;
  instruction: string;
  selectedImageId?: string;
}

interface ProgressState {
  step: number;
  totalSteps: number;
  percentage: number;
  status?: string;
  currentImageIndex?: number;
  totalImages?: number;
  isStalled?: boolean;
  error?: string | null;
}

interface UseGenerationReturn {
  // Current generation state
  currentGeneration: GenerationWithImages | null;
  currentHistory: GenerationHistoryEntry[];
  isGenerating: boolean;
  isRefining: boolean;
  error: string | null;

  // Progress tracking
  progress: ProgressState | null;
  currentPromptId: string | null;
  currentImageIndex: number;
  totalImages: number;

  // Generation list state
  generations: GenerationWithImages[];
  isLoadingList: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };

  // Actions
  generate: (input: GenerateInput) => Promise<GenerationWithImages | null>;
  refine: (input: RefineInput) => Promise<GenerationWithImages | null>;
  loadGeneration: (id: string) => Promise<void>;
  loadGenerations: (page?: number, pageSize?: number) => Promise<void>;
  deleteGeneration: (id: string) => Promise<boolean>;
  clearCurrent: () => void;
  clearError: () => void;
  resetProgress: () => void;
  completeGeneration: () => void;
}

export type { UseGenerationReturn };

export function useGeneration(): UseGenerationReturn {
  // Current generation state
  const [currentGeneration, setCurrentGeneration] = useState<GenerationWithImages | null>(null);
  const [currentHistory, setCurrentHistory] = useState<GenerationHistoryEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking state
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [totalImages, setTotalImages] = useState(1);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);

  // Generation list state
  const [generations, setGenerations] = useState<GenerationWithImages[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
  });

  // Listen for real progress events from backend SSE
  useEffect(() => {
    if (!currentPromptId || !isGenerating) {
      setIsGenerationComplete(false);
      return;
    }
    let eventSource: EventSource | null = null;
    let isMounted = true;

    console.log('[useGeneration] Opening EventSource for generation:', currentPromptId);
    eventSource = new EventSource(`/api/generate/progress?promptId=${currentPromptId}&imageIndex=${currentImageIndex}&totalImages=${totalImages}`);

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
        switch (data.type) {
          case "connected":
            // Only reset progress if generation is still in progress, not after completion
            if (!isGenerationComplete) {
              setProgress((prev) => ({
                ...prev,
                step: 0,
                totalSteps: data.totalSteps ?? prev?.totalSteps ?? 20,
                percentage: 0,
                status: data.status || "Connected to ComfyUI, waiting for progress...",
                currentImageIndex: data.imageIndex ?? currentImageIndex,
                totalImages: data.totalImages ?? totalImages,
                isStalled: false,
                error: null,
              }));
            }
            break;
          case "progress":
            setProgress((prev) => ({
              ...prev,
              step: data.currentStep ?? prev?.step ?? 0,
              totalSteps: data.totalSteps ?? prev?.totalSteps ?? 20,
              percentage: data.percentage ?? prev?.percentage ?? 0,
              status: data.status || prev?.status || "Generating...",
              currentImageIndex: data.imageIndex ?? currentImageIndex,
              totalImages: data.totalImages ?? totalImages,
              isStalled: false,
              error: null,
            }));
            break;
          case "complete":
            console.log('[useGeneration] Generation complete event received for generation:', currentPromptId);
            setIsGenerationComplete(true);
            playSuccessSound();
            setProgress((prev) => ({
              ...prev,
              step: data.currentStep ?? prev?.step ?? 0,
              totalSteps: data.totalSteps ?? prev?.totalSteps ?? 20,
              percentage: 100,
              status: data.status || "Complete",
              currentImageIndex: data.imageIndex ?? currentImageIndex,
              totalImages: data.totalImages ?? totalImages,
              isStalled: false,
              error: null,
            }));
            setIsGenerating(false);
            // Refetch the generation to get the updated images
            if (currentGeneration?.id) {
              console.log('[useGeneration] Refetching generation:', currentGeneration.id);
              loadGeneration(currentGeneration.id).catch((err) => {
                console.error('[useGeneration] Failed to refetch generation:', err);
              });
            }
            break;
          case "error":
            setProgress((prev) => ({
              step: prev?.step ?? 0,
              totalSteps: prev?.totalSteps ?? 20,
              percentage: prev?.percentage ?? 0,
              error: data.message || "Generation failed",
              status: data.status || "Error",
              isStalled: true,
              currentImageIndex: prev?.currentImageIndex ?? currentImageIndex,
              totalImages: prev?.totalImages ?? totalImages,
            }));
            setIsGenerating(false);
            break;
        }
      } catch (err) {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      if (isMounted) {
        setProgress((prev) => ({
          step: prev?.step ?? 0,
          totalSteps: prev?.totalSteps ?? 20,
          percentage: prev?.percentage ?? 0,
          error: "Lost connection to progress server.",
          status: "Connection lost",
          isStalled: true,
          currentImageIndex: prev?.currentImageIndex ?? currentImageIndex,
          totalImages: prev?.totalImages ?? totalImages,
        }));
      }
    };

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, [currentPromptId, isGenerating, currentImageIndex, totalImages, isGenerationComplete]);

  /**
   * Reset progress state
   */
  const resetProgress = useCallback(() => {
    setProgress(null);
    setCurrentPromptId(null);
    setCurrentImageIndex(1);
    setTotalImages(1);
    setIsGenerationComplete(false);
  }, []);

  /**
   * Complete generation - called when progress reaches 100% or error occurs
   * Sets isGenerating to false to hide progress component
   */
  const completeGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  /**
   * Generate new images
   */
  const generate = useCallback(
    async (input: GenerateInput): Promise<GenerationWithImages | null> => {
      setIsGenerating(true);
      setError(null);
      const imageCount = input.settings.imageCount || 1;
      setTotalImages(imageCount);
      setCurrentImageIndex(1);
      setProgress({ 
        step: 0, 
        totalSteps: input.settings.steps || 20, 
        percentage: 0,
        currentImageIndex: 1,
        totalImages: imageCount,
      });

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || "Failed to generate images";
          setError(errorMessage);
          setIsGenerating(false); // Mark generation as failed
          // Even on error, we may have a generation record with failed status
          if (data.generation) {
            setCurrentGeneration(data.generation);
            // Set promptId for potential progress tracking even on error
            setCurrentPromptId(data.generation.id);
          }
          return null;
        }

        const generation = data.generation as GenerationWithImages;
        setCurrentGeneration(generation);
        setCurrentPromptId(generation.id);
        // Keep isGenerating=true during progress tracking - it will be set to false when progress completes
        // This allows the progress component to track real-time updates from ComfyUI

        // Add to the list if we have a list loaded
        setGenerations((prev) => {
          // Check if already in list
          const exists = prev.some((g) => g.id === generation.id);
          if (exists) {
            return prev.map((g) => (g.id === generation.id ? generation : g));
          }
          return [generation, ...prev];
        });

        return generation;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to generate images";
        setError(message);
        setIsGenerating(false);
        resetProgress();
        return null;
      } finally {
        // Keep isGenerating and progress visible after completion
      }
    },
    [resetProgress]
  );

  /**
   * Refine an existing generation
   */
  const refine = useCallback(
    async (input: RefineInput): Promise<GenerationWithImages | null> => {
      setIsRefining(true);
      setError(null);

      try {
        const response = await fetch(`/api/generate/${input.generationId}/refine`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instruction: input.instruction,
            selectedImageId: input.selectedImageId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || "Failed to refine generation";
          setError(errorMessage);
          return null;
        }

        const generation = data.generation as GenerationWithImages;
        const history = data.history as GenerationHistoryEntry[];

        setCurrentGeneration(generation);
        setCurrentHistory(history);

        // Update in the list
        setGenerations((prev) =>
          prev.map((g) => (g.id === generation.id ? generation : g))
        );

        return generation;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to refine generation";
        setError(message);
        return null;
      } finally {
        setIsRefining(false);
      }
    },
    []
  );

  /**
   * Load a specific generation with its history
   */
  const loadGeneration = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      const response = await fetch(`/api/generations/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load generation");
      }

      setCurrentGeneration(data.generation as GenerationWithImages);
      setCurrentHistory(data.history as GenerationHistoryEntry[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load generation";
      setError(message);
    }
  }, []);

  /**
   * Load list of generations with pagination
   */
  const loadGenerations = useCallback(
    async (page: number = 1, pageSize: number = 10): Promise<void> => {
      setIsLoadingList(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/generations?page=${page}&pageSize=${pageSize}`
        );
        const data = (await response.json()) as PaginatedResponse<GenerationWithImages>;

        if (!response.ok) {
          throw new Error("Failed to load generations");
        }

        setGenerations(data.items);
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          hasMore: data.hasMore,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load generations";
        setError(message);
      } finally {
        setIsLoadingList(false);
      }
    },
    []
  );

  /**
   * Delete a generation
   */
  const deleteGeneration = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/generations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete generation");
      }

      // Remove from list
      setGenerations((prev) => prev.filter((g) => g.id !== id));

      // Clear current if it was the deleted one
      setCurrentGeneration((prev) => (prev?.id === id ? null : prev));
      if (currentGeneration?.id === id) {
        setCurrentHistory([]);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete generation";
      setError(message);
      return false;
    }
  }, [currentGeneration?.id]);

  /**
   * Clear current generation
   */
  const clearCurrent = useCallback(() => {
    setCurrentGeneration(null);
    setCurrentHistory([]);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentGeneration,
    currentHistory,
    isGenerating,
    isRefining,
    error,
    progress,
    currentPromptId,
    currentImageIndex,
    totalImages,
    generations,
    isLoadingList,
    pagination,
    generate,
    refine,
    loadGeneration,
    loadGenerations,
    deleteGeneration,
    clearCurrent,
    clearError,
    resetProgress,
    completeGeneration,
  };
}
