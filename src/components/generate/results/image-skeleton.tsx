/**
 * @fileoverview Image Skeleton Components for Loading States
 * 
 * Skeleton placeholder components shown while images are being generated.
 * Provides visual feedback that generation is in progress.
 * 
 * ## Components
 * 
 * - `ImageSkeleton`: Single or multiple skeleton placeholders
 * - `ImageSkeletonGrid`: Pre-configured 2-column grid of skeletons
 * 
 * ## Features
 * 
 * - Animated skeleton background (shimmer effect)
 * - Optional spinner on first skeleton
 * - Maintains aspect ratio (square)
 * - Configurable count
 * 
 * @example
 * ```tsx
 * // Single skeleton with spinner
 * <ImageSkeleton count={1} showSpinner={true} />
 * 
 * // Grid of 4 skeletons
 * <ImageSkeletonGrid count={4} />
 * 
 * // Multiple skeletons without spinner
 * <ImageSkeleton count={3} showSpinner={false} />
 * ```
 * 
 * @module components/generate/results/image-skeleton
 */

"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Props for the ImageSkeleton component
 */
interface ImageSkeletonProps {
  /** Number of skeleton placeholders to render (default: 1) */
  count?: number;
  /** Whether to show a spinner on the first skeleton (default: true) */
  showSpinner?: boolean;
}

/**
 * Image skeleton placeholder with optional spinner
 * 
 * Renders one or more square skeleton placeholders with an animated
 * shimmer effect. The first skeleton can optionally show a spinner
 * and "Generating..." text.
 * 
 * @param props - Component props
 * @returns Skeleton placeholder(s)
 */
export function ImageSkeleton({ count = 1, showSpinner = true }: ImageSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square relative rounded-lg overflow-hidden">
          <Skeleton className="w-full h-full" />
          {showSpinner && i === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Generating...</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

interface ImageSkeletonGridProps {
  count?: number;
}

export function ImageSkeletonGrid({ count = 4 }: ImageSkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ImageSkeleton count={count} />
    </div>
  );
}
