/**
 * @fileoverview Preview Panel Component - Generation Settings & Controls
 * 
 * The Preview Panel is the center column of the generation interface, responsible for:
 * - Displaying the assembled prompt preview
 * - Workflow selection (Flux2, Z-Image Turbo, Background, Upscaler)
 * - Generation settings (resolution, steps, guidance, etc.)
 * - Preset save/load functionality
 * - Progress display during generation
 * - Generate button with validation
 * 
 * ## Workflow-Specific Settings
 * 
 * | Setting | Flux2 | Z-Image | Background | Upscaler |
 * |---------|-------|---------|------------|----------|
 * | Image Count | ✓ | ✓ | ✓ | ✗ |
 * | Resolution | ✓ | ✗ | ✗ | ✓ (max) |
 * | Aspect Ratio | ✓ | ✗ | ✗ | ✗ |
 * | Steps | ✓ | ✓ | ✓ | ✗ |
 * | Guidance | ✓ | ✓ | ✓ | ✗ |
 * | Denoise | ✗ | ✓ | ✓ | ✗ |
 * | Detection | ✗ | ✗ | ✓ | ✗ |
 * | VRAM Preset | ✗ | ✗ | ✗ | ✓ |
 * | Seed | ✓ | ✓ | ✓ | ✗ |
 * 
 * ## Input Requirements
 * 
 * - **Flux2**: Prompt only (reference images optional)
 * - **Z-Image Turbo**: Prompt + Reference image required
 * - **Background**: Prompt + Reference image required
 * - **Upscaler**: Reference image only (no prompt)
 * 
 * @example
 * ```tsx
 * <PreviewPanel
 *   assembledPrompt={assembledPrompt}
 *   settings={settings}
 *   onSettingsChange={handleSettingsChange}
 *   onWorkflowChange={handleWorkflowChange}
 *   onGenerate={handleGenerate}
 *   isGenerating={isGenerating}
 *   hasReferenceImage={hasAvatarSelected}
 *   progress={progress}
 *   // ... preset props
 * />
 * ```
 * 
 * @module components/generate/preview/preview-panel
 */

"use client";

import { Wand2, Shuffle } from "lucide-react";
import { GenerationProgress } from "@/components/generate/generation-progress";
import { LoadPresetDropdown } from "@/components/presets/load-preset-dropdown";
import { SavePresetModal } from "@/components/presets/save-preset-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import type { GenerationSettings, Preset, PresetConfig, WorkflowType } from "@/lib/types/generation";

/**
 * Progress state from the generation hook (duplicated for type safety)
 */
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

/**
 * Props for the PreviewPanel component
 */
interface PreviewPanelProps {
  /** The assembled prompt text to display */
  assembledPrompt: string;
  /** Current generation settings */
  settings: GenerationSettings;
  /** Callback when settings change (partial updates supported) */
  onSettingsChange: (settings: Partial<GenerationSettings>) => void;
  /** Callback when workflow type changes */
  onWorkflowChange: (workflow: WorkflowType) => void;
  /** Callback to trigger generation */
  onGenerate: () => void;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Whether any subject has an avatar selected (needed for img2img workflows) */
  hasReferenceImage: boolean;
  // Progress tracking
  /** Current ComfyUI prompt ID for progress tracking */
  currentPromptId: string | null;
  /** Current image index in multi-image generation */
  currentImageIndex: number;
  /** Total images being generated */
  totalImages: number;
  /** Progress state from SSE stream */
  progress: ProgressState | null;
  /** Callback when progress completes */
  onProgressComplete?: () => void;
  /** Callback when progress encounters an error */
  onProgressError?: (error: string) => void;
  // Preset props
  /** Current preset configuration for saving */
  currentConfig: PresetConfig;
  /** Available presets list */
  presets: Preset[];
  /** Whether presets are loading */
  presetsLoading: boolean;
  /** Callback to save a new preset */
  onSavePreset: (name: string, config: PresetConfig) => Promise<boolean>;
  /** Callback to load a preset */
  onLoadPreset: (preset: Preset) => void;
  /** Callback to delete a preset */
  onDeletePreset: (id: string) => Promise<boolean>;
}

/**
 * Preview Panel - Central generation controls and settings
 * 
 * This component manages the generation workflow including:
 * 1. Prompt preview display
 * 2. Preset save/load controls
 * 3. Workflow selection with conditional settings
 * 4. Generation settings (resolution, steps, guidance, etc.)
 * 5. Progress display during generation
 * 6. Generate button with input validation
 * 
 * The component conditionally renders settings based on the selected workflow,
 * as different workflows have different requirements and capabilities.
 * 
 * @param props - Component props (see PreviewPanelProps)
 * @returns The preview panel component
 */
export function PreviewPanel({
  assembledPrompt,
  settings,
  onSettingsChange,
  onWorkflowChange,
  onGenerate,
  isGenerating,
  hasReferenceImage,
  progress,
  currentConfig,
  presets,
  presetsLoading,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: PreviewPanelProps) {
  // Extract workflow type for conditional rendering
  const workflow = settings.workflow || "flux2";
  const isZImageTurbo = workflow === "z-image-turbo";
  const isBulletproofBackground = workflow === "bulletproof-background";
  const isBulletproofUpscaler = workflow === "bulletproof-upscaler";
  const requiresInputImage = isZImageTurbo || isBulletproofBackground || isBulletproofUpscaler;
  
  // Validation: Disable generate when:
  // - Already generating
  // - No prompt (except for upscaler which doesn't need one)
  // - Requires input image but none provided
  const isGenerateDisabled = isGenerating || (!isBulletproofUpscaler && !assembledPrompt) || (requiresInputImage && !hasReferenceImage);
  
  /**
   * Generates a random seed value for reproducibility control
   */
  const handleRandomizeSeed = () => {
    onSettingsChange({ seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) });
  };

  /**
   * Handles seed input changes with validation
   * - Empty string clears the seed (random)
   * - Only accepts non-negative integers
   */
  const handleSeedChange = (value: string) => {
    if (value === "") {
      onSettingsChange({ seed: undefined });
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onSettingsChange({ seed: numValue });
      }
    }
  };
  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-lg">Preview & Generate</h2>
            <p className="text-sm text-muted-foreground">
              Review your prompt and generate images
            </p>
          </div>
        </div>
        {/* Preset Actions - Save/Load/Delete */}
        <div className="flex items-center gap-2 mt-3">
          <LoadPresetDropdown
            presets={presets}
            onLoad={onLoadPreset}
            onDelete={onDeletePreset}
            isLoading={presetsLoading}
            disabled={isGenerating}
          />
          <SavePresetModal
            config={currentConfig}
            onSave={onSavePreset}
            disabled={isGenerating || !assembledPrompt}
          />
        </div>
      </div>

      {/* Scrollable Settings Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Prompt Preview Section
              Shows the assembled prompt or placeholder for upscaler workflow */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Generated Prompt</Label>
            <div className={`p-4 bg-muted/50 rounded-lg min-h-[100px] ${isBulletproofUpscaler ? 'opacity-60' : ''}`}>
              {isBulletproofUpscaler ? (
                <p className="text-sm font-medium text-muted-foreground">UPSCALE</p>
              ) : assembledPrompt ? (
                <p className="text-sm whitespace-pre-wrap">{assembledPrompt}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Your prompt will appear here as you build it...
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Generation Settings Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Generation Settings
            </h3>

            {/* Workflow Selector
                Controls which workflow is used and affects which settings are shown */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Workflow</Label>
              <Select
                value={workflow}
                onValueChange={(value) => onWorkflowChange(value as WorkflowType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flux2">Flux 2 (Text-to-Image)</SelectItem>
                  <SelectItem value="z-image-turbo">Z Image Turbo (Image-to-Image)</SelectItem>
                  <SelectItem value="bulletproof-background">Bulletproof Background (Inpainting)</SelectItem>
                  <SelectItem value="bulletproof-upscaler">Bulletproof Upscaler (4X)</SelectItem>
                </SelectContent>
              </Select>
              {/* Input image warnings for workflows that require them */}
              {isZImageTurbo && !hasReferenceImage && (
                <p className="text-xs text-destructive">
                  ⚠️ Input image required for Z Image Turbo
                </p>
              )}
              {isBulletproofBackground && !hasReferenceImage && (
                <p className="text-xs text-destructive">
                  ⚠️ Input image required for Bulletproof Background
                </p>
              )}
              {isBulletproofUpscaler && !hasReferenceImage && (
                <p className="text-xs text-destructive">
                  ⚠️ Input image required for Bulletproof Upscaler
                </p>
              )}
            </div>

            {/* Number of Images - Not for upscaler (only upscales 1 at a time) */}
            {!isBulletproofUpscaler && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Number of Images</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 3, 4] as const).map((num) => (
                    <Button
                      key={num}
                      variant={settings.imageCount === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSettingsChange({ imageCount: num })}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution - For Flux 2 and Bulletproof Upscaler (max output size) */}
            {!isZImageTurbo && !isBulletproofBackground && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isBulletproofUpscaler ? "Max Output Size" : "Resolution"}
                </Label>
                <Select
                  value={settings.resolution}
                  onValueChange={(value) =>
                    onSettingsChange({ resolution: value as GenerationSettings["resolution"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1K">1K (1024px)</SelectItem>
                    <SelectItem value="2K">2K (2048px)</SelectItem>
                    <SelectItem value="4K">4K (4096px)</SelectItem>
                  </SelectContent>
                </Select>
                {isBulletproofUpscaler && (
                  <p className="text-xs text-muted-foreground">
                    Output is input × 4, capped at this size
                  </p>
                )}
              </div>
            )}

            {/* VRAM Preset - Only for Bulletproof Upscaler */}
            {isBulletproofUpscaler && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">VRAM Preset</Label>
                <Select
                  value={settings.vramPreset || "standard"}
                  onValueChange={(value) =>
                    onSettingsChange({ vramPreset: value as "low" | "standard" | "high" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select VRAM preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low VRAM (8GB)</SelectItem>
                    <SelectItem value="standard">Standard (12-16GB)</SelectItem>
                    <SelectItem value="high">High VRAM (24GB+)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Lower = less VRAM usage, slower processing
                </p>
              </div>
            )}

            {/* Aspect Ratio - Only for Flux 2 */}
            {!isZImageTurbo && !isBulletproofBackground && !isBulletproofUpscaler && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Aspect Ratio</Label>
                <Select
                  value={settings.aspectRatio}
                  onValueChange={(value) =>
                    onSettingsChange({ aspectRatio: value as GenerationSettings["aspectRatio"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                    <SelectItem value="3:4">3:4 (Portrait Standard)</SelectItem>
                    <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* AI Image Generation Settings - Not shown for Bulletproof Upscaler */}
            {!isBulletproofUpscaler && (
              <>
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  AI Image Generation Settings
                </h3>

                {/* Steps */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium">Steps</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.steps || (isZImageTurbo || isBulletproofBackground ? 9 : 20)}
                    </span>
                  </div>
                  <Slider
                    value={[settings.steps || (isZImageTurbo || isBulletproofBackground ? 9 : 20)]}
                    onValueChange={(value) => onSettingsChange({ steps: value[0] })}
                    min={1}
                    max={isZImageTurbo || isBulletproofBackground ? 20 : 50}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    More steps = better quality but slower
                  </p>
                </div>

                {/* Guidance/CFG */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm font-medium">
                      {isZImageTurbo || isBulletproofBackground ? "CFG" : "Guidance"}
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.guidance || (isZImageTurbo || isBulletproofBackground ? 1 : 4)}
                    </span>
                  </div>
                  <Slider
                    value={[settings.guidance || (isZImageTurbo || isBulletproofBackground ? 1 : 4)]}
                    onValueChange={(value) => onSettingsChange({ guidance: value[0] })}
                    min={1}
                    max={isZImageTurbo || isBulletproofBackground ? 5 : 10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher = follows prompt more closely
                  </p>
                </div>

                {/* Denoise - For Z Image Turbo and Bulletproof Background */}
                {(isZImageTurbo || isBulletproofBackground) && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Denoise Strength</Label>
                      <span className="text-sm text-muted-foreground">
                        {settings.denoise ?? (isBulletproofBackground ? 0.9 : 0.4)}
                      </span>
                    </div>
                    <Slider
                      value={[settings.denoise ?? (isBulletproofBackground ? 0.9 : 0.4)]}
                      onValueChange={(value) => onSettingsChange({ denoise: value[0] })}
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isBulletproofBackground 
                        ? "Higher = more background transformation" 
                        : "Higher = more transformation from original"}
                    </p>
                  </div>
                )}

                {/* Detection Confidence - Only for Bulletproof Background */}
                {isBulletproofBackground && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium">Detection Confidence</Label>
                      <span className="text-sm text-muted-foreground">
                        {settings.detectionConfidence ?? 0.2}
                      </span>
                    </div>
                    <Slider
                      value={[settings.detectionConfidence ?? 0.2]}
                      onValueChange={(value) => onSettingsChange({ detectionConfidence: value[0] })}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = detect subjects more easily
                    </p>
                  </div>
                )}

                {/* Subject to Detect - Only for Bulletproof Background */}
                {isBulletproofBackground && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subject to Detect</Label>
                    <Input
                      type="text"
                      placeholder="person"
                      value={settings.subjectToDetect ?? "person"}
                      onChange={(e) => onSettingsChange({ subjectToDetect: e.target.value })}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      What to preserve (e.g., &quot;person&quot;, &quot;cat&quot;, &quot;car&quot;)
                    </p>
                  </div>
                )}

                {/* Seed */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Seed</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Random"
                      value={settings.seed ?? ""}
                      onChange={(e) => handleSeedChange(e.target.value)}
                      className="flex-1"
                      min={0}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRandomizeSeed}
                      title="Randomize seed"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Same seed = reproducible results
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Generate Button and Progress */}
      <div className="p-4 border-t space-y-4">
        {isGenerating && progress && (
          <GenerationProgress
            progress={progress}
            isGenerating={isGenerating}
          />
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={onGenerate}
          disabled={isGenerateDisabled}
          title={requiresInputImage && !hasReferenceImage 
            ? `Input image required for ${isBulletproofUpscaler ? "Bulletproof Upscaler" : isBulletproofBackground ? "Bulletproof Background" : "Z Image Turbo"}` 
            : undefined}
        >
          <Wand2 className="h-5 w-5 mr-2" />
          {isGenerating ? (isBulletproofUpscaler ? "Upscaling..." : "Generating...") : (isBulletproofUpscaler ? "Upscale Image" : "Generate Images")}
        </Button>
      </div>
    </div>
  );
}
