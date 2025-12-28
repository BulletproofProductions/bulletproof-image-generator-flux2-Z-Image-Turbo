"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

interface GenerationProgressProps {
  progress: ProgressState | null;
  isGenerating: boolean;
}

// Helper function to get progress type badge
function getProgressTypeBadge(percentage: number): { icon: string; label: string; color: string } {
  if (percentage === 0) {
    return { icon: '🔗', label: 'Connected', color: 'bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700' };
  } else if (percentage === 100) {
    return { icon: '✅', label: 'Complete', color: 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700' };
  } else {
    return { icon: '⚙️', label: 'Inferencing', color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700' };
  }
}

export function GenerationProgress({
  progress,
  isGenerating,
}: GenerationProgressProps) {
  // This is now a pure display component that only renders progress from parent hook
  // The parent hook (use-generation.ts) manages the single EventSource connection
  
  if (!isGenerating || !progress) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">{progress.status || "Generating..."}</span>
        </div>
        {(() => {
          const badge = getProgressTypeBadge(progress.percentage);
          return (
            <div className={`text-xs px-2 py-1 rounded border font-medium ${badge.color}`}>
              {badge.icon} {badge.label}
            </div>
          );
        })()}
      </div>

      <Progress value={progress.percentage} className="h-2" />

      <div className="flex flex-col gap-3 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <span>
            Image {progress.currentImageIndex ?? 1} of {progress.totalImages ?? 1}
          </span>
          <span className="text-lg font-bold text-foreground">{progress.percentage}%</span>
        </div>

        {/* Main step progress */}
        <div className="flex justify-between px-2 py-1.5 bg-primary/10 rounded border border-primary/30">
          <span className="font-medium">Steps</span>
          <span className="font-semibold">
            {progress.step}/{progress.totalSteps}
          </span>
        </div>
      </div>

      {progress.isStalled && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-700 dark:text-yellow-200">
            Generation appears stalled. Ensure ComfyUI is running and check server logs.
          </p>
        </div>
      )}

      {progress.error && (
        <p className="text-xs text-destructive mt-2">{progress.error}</p>
      )}
    </div>
  );
}
