/**
 * @fileoverview Image Comparison Slider Component
 * 
 * An interactive before/after comparison slider for comparing
 * original and upscaled images. Used by the Bulletproof Upscaler
 * workflow to visualize enhancement results.
 * 
 * ## Features
 * 
 * - Drag to reveal original vs upscaled
 * - Toggle between horizontal and vertical modes
 * - Keyboard accessible (arrow keys, Home/End, Space)
 * - Touch-friendly for mobile devices
 * - Focus state with visible ring
 * 
 * ## Keyboard Controls
 * 
 * | Key | Action |
 * |-----|--------|
 * | ← / ↑ | Move slider left/up (2% step) |
 * | → / ↓ | Move slider right/down (2% step) |
 * | Shift + Arrow | Larger step (10%) |
 * | Home | Move to 0% (show upscaled) |
 * | End | Move to 100% (show original) |
 * | Space | Reset to initial position |
 * 
 * ## Visual Layout
 * 
 * ```
 * Horizontal Mode:
 * ┌────────────────│────────────────┐
 * │    Original    │    Upscaled    │
 * │    (left)      │    (right)     │
 * └────────────────┴────────────────┘
 *                  ↑ drag handle
 * 
 * Vertical Mode:
 * ┌─────────────────────────────────┐
 * │          Original (top)          │
 * ├─────────────────────────────────┤ ← drag handle
 * │         Upscaled (bottom)        │
 * └─────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * <ImageComparisonSlider
 *   originalImageUrl="/uploads/original.png"
 *   upscaledImageUrl="/uploads/upscaled.png"
 *   onDownload={(url) => downloadImage(url)}
 *   initialPosition={50}
 * />
 * ```
 * 
 * @module components/generate/results/image-comparison-slider
 */

"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import Image from "next/image";
import { Download, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Props for the ImageComparisonSlider component
 */
interface ImageComparisonSliderProps {
  /** URL of the original (pre-upscale) image */
  originalImageUrl: string;
  /** URL of the upscaled image */
  upscaledImageUrl: string;
  /** Callback for download button click */
  onDownload?: (url: string) => void;
  /** Initial slider position (0-100, default: 50) */
  initialPosition?: number;
}

/**
 * Interactive before/after image comparison slider
 * 
 * Displays two images (original and upscaled) with a draggable
 * divider that reveals one or the other. Supports both horizontal
 * and vertical comparison modes with full keyboard accessibility.
 * 
 * @param props - Component props
 * @returns Comparison slider with controls
 */
export function ImageComparisonSlider({
  originalImageUrl,
  upscaledImageUrl,
  onDownload,
  initialPosition = 50,
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isVertical, setIsVertical] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSliderPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let position: number;

      if (isVertical) {
        position = ((clientY - rect.top) / rect.height) * 100;
      } else {
        position = ((clientX - rect.left) / rect.width) * 100;
      }

      setSliderPosition(Math.max(0, Math.min(100, position)));
    },
    [isVertical]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      updateSliderPosition(e.clientX, e.clientY);
    },
    [isDragging, updateSliderPosition]
  );

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (touch) {
          updateSliderPosition(touch.clientX, touch.clientY);
        }
      }
    },
    [updateSliderPosition]
  );

  const handleTouchStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 10 : 2;
      let newPosition = sliderPosition;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          newPosition = Math.max(0, sliderPosition - step);
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          newPosition = Math.min(100, sliderPosition + step);
          break;
        case "Home":
          e.preventDefault();
          newPosition = 0;
          break;
        case "End":
          e.preventDefault();
          newPosition = 100;
          break;
        case " ":
          e.preventDefault();
          newPosition = initialPosition;
          break;
        default:
          return;
      }

      setSliderPosition(newPosition);
    },
    [sliderPosition, initialPosition]
  );

  const toggleDirection = useCallback(() => {
    setIsVertical((prev) => !prev);
  }, []);

  return (
    <div className="space-y-4">
      {/* Direction Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDirection}
          className="gap-2"
        >
          {isVertical ? (
            <>
              <ArrowUpDown className="h-4 w-4" />
              Vertical
            </>
          ) : (
            <>
              <ArrowLeftRight className="h-4 w-4" />
              Horizontal
            </>
          )}
        </Button>
      </div>

      {/* Comparison Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-col-resize select-none",
          isVertical && "cursor-row-resize",
          isFocused && "ring-2 ring-primary ring-offset-2"
        )}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-orientation={isVertical ? "vertical" : "horizontal"}
        aria-label="Image comparison slider. Use arrow keys to adjust, Space to reset, Home/End for extremes."
      >
        {/* Upscaled Image (Background) */}
        <div className="absolute inset-0">
          <Image
            src={upscaledImageUrl}
            alt="Upscaled image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Original Image (Revealed by slider) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            isVertical
              ? { clipPath: `inset(0 0 ${100 - sliderPosition}% 0)` }
              : { clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }
          }
        >
          <Image
            src={originalImageUrl}
            alt="Original image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Slider Line */}
        <div
          className={cn(
            "absolute bg-white shadow-lg z-10",
            isVertical
              ? "left-0 right-0 h-1 -translate-y-1/2"
              : "top-0 bottom-0 w-1 -translate-x-1/2"
          )}
          style={
            isVertical
              ? { top: `${sliderPosition}%` }
              : { left: `${sliderPosition}%` }
          }
        >
          {/* Slider Handle */}
          <div
            className={cn(
              "absolute bg-white rounded-full shadow-lg border-2 border-primary flex items-center justify-center",
              isVertical
                ? "w-10 h-10 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : "w-10 h-10 top-1/2 -translate-x-1/2 -translate-y-1/2"
            )}
          >
            {isVertical ? (
              <ArrowUpDown className="h-5 w-5 text-primary" />
            ) : (
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            )}
          </div>
        </div>

        {/* Labels */}
        <div
          className={cn(
            "absolute text-white text-sm font-medium bg-black/50 px-2 py-1 rounded",
            isVertical ? "top-2 left-2" : "top-2 left-2"
          )}
        >
          Original
        </div>
        <div
          className={cn(
            "absolute text-white text-sm font-medium bg-black/50 px-2 py-1 rounded",
            isVertical ? "bottom-2 right-2" : "top-2 right-2"
          )}
        >
          Upscaled
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center">
        {isVertical
          ? "Drag vertically or use ↑↓ arrow keys to compare"
          : "Drag horizontally or use ←→ arrow keys to compare"}
        . Press Space to reset.
      </p>

      {/* Screen reader announcement for position changes */}
      <div className="sr-only" aria-live="polite">
        Slider at {Math.round(sliderPosition)} percent
      </div>

      {/* Download Button */}
      {onDownload && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => onDownload(upscaledImageUrl)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Upscaled Image
          </Button>
        </div>
      )}
    </div>
  );
}
