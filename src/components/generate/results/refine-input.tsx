/**
 * @fileoverview Refine Input Component for Image Iteration
 * 
 * Text input component for submitting refinement instructions to
 * iterate on generated images. Provides quick-select suggestions
 * for common refinement operations.
 * 
 * ## Features
 * 
 * - Textarea for natural language instructions
 * - Quick suggestion buttons for common refinements
 * - Submit button with loading state
 * - Clears input after successful submission
 * 
 * ## Refinement Workflow
 * 
 * ```
 * 1. User types refinement instruction (or clicks suggestion)
 * 2. User clicks "Refine Image" button
 * 3. onRefine callback is called with instruction
 * 4. Component shows loading state during refinement
 * 5. Input is cleared on successful completion
 * ```
 * 
 * ## Default Suggestions
 * 
 * - Make the lighting more dramatic
 * - Add more vibrant colors
 * - Make the background more detailed
 * - Change the expression to be happier
 * - Add more depth and shadows
 * - Make the composition more dynamic
 * - Increase the contrast
 * - Add a warm color tone
 * 
 * @example
 * ```tsx
 * <RefineInput
 *   onRefine={async (instruction) => {
 *     await refineImage(generationId, instruction);
 *   }}
 *   isRefining={isRefiningState}
 *   disabled={isGenerating}
 * />
 * ```
 * 
 * @module components/generate/results/refine-input
 */

"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props for the RefineInput component
 */
interface RefineInputProps {
  /** Callback when refinement is submitted */
  onRefine: (instruction: string) => Promise<void>;
  /** Whether refinement is currently in progress */
  isRefining: boolean;
  /** Whether input is disabled (e.g., during generation) */
  disabled?: boolean;
}

/**
 * Common refinement suggestions for quick selection
 */
const REFINEMENT_SUGGESTIONS = [
  "Make the lighting more dramatic",
  "Add more vibrant colors",
  "Make the background more detailed",
  "Change the expression to be happier",
  "Add more depth and shadows",
  "Make the composition more dynamic",
  "Increase the contrast",
  "Add a warm color tone",
];

/**
 * Refinement input with suggestions and submit button
 * 
 * Provides a textarea for entering refinement instructions with
 * quick-select suggestion buttons. Handles form submission and
 * displays loading state during refinement.
 * 
 * @param props - Component props
 * @returns Refinement input form
 */
export function RefineInput({ onRefine, isRefining, disabled = false }: RefineInputProps) {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRefining || disabled) return;

    await onRefine(instruction.trim());
    setInstruction("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInstruction(suggestion);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="refine-instruction" className="text-sm font-medium">
          Refine Your Image
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Describe how you would like to modify the generated image
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          id="refine-instruction"
          placeholder="e.g., Make the lighting more dramatic and add a sunset glow..."
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          disabled={isRefining || disabled}
          className="min-h-20 resize-none"
        />

        <div className="flex flex-wrap gap-2">
          {REFINEMENT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isRefining || disabled}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <Button
          type="submit"
          disabled={!instruction.trim() || isRefining || disabled}
          className="w-full"
        >
          {isRefining ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refining...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Refine Image
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
