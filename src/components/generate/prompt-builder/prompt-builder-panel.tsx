/**
 * @fileoverview Prompt Builder Panel - Template Selection & Subject Management
 * 
 * The Prompt Builder Panel is the left column of the generation interface,
 * providing a structured way to build image prompts through:
 * 
 * - **Scene Settings**: Style, location, lighting, camera angle
 * - **Photography Settings**: Camera model, lens, mood, color palette (FLUX.2)
 * - **Subject Management**: Add/configure subjects with avatars
 * - **Custom Instructions**: Additional prompt text
 * 
 * ## Template Categories
 * 
 * | Category | Count | Example |
 * |----------|-------|---------|
 * | Style | 62 | "cinematic film still", "oil painting" |
 * | Location | 74 | "modern coffee shop", "tropical beach" |
 * | Lighting | 38 | "golden hour sunlight", "neon lights" |
 * | Camera | 46 | "close-up shot", "bird's eye view" |
 * | Camera Model | 24 | "Canon EOS R5", "Hasselblad" |
 * | Lens | 27 | "85mm f/1.4", "35mm wide angle" |
 * | Mood | 28 | "ethereal", "dramatic" |
 * | Color Palette | 26 | "warm autumn tones", "cyberpunk neons" |
 * 
 * ## Workflow Variations
 * 
 * - **Flux2 / Z-Image / Background**: Full prompt builder with all sections
 * - **Upscaler**: Simplified view showing only subject selection
 * 
 * @example
 * ```tsx
 * <PromptBuilderPanel
 *   workflow="flux2"
 *   location={state.location}
 *   lighting={state.lighting}
 *   // ... other state props
 *   onLocationChange={(v) => setState({ ...state, location: v })}
 *   // ... other change handlers
 *   subjects={subjects}
 *   onAddSubject={handleAddSubject}
 *   onRemoveSubject={handleRemoveSubject}
 *   onUpdateSubject={handleUpdateSubject}
 *   onLinkAvatarToSubject={handleLinkAvatar}
 * />
 * ```
 * 
 * @module components/generate/prompt-builder/prompt-builder-panel
 */

"use client";

import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  lightingTemplates,
  cameraTemplates,
  styleTemplates,
  locationTemplates,
  moodTemplates,
  cameraModelTemplates,
  lensTemplates,
  colorPaletteTemplates,
} from "@/lib/data/templates";
import type { SubjectConfig, Avatar, WorkflowType } from "@/lib/types/generation";
import { SubjectManager } from "./subject-manager";
import { TemplateSelector } from "./template-selector";

/**
 * Props for the PromptBuilderPanel component
 */
interface PromptBuilderPanelProps {
  /** Current workflow type (affects which sections are shown) */
  workflow?: WorkflowType | undefined;
  // Scene settings - template selections
  /** Selected location template text */
  location: string;
  /** Selected lighting template text */
  lighting: string;
  /** Selected camera/composition template text */
  camera: string;
  /** Selected style template text */
  style: string;
  /** Custom additional instructions */
  customPrompt: string;
  // FLUX.2 Photography Settings
  /** Selected mood template text */
  mood: string;
  /** Selected camera model template text */
  cameraModel: string;
  /** Selected lens template text */
  lens: string;
  /** Selected color palette template text */
  colorPalette: string;
  // Change handlers for scene settings
  onLocationChange: (value: string) => void;
  onLightingChange: (value: string) => void;
  onCameraChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onCustomPromptChange: (value: string) => void;
  // Change handlers for FLUX.2 settings
  onMoodChange: (value: string) => void;
  onCameraModelChange: (value: string) => void;
  onLensChange: (value: string) => void;
  onColorPaletteChange: (value: string) => void;
  // Subject management
  /** Array of configured subjects */
  subjects: SubjectConfig[];
  /** Callback to add a new subject */
  onAddSubject: () => void;
  /** Callback to remove a subject by ID */
  onRemoveSubject: (id: string) => void;
  /** Callback to update a subject's properties */
  onUpdateSubject: (id: string, updates: Partial<SubjectConfig>) => void;
  /** Callback to link/unlink an avatar to a subject */
  onLinkAvatarToSubject: (subjectId: string, avatar: Avatar | null) => void;
}

/**
 * Prompt Builder Panel - Left sidebar for building structured prompts
 * 
 * Provides a form-based interface for constructing image generation prompts.
 * Templates are organized into categories (style, location, lighting, etc.)
 * and can be selected via dropdown or typed directly.
 * 
 * The panel adapts based on the selected workflow:
 * - Normal workflows show all sections
 * - Upscaler workflow shows only subject selection
 * 
 * @param props - Component props (see PromptBuilderPanelProps)
 * @returns The prompt builder panel component
 */
export function PromptBuilderPanel({
  workflow,
  location,
  lighting,
  camera,
  style,
  customPrompt,
  mood,
  cameraModel,
  lens,
  colorPalette,
  onLocationChange,
  onLightingChange,
  onCameraChange,
  onStyleChange,
  onCustomPromptChange,
  onMoodChange,
  onCameraModelChange,
  onLensChange,
  onColorPaletteChange,
  subjects,
  onAddSubject,
  onRemoveSubject,
  onUpdateSubject,
  onLinkAvatarToSubject,
}: PromptBuilderPanelProps) {
  // Upscaler workflow only needs subject selection for image input
  const isBulletproofUpscaler = workflow === "bulletproof-upscaler";

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Prompt Builder</h2>
        <p className="text-sm text-muted-foreground">
          {isBulletproofUpscaler
            ? "Select an image to upscale using Subjects below"
            : "Build your image prompt step by step"}
        </p>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Scene Settings Section
              Core template selections for the image scene.
              Hidden for upscaler workflow. */}
          {!isBulletproofUpscaler && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Scene Settings
            </h3>

            {/* Style - Overall visual style (cinematic, anime, photorealistic, etc.) */}
            <TemplateSelector
              label="Style"
              templates={styleTemplates}
              value={style}
              onChange={onStyleChange}
              placeholder="Select or type style..."
            />

            {/* Location - Scene environment (studio, outdoors, interior, etc.) */}
            <TemplateSelector
              label="Location"
              templates={locationTemplates}
              value={location}
              onChange={onLocationChange}
              placeholder="Select or type location..."
            />

            {/* Lighting - Light source and mood (golden hour, studio, neon, etc.) */}
            <TemplateSelector
              label="Lighting"
              templates={lightingTemplates}
              value={lighting}
              onChange={onLightingChange}
              placeholder="Select or type lighting..."
            />

            {/* Camera - Shot composition (close-up, wide, bird's eye, etc.) */}
            <TemplateSelector
              label="Camera / Composition"
              templates={cameraTemplates}
              value={camera}
              onChange={onCameraChange}
              placeholder="Select or type camera angle..."
            />
          </div>
          )}

          {!isBulletproofUpscaler && <Separator />}

          {/* FLUX.2 Photography Settings Section
              Additional photography-specific templates for enhanced realism.
              Hidden for upscaler workflow. */}
          {!isBulletproofUpscaler && (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Photography Settings
            </h3>

            {/* Camera Model - Specific camera body for look/feel */}
            <TemplateSelector
              label="Camera Model"
              templates={cameraModelTemplates}
              value={cameraModel}
              onChange={onCameraModelChange}
              placeholder="Select or type camera model..."
            />

            {/* Lens - Focal length and aperture for depth/perspective */}
            <TemplateSelector
              label="Lens"
              templates={lensTemplates}
              value={lens}
              onChange={onLensChange}
              placeholder="Select or type lens..."
            />

            {/* Mood - Atmospheric quality (ethereal, dramatic, peaceful, etc.) */}
            <TemplateSelector
              label="Mood / Atmosphere"
              templates={moodTemplates}
              value={mood}
              onChange={onMoodChange}
              placeholder="Select or type mood..."
            />

            {/* Color Palette - Color scheme (warm, cool, monochrome, etc.) */}
            <TemplateSelector
              label="Color Palette"
              templates={colorPaletteTemplates}
              value={colorPalette}
              onChange={onColorPaletteChange}
              placeholder="Select or type color palette..."
            />
          </div>
          )}

          {!isBulletproofUpscaler && <Separator />}

          {/* Subject Manager Section
              Always visible - manages subjects and their avatars.
              For upscaler, this is the only way to select input image. */}
          <SubjectManager
            subjects={subjects}
            onAdd={onAddSubject}
            onRemove={onRemoveSubject}
            onUpdate={onUpdateSubject}
            onLinkAvatar={onLinkAvatarToSubject}
          />

          {!isBulletproofUpscaler && <Separator />}

          {/* Custom Prompt Section
              Free-form text area for additional instructions.
              Hidden for upscaler workflow. */}
          {!isBulletproofUpscaler && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Additional Instructions (optional)
            </Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              placeholder="Add any additional details or instructions for the image..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This will be appended to the generated prompt
            </p>
          </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

