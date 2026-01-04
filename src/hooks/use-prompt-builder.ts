/**
 * @fileoverview Prompt Builder Hook - Structured Prompt Construction for FLUX.2
 * 
 * This hook manages the structured prompt building process for image generation,
 * following FLUX.2's optimal prompt ordering for best results.
 * 
 * ## FLUX.2 Optimal Prompt Order
 * 
 * Research and testing has shown that FLUX.2 responds best to prompts ordered as:
 * 
 * ```
 * Style → Camera Model → Subjects → Location → Mood → Lighting → Lens → Camera/Composition → Color Palette → Custom
 * ```
 * 
 * This ordering places high-level aesthetic concepts first, then subject details,
 * then environmental and technical specifications.
 * 
 * ## Prompt Assembly Algorithm
 * 
 * ```
 * 1. Style (overall aesthetic: "cinematic", "documentary", etc.)
 * 2. Camera Model (for photorealism: "Canon EOS R5", "Hasselblad", etc.)
 * 3. Subjects (people/objects with attributes: pose, clothing, expression)
 * 4. Location (environment context: "in a modern office")
 * 5. Mood (atmosphere: "serene", "dramatic", etc.)
 * 6. Lighting (illumination: "golden hour", "studio lighting")
 * 7. Lens (optical characteristics: "85mm f/1.4", "35mm wide angle")
 * 8. Camera/Composition (shot type: "close-up", "wide shot")
 * 9. Color Palette (color grading: "warm tones", "muted colors")
 * 10. Custom (user's additional instructions)
 * ```
 * 
 * ## Workflow-Specific Defaults
 * 
 * Each workflow type has optimized default parameters:
 * 
 * | Workflow | Steps | Guidance | Denoise | Special Settings |
 * |----------|-------|----------|---------|-----------------|
 * | flux2 | 20 | 4 | - | Standard FLUX.2 |
 * | z-image-turbo | 9 | 1 | 0.4 | largestSize: 1024, shift: 3 |
 * | bulletproof-background | 9 | 1 | 0.9 | detectionConfidence: 0.2, subjectToDetect: "person" |
 * | bulletproof-upscaler | - | - | - | vramPreset: "standard", resolution: "2K" |
 * 
 * ## Usage Example
 * 
 * ```tsx
 * const { state, settings, setStyle, addSubject, assembledPrompt } = usePromptBuilder();
 * 
 * // Set style from template
 * setStyle("template-cinematic");
 * 
 * // Add a subject
 * addSubject();
 * updateSubject(subjectId, { pose: "standing", clothing: "business casual" });
 * 
 * // Link an avatar for reference image
 * linkAvatarToSubject(subjectId, avatar);
 * 
 * // Get assembled prompt for generation
 * console.log(assembledPrompt);
 * // "cinematic style. Canon EOS R5. John Doe, standing, business casual. in modern office..."
 * ```
 * 
 * @module hooks/use-prompt-builder
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { getTemplateById } from "@/lib/data/templates";
import type {
  PromptBuilderState,
  SubjectConfig,
  GenerationSettings,
  Avatar,
  WorkflowType,
} from "@/lib/types/generation";

/**
 * Return type for the usePromptBuilder hook
 */
interface UsePromptBuilderReturn {
  // State
  /** Current prompt builder state (all template selections) */
  state: PromptBuilderState;
  /** Current generation settings (resolution, steps, etc.) */
  settings: GenerationSettings;

  // Setters
  /** Set location/environment template or custom value */
  setLocation: (value: string) => void;
  /** Set lighting template or custom value */
  setLighting: (value: string) => void;
  /** Set camera/composition template or custom value */
  setCamera: (value: string) => void;
  /** Set style template or custom value */
  setStyle: (value: string) => void;
  /** Set custom prompt text (appended to assembled prompt) */
  setCustomPrompt: (value: string) => void;
  /** Update generation settings (partial update) */
  setSettings: (settings: Partial<GenerationSettings>) => void;
  /** Switch workflow type (applies workflow-specific defaults) */
  setWorkflow: (workflow: WorkflowType) => void;
  
  // FLUX.2 Specific Setters
  /** Set mood/atmosphere template */
  setMood: (value: string) => void;
  /** Set camera model template (for photorealism) */
  setCameraModel: (value: string) => void;
  /** Set lens characteristics template */
  setLens: (value: string) => void;
  /** Set color palette/grading template */
  setColorPalette: (value: string) => void;

  // Subject management
  /** Add a new empty subject to the list */
  addSubject: () => void;
  /** Remove a subject by ID */
  removeSubject: (id: string) => void;
  /** Update a subject's attributes */
  updateSubject: (id: string, updates: Partial<SubjectConfig>) => void;
  /** Link an avatar to a subject for reference image */
  linkAvatarToSubject: (subjectId: string, avatar: Avatar | null) => void;

  // Computed
  /** The fully assembled prompt string (ready for generation) */
  assembledPrompt: string;
  /** Reference images from linked avatars */
  referenceImages: { avatarId: string; imageUrl: string; type: "human" | "object" }[];

  // Actions
  /** Reset to default state */
  reset: () => void;
  /** Load state from a saved preset */
  loadFromPreset: (preset: PromptBuilderState) => void;
}

/**
 * Default generation settings for FLUX.2 workflow
 * These are optimized for quality/speed balance
 */
const defaultSettings: GenerationSettings = {
  resolution: "2K",      // Default output resolution
  aspectRatio: "1:1",    // Square aspect ratio
  imageCount: 1,         // Single image
  steps: 20,             // Diffusion steps (quality vs speed tradeoff)
  guidance: 4,           // CFG scale (prompt adherence)
  seed: undefined,       // Random seed by default
  workflow: "flux2",     // Default workflow type
  denoise: undefined,    // Only used for img2img workflows
  largestSize: undefined,// Only for Z Image Turbo
  shift: undefined,      // Only for Z Image Turbo
  vramPreset: undefined, // Only for Bulletproof Upscaler
  originalImageUrl: undefined, // For comparison view
};

/**
 * Default empty state for prompt builder
 */
const defaultState: PromptBuilderState = {
  location: "",
  lighting: "",
  camera: "",
  style: "",
  subjects: [],
  customPrompt: "",
  // FLUX.2 Specific Fields
  mood: "",
  cameraModel: "",
  lens: "",
  colorPalette: "",
};

/**
 * Create a new empty subject configuration
 * Uses nanoid for unique ID generation
 * 
 * @returns New SubjectConfig with unique ID and empty fields
 */
const createEmptySubject = (): SubjectConfig => ({
  id: nanoid(),
  pose: "",
  action: "",
  clothing: "",
  hair: "",
  makeup: "",
  expression: "",
  customDescription: "",
});

/**
 * Prompt Builder Hook
 * 
 * Manages the structured construction of prompts for FLUX.2 image generation.
 * Handles template selection, subject management, and prompt assembly.
 * 
 * @returns Object containing state, setters, and computed values
 */
export function usePromptBuilder(): UsePromptBuilderReturn {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [state, setState] = useState<PromptBuilderState>(defaultState);
  const [settings, setSettingsState] = useState<GenerationSettings>(defaultSettings);

  // ============================================================================
  // SIMPLE SETTERS
  // Each setter updates a single field in the state
  // Values can be template IDs (resolved later) or custom strings
  // ============================================================================
  
  const setLocation = useCallback((value: string) => {
    setState((prev) => ({ ...prev, location: value }));
  }, []);

  const setLighting = useCallback((value: string) => {
    setState((prev) => ({ ...prev, lighting: value }));
  }, []);

  const setCamera = useCallback((value: string) => {
    setState((prev) => ({ ...prev, camera: value }));
  }, []);

  const setStyle = useCallback((value: string) => {
    setState((prev) => ({ ...prev, style: value }));
  }, []);

  const setCustomPrompt = useCallback((value: string) => {
    setState((prev) => ({ ...prev, customPrompt: value }));
  }, []);

  const setSettings = useCallback((newSettings: Partial<GenerationSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Switch workflow type and apply workflow-specific default parameters
   * 
   * Each workflow has optimized defaults:
   * - flux2: Standard FLUX.2 (steps: 20, guidance: 4)
   * - z-image-turbo: Fast img2img (steps: 9, denoise: 0.4)
   * - bulletproof-background: Background replacement (denoise: 0.9, detection)
   * - bulletproof-upscaler: Image upscaling (VRAM presets, no diffusion)
   * 
   * @param workflow - The workflow type to switch to
   */
  const setWorkflow = useCallback((workflow: WorkflowType) => {
    setSettingsState((prev) => {
      if (workflow === "z-image-turbo") {
        // Z Image Turbo: Fast img2img with low denoise for style transfer
        return {
          ...prev,
          workflow,
          steps: 9,          // Fewer steps for speed
          guidance: 1,       // Low guidance for img2img
          denoise: 0.4,      // Preserve original image structure
          largestSize: 1024, // Max dimension
          shift: 3,          // Timestep shift for better img2img
          // Clear other workflow settings
          detectionConfidence: undefined,
          subjectToDetect: undefined,
          vramPreset: undefined,
          originalImageUrl: undefined,
        };
      } else if (workflow === "bulletproof-background") {
        // Bulletproof Background: Replace background while preserving subject
        return {
          ...prev,
          workflow,
          steps: 9,
          guidance: 1,
          denoise: 0.9,              // High denoise for background replacement
          shift: 3,
          detectionConfidence: 0.2, // Subject detection threshold
          subjectToDetect: "person", // Default detection target
          // Clear other workflow settings
          largestSize: undefined,
          vramPreset: undefined,
          originalImageUrl: undefined,
        };
      } else if (workflow === "bulletproof-upscaler") {
        // Bulletproof Upscaler: AI-enhanced upscaling (no diffusion)
        return {
          ...prev,
          workflow,
          resolution: "2K",        // Default output resolution
          vramPreset: "standard",  // VRAM optimization preset
          // Clear all diffusion settings (not used for upscaling)
          steps: undefined,
          guidance: undefined,
          denoise: undefined,
          largestSize: undefined,
          shift: undefined,
          detectionConfidence: undefined,
          subjectToDetect: undefined,
          originalImageUrl: undefined,
        };
      } else {
        // FLUX.2: Standard text-to-image generation
        return {
          ...prev,
          workflow,
          steps: 20,       // Full quality steps
          guidance: 4,     // Moderate guidance for creativity
          denoise: undefined,
          largestSize: undefined,
          shift: undefined,
          detectionConfidence: undefined,
          subjectToDetect: undefined,
          vramPreset: undefined,
          originalImageUrl: undefined,
        };
      }
    });
  }, []);

  // FLUX.2 Specific Setters
  const setMood = useCallback((value: string) => {
    setState((prev) => ({ ...prev, mood: value }));
  }, []);

  const setCameraModel = useCallback((value: string) => {
    setState((prev) => ({ ...prev, cameraModel: value }));
  }, []);

  const setLens = useCallback((value: string) => {
    setState((prev) => ({ ...prev, lens: value }));
  }, []);

  const setColorPalette = useCallback((value: string) => {
    setState((prev) => ({ ...prev, colorPalette: value }));
  }, []);

  // ============================================================================
  // SUBJECT MANAGEMENT
  // Subjects represent people or objects in the generated image
  // Each subject can have attributes (pose, clothing, etc.) and a linked avatar
  // ============================================================================

  /**
   * Add a new empty subject to the subjects list
   * Subjects are used to describe people/objects in the scene
   */
  const addSubject = useCallback(() => {
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, createEmptySubject()],
    }));
  }, []);

  /**
   * Remove a subject from the list by ID
   * @param id - Subject ID to remove
   */
  const removeSubject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  }, []);

  /**
   * Update a subject's attributes
   * @param id - Subject ID to update
   * @param updates - Partial updates to apply
   */
  const updateSubject = useCallback((id: string, updates: Partial<SubjectConfig>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  /**
   * Link or unlink an avatar to a subject
   * Linked avatars provide reference images for generation and
   * their description is used in the prompt
   * 
   * @param subjectId - Subject ID to update
   * @param avatar - Avatar to link, or null to unlink
   */
  const linkAvatarToSubject = useCallback((subjectId: string, avatar: Avatar | null) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              avatarId: avatar?.id,
              avatarName: avatar?.name,
              avatarDescription: avatar?.description ?? undefined,
              avatarImageUrl: avatar?.imageUrl,
            }
          : s
      ),
    }));
  }, []);

  // ============================================================================
  // PROMPT ASSEMBLY
  // ============================================================================

  /**
   * Resolve a value to its prompt fragment
   * If the value is a template ID (e.g., "template-cinematic"), looks up the
   * template and returns its promptFragment. Otherwise returns the value as-is.
   * 
   * @param value - Template ID or custom string
   * @returns The prompt fragment to include in the assembled prompt
   */
  const getPromptValue = useCallback((value: string): string => {
    if (!value) return "";
    // Check if it's a template ID
    const template = getTemplateById(value);
    return template ? template.promptFragment : value;
  }, []);

  /**
   * Assemble the final prompt from all builder state
   * 
   * FLUX.2 Optimal Order:
   * Style → Camera Model → Subjects → Location → Mood → Lighting → Lens → Camera/Composition → Color Palette → Custom
   * 
   * This ordering is based on testing and research showing FLUX.2 responds
   * best when high-level concepts come first, followed by specifics.
   */
  const assembledPrompt = useMemo(() => {
    const parts: string[] = [];

    // 1. Style (overall aesthetic - most important, sets the tone)
    const stylePrompt = getPromptValue(state.style);
    if (stylePrompt) {
      parts.push(stylePrompt);
    }

    // 2. Camera Model (for photorealistic authenticity - FLUX.2 specific)
    const cameraModelPrompt = getPromptValue(state.cameraModel);
    if (cameraModelPrompt) {
      parts.push(cameraModelPrompt);
    }

    // 3. Subjects (the main content of the image)
    state.subjects.forEach((subject, index) => {
      const subjectParts: string[] = [];

      // Use avatar description for better prompt context (fallback to name, then generic)
      if (subject.avatarDescription) {
        subjectParts.push(subject.avatarDescription);
      } else if (subject.avatarName) {
        subjectParts.push(subject.avatarName);
      } else {
        subjectParts.push(`Subject ${index + 1}`);
      }

      // Add subject attributes in order of visual importance
      const pose = getPromptValue(subject.pose || "");
      const action = getPromptValue(subject.action || "");
      const clothing = getPromptValue(subject.clothing || "");
      const expression = getPromptValue(subject.expression || "");

      if (pose) subjectParts.push(pose);
      if (action) subjectParts.push(action);
      if (clothing) subjectParts.push(clothing);
      if (expression) subjectParts.push(expression);
      if (subject.hair) subjectParts.push(subject.hair);
      if (subject.makeup) subjectParts.push(subject.makeup);
      if (subject.customDescription) subjectParts.push(subject.customDescription);

      if (subjectParts.length > 0) {
        parts.push(subjectParts.join(", "));
      }
    });

    // 4. Location (environmental context)
    const locationPrompt = getPromptValue(state.location);
    if (locationPrompt) {
      parts.push(`in ${locationPrompt}`);
    }

    // 5. Mood/Atmosphere (FLUX.2 specific - emotional tone)
    const moodPrompt = getPromptValue(state.mood);
    if (moodPrompt) {
      parts.push(moodPrompt);
    }

    // 6. Lighting (illumination style)
    const lightingPrompt = getPromptValue(state.lighting);
    if (lightingPrompt) {
      parts.push(lightingPrompt);
    }

    // 7. Lens (optical characteristics - FLUX.2 specific)
    const lensPrompt = getPromptValue(state.lens);
    if (lensPrompt) {
      parts.push(lensPrompt);
    }

    // 8. Camera/Composition (shot type, angle)
    const cameraPrompt = getPromptValue(state.camera);
    if (cameraPrompt) {
      parts.push(cameraPrompt);
    }

    // 9. Color Palette (color grading - FLUX.2 specific)
    const colorPalettePrompt = getPromptValue(state.colorPalette);
    if (colorPalettePrompt) {
      parts.push(colorPalettePrompt);
    }

    // 10. Custom prompt (user's additional instructions at the end)
    if (state.customPrompt) {
      parts.push(state.customPrompt);
    }

    // Join all parts with period separator for clear sentence structure
    return parts.filter(Boolean).join(". ");
  }, [state, getPromptValue]);

  /**
   * Extract reference images from subjects with linked avatars
   * These images are used as reference for img2img generation
   */
  const referenceImages = useMemo(() => {
    return state.subjects
      .filter((s) => s.avatarId && s.avatarImageUrl)
      .map((s) => ({
        avatarId: s.avatarId!,
        imageUrl: s.avatarImageUrl!,
        type: "human" as const, // Could be determined from avatar type
      }));
  }, [state.subjects]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Reset both state and settings to defaults
   * Use when starting a fresh generation
   */
  const reset = useCallback(() => {
    setState(defaultState);
    setSettingsState(defaultSettings);
  }, []);

  /**
   * Load prompt builder state from a saved preset
   * Only loads the prompt state, not generation settings
   * 
   * @param preset - Saved PromptBuilderState to restore
   */
  const loadFromPreset = useCallback((preset: PromptBuilderState) => {
    setState(preset);
  }, []);

  return {
    state,
    settings,
    setLocation,
    setLighting,
    setCamera,
    setStyle,
    setCustomPrompt,
    setSettings,
    // FLUX.2 Specific Setters
    setMood,
    setCameraModel,
    setLens,
    setColorPalette,
    addSubject,
    removeSubject,
    updateSubject,
    linkAvatarToSubject,
    assembledPrompt,
    referenceImages,
    reset,
    loadFromPreset,
    setWorkflow,
  };
}
