/**
 * @fileoverview Generation Hook - Central State Management for Image Generation
 * 
 * This hook manages the complete lifecycle of image generation including:
 * - Submitting generation requests to the API
 * - Real-time progress tracking via Server-Sent Events (SSE)
 * - Generation history and pagination
 * - Image refinement workflow
 * - Error handling and recovery
 * 
 * ## State Machine
 * 
 * ```
 * Idle → Generating → Processing (SSE progress) → Complete/Error → Idle
 *                         ↓
 *                   Refining → Complete/Error → Idle
 * ```
 * 
 * ## SSE Progress Tracking
 * 
 * The hook establishes an EventSource connection to `/api/generate/progress`
 * which bridges WebSocket messages from ComfyUI to the client.
 * 
 * Event Types:
 * - `connected`: SSE stream established
 * - `progress`: Step progress update (step, totalSteps, percentage)
 * - `complete`: Generation finished successfully
 * - `error`: Generation failed
 * 
 * ## Key Features
 * 
 * - **Automatic Refetch**: Refreshes generation data when SSE reports completion
 * - **Sound Notification**: Plays success sound on completion
 * - **Stall Detection**: Marks progress as stalled on connection loss
 * - **Pagination**: Supports loading generation history with pagination
 * 
 * ## Usage Example
 * 
 * ```tsx
 * const {
 *   generate,
 *   currentGeneration,
 *   isGenerating,
 *   progress,
 *   error
 * } = useGeneration();
 * 
 * const handleGenerate = async () => {
 *   const result = await generate({
 *     prompt: assembledPrompt,
 *     settings: { resolution: "2K", aspectRatio: "1:1", imageCount: 2 },
 *     referenceImages: [{ avatarId: "123", type: "human" }]
 *   });
 *   if (result) {
 *     console.log("Generated:", result.images);
 *   }
 * };
 * ```
 * 
 * @module hooks/use-generation
 */

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
 * Play the success sound when generation completes
 * Audio file is located at /public/sounds/success.mp3
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

/**
 * Input for the generate function
 */
interface GenerateInput {
  /** The assembled prompt text */
  prompt: string;
  /** Generation settings (resolution, steps, etc.) */
  settings: GenerationSettings;
  /** Optional reference images for img2img workflows */
  referenceImages?: {
    /** Avatar ID for tracking */
    avatarId: string;
    /** Avatar type for workflow selection */
    type: AvatarType;
  }[];
}

/**
 * Input for the refine function
 */
interface RefineInput {
  /** Parent generation ID */
  generationId: string;
  /** Natural language refinement instruction */
  instruction: string;
  /** Optional specific image to refine */
  selectedImageId?: string;
}

/**
 * Progress state tracked during generation
 */
interface ProgressState {
  /** Current step number */
  step: number;
  /** Total steps in the diffusion process */
  totalSteps: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Human-readable status message */
  status?: string;
  /** Current image index for multi-image generations */
  currentImageIndex?: number;
  /** Total images being generated */
  totalImages?: number;
  /** Whether progress has stalled */
  isStalled?: boolean;
  /** Error message if progress failed */
  error?: string | null;
}

/**
 * Return type for the useGeneration hook
 */
interface UseGenerationReturn {
  // Current generation state
  /** The current active generation with images */
  currentGeneration: GenerationWithImages | null;
  /** Refinement history for current generation */
  currentHistory: GenerationHistoryEntry[];
  /** Whether a generation is in progress */
  isGenerating: boolean;
  /** Whether a refinement is in progress */
  isRefining: boolean;
  /** Current error message, if any */
  error: string | null;

  // Progress tracking
  /** Real-time progress state from SSE */
  progress: ProgressState | null;
  /** Current ComfyUI prompt ID */
  currentPromptId: string | null;
  /** Current image index (1-based) */
  currentImageIndex: number;
  /** Total images being generated */
  totalImages: number;

  // Generation list state
  /** List of past generations */
  generations: GenerationWithImages[];
  /** Whether generations list is loading */
  isLoadingList: boolean;
  /** Pagination state for generations list */
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };

  // Actions
  /** Submit a new generation request */
  generate: (input: GenerateInput) => Promise<GenerationWithImages | null>;
  /** Submit a refinement request */
  refine: (input: RefineInput) => Promise<GenerationWithImages | null>;
  /** Load a specific generation by ID */
  loadGeneration: (id: string) => Promise<void>;
  /** Load generations list with pagination */
  loadGenerations: (page?: number, pageSize?: number) => Promise<void>;
  /** Delete a generation */
  deleteGeneration: (id: string) => Promise<boolean>;
  /** Clear current generation state */
  clearCurrent: () => void;
  /** Clear error state */
  clearError: () => void;
  /** Reset progress tracking state */
  resetProgress: () => void;
  /** Mark generation as complete */
  completeGeneration: () => void;
}

export type { UseGenerationReturn };

/**
 * Generation state management hook
 * 
 * Manages the complete lifecycle of image generation including API calls,
 * SSE progress tracking, and state management. This is the primary hook
 * for coordinating generation operations across the application.
 * 
 * @returns Object containing state and actions for generation management
 */
export function useGeneration(): UseGenerationReturn {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Current generation state - tracks the active generation and its data
  const [currentGeneration, setCurrentGeneration] = useState<GenerationWithImages | null>(null);
  const [currentHistory, setCurrentHistory] = useState<GenerationHistoryEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Progress tracking state - updated in real-time via SSE from ComfyUI
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [totalImages, setTotalImages] = useState(1);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);

  // Generation list state - for history/gallery view with pagination
  const [generations, setGenerations] = useState<GenerationWithImages[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
  });

  // ============================================================================
  // SSE PROGRESS TRACKING
  // ============================================================================
  // 
  // This effect establishes a Server-Sent Events connection to track real-time
  // progress from ComfyUI. The flow is:
  // 
  // 1. Client generates → Server queues prompt on ComfyUI
  // 2. Client opens SSE → Server bridges WebSocket from ComfyUI
  // 3. ComfyUI sends progress → Server forwards to client via SSE
  // 4. Client updates progress UI in real-time
  // 
  // ============================================================================
  useEffect(() => {
    // Only connect when we have an active generation
    if (!currentPromptId || !isGenerating) {
      setIsGenerationComplete(false);
      return;
    }
    let eventSource: EventSource | null = null;
    let isMounted = true;

    // Create EventSource connection to SSE endpoint with generation context
    console.log('[useGeneration] Opening EventSource for generation:', currentPromptId);
    eventSource = new EventSource(`/api/generate/progress?promptId=${currentPromptId}&imageIndex=${currentImageIndex}&totalImages=${totalImages}`);

    /**
     * Handle incoming SSE messages
     * Message types: connected, progress, complete, error
     */
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
            // Connection established - initialize progress state
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
            // Diffusion step progress update
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
            // Generation finished successfully
            console.log('[useGeneration] Generation complete event received for generation:', currentPromptId);
            setIsGenerationComplete(true);
            playSuccessSound(); // Audio notification
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
            // Refetch the generation to get the updated images from the database
            if (currentGeneration?.id) {
              console.log('[useGeneration] Refetching generation:', currentGeneration.id);
              loadGeneration(currentGeneration.id).catch((err) => {
                console.error('[useGeneration] Failed to refetch generation:', err);
              });
            }
            break;
          case "error":
            // Generation failed - preserve progress state but mark as stalled
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
        // Ignore JSON parse errors from malformed SSE messages
      }
    };

    /**
     * Handle SSE connection errors
     * Mark progress as stalled so UI can show reconnection status
     */
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

    // Cleanup: close EventSource when dependencies change or component unmounts
    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, [currentPromptId, isGenerating, currentImageIndex, totalImages, isGenerationComplete]);

  // ============================================================================
  // ACTION FUNCTIONS
  // ============================================================================

  /**
   * Reset progress state to initial values
   * Call after generation completes or is cancelled
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
   * Sets isGenerating to false to hide the progress component
   */
  const completeGeneration = useCallback(() => {
    setIsGenerating(false);
  }, []);

  /**
   * Submit a new generation request to the API
   * 
   * Flow:
   * 1. Set generating state and initialize progress
   * 2. POST to /api/generate with prompt & settings
   * 3. Receive generation record (status: pending/processing)
   * 4. Set promptId to trigger SSE connection
   * 5. SSE tracks progress until completion
   * 
   * @param input - Generation parameters (prompt, settings, references)
   * @returns The created generation record, or null on error
   */
  const generate = useCallback(
    async (input: GenerateInput): Promise<GenerationWithImages | null> => {
      // Initialize generation state
      setIsGenerating(true);
      setError(null);
      const imageCount = input.settings.imageCount || 1;
      setTotalImages(imageCount);
      setCurrentImageIndex(1);
      
      // Set initial progress state for UI feedback
      setProgress({ 
        step: 0, 
        totalSteps: input.settings.steps || 20, 
        percentage: 0,
        currentImageIndex: 1,
        totalImages: imageCount,
      });

      try {
        // Submit generation request to API
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle API errors - may still have a generation record with failed status
          const errorMessage = data.error || "Failed to generate images";
          setError(errorMessage);
          setIsGenerating(false);
          if (data.generation) {
            setCurrentGeneration(data.generation);
            setCurrentPromptId(data.generation.id);
          }
          return null;
        }

        const generation = data.generation as GenerationWithImages;
        setCurrentGeneration(generation);
        
        // Set promptId to trigger SSE connection in useEffect
        setCurrentPromptId(generation.id);
        // Keep isGenerating=true - will be set false when SSE reports complete

        // Add/update in generations list for history view
        setGenerations((prev) => {
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
      }
    },
    [resetProgress]
  );

  /**
   * Refine an existing generation with natural language instructions
   * Uses AI to modify the prompt based on user feedback
   * 
   * @param input - Refinement parameters (generationId, instruction, selectedImageId)
   * @returns The updated generation record, or null on error
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

        // Update in the generations list
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
   * Load a specific generation by ID with its refinement history
   * 
   * @param id - Generation ID to load
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
   * Load paginated list of generations for history/gallery view
   * 
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of items per page
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
   * Delete a generation and all its associated images
   * 
   * @param id - Generation ID to delete
   * @returns true if deleted successfully, false on error
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

      // Remove from local state
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
   * Clear current generation state (deselect)
   */
  const clearCurrent = useCallback(() => {
    setCurrentGeneration(null);
    setCurrentHistory([]);
  }, []);

  /**
   * Clear error state
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
