/**
 * @fileoverview Generation Progress Display Component
 * 
 * This component renders real-time progress information during image generation.
 * It receives progress state from the parent hook (useGeneration) and displays:
 * 
 * - Overall percentage with progress bar
 * - Current image index (for multi-image generations)
 * - Step count (e.g., "15/25 steps")
 * - Status badges (Connected → Inferencing → Complete)
 * - Stalled warning when progress stops
 * 
 * ## Progress Badge States
 * 
 * | State | Icon | Color | Meaning |
 * |-------|------|-------|---------|
 * | Connected | 🔗 | Blue | SSE stream established |
 * | Inferencing | ⚙️ | Purple | Actively processing |
 * | Complete | ✅ | Green | Generation finished |
 * 
 * ## Component Architecture
 * 
 * This is a **pure display component** - it does not manage its own SSE
 * connection. The parent `useGeneration` hook handles the single EventSource
 * connection and passes progress state down as props.
 * 
 * ```
 * useGeneration (manages SSE)
 *       ↓ progress state
 * GenerationProgress (displays)
 * ```
 * 
 * @example
 * ```tsx
 * const { progress, isGenerating } = useGeneration();
 * 
 * <GenerationProgress
 *   progress={progress}
 *   isGenerating={isGenerating}
 * />
 * ```
 * 
 * @module components/generate/generation-progress
 */

"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Progress state from the generation hook
 */
interface ProgressState {
  /** Current step number in the diffusion process */
  step: number;
  /** Total number of steps for this generation */
  totalSteps: number;
  /** Calculated percentage (0-100) */
  percentage: number;
  /** Human-readable status message */
  status?: string;
  /** Current image index (1-based) for multi-image generations */
  currentImageIndex?: number;
  /** Total number of images being generated */
  totalImages?: number;
  /** Whether progress has stalled (no updates for extended time) */
  isStalled?: boolean;
  /** Error message if progress tracking failed */
  error?: string | null;
}

/**
 * Props for the GenerationProgress component
 */
interface GenerationProgressProps {
  /** Current progress state from useGeneration hook */
  progress: ProgressState | null;
  /** Whether a generation is currently in progress */
  isGenerating: boolean;
}

/**
 * Returns the appropriate badge styling based on progress percentage
 * 
 * Badge progression:
 * - 0%: "Connected" (blue) - SSE stream established, waiting for execution
 * - 1-99%: "Inferencing" (purple) - Actively running diffusion steps
 * - 100%: "Complete" (green) - Generation finished successfully
 * 
 * @param percentage - Current progress percentage (0-100)
 * @returns Badge configuration with icon, label, and CSS classes
 */
function getProgressTypeBadge(percentage: number): { icon: string; label: string; color: string } {
  if (percentage === 0) {
    return { icon: '🔗', label: 'Connected', color: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' };
  } else if (percentage === 100) {
    return { icon: '✅', label: 'Complete', color: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700' };
  } else {
    return { icon: '⚙️', label: 'Inferencing', color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' };
  }
}

/**
 * Displays real-time progress information during image generation
 * 
 * This component is a pure display component that renders progress state
 * provided by the parent hook. It does not manage SSE connections.
 * 
 * Features:
 * - Animated progress bar with percentage
 * - Multi-image progress (Image 1 of 4)
 * - Step counter (15/25 steps)
 * - Status badges showing current phase
 * - Stalled warning with troubleshooting advice
 * - Error display for progress tracking failures
 * 
 * @param props - Component props
 * @param props.progress - Current progress state (null when not generating)
 * @param props.isGenerating - Whether generation is active
 * 
 * @returns Progress display or null if not generating
 */
export function GenerationProgress({
  progress,
  isGenerating,
}: GenerationProgressProps) {
  // This is a pure display component that only renders progress from parent hook
  // The parent hook (use-generation.ts) manages the single EventSource connection
  
  // Don't render if not generating or no progress data
  if (!isGenerating || !progress) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      {/* Header row: Status message + Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">{progress.status || "Generating..."}</span>
        </div>
        {/* Dynamic badge based on progress percentage */}
        {(() => {
          const badge = getProgressTypeBadge(progress.percentage);
          return (
            <div className={`text-xs px-2 py-1 rounded border font-medium ${badge.color}`}>
              {badge.icon} {badge.label}
            </div>
          );
        })()}
      </div>

      {/* Progress bar - shadcn/ui Progress component */}
      <Progress value={progress.percentage} className="h-2" />

      {/* Progress details section */}
      <div className="flex flex-col gap-3 text-xs text-muted-foreground">
        {/* Image count and percentage */}
        <div className="flex justify-between items-center">
          <span>
            Image {progress.currentImageIndex ?? 1} of {progress.totalImages ?? 1}
          </span>
          <span className="text-lg font-bold text-foreground">{progress.percentage}%</span>
        </div>

        {/* Step progress - highlighted box showing current/total steps */}
        <div className="flex justify-between px-2 py-1.5 bg-primary/10 rounded border border-primary/30">
          <span className="font-medium">Steps</span>
          <span className="font-semibold">
            {progress.step}/{progress.totalSteps}
          </span>
        </div>
      </div>

      {/* Stalled warning - shown when no progress updates for extended time */}
      {progress.isStalled && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-700 dark:text-yellow-200">
            Generation appears stalled. Ensure ComfyUI is running and check server logs.
          </p>
        </div>
      )}

      {/* Error message from progress tracking */}
      {progress.error && (
        <p className="text-xs text-destructive mt-2">{progress.error}</p>
      )}
    </div>
  );
}

