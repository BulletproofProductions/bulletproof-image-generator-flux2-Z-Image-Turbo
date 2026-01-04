/**
 * @fileoverview TypeScript Type Definitions for Bulletproof AI Image Generator
 * 
 * This module contains all shared TypeScript types, interfaces, and type aliases
 * used throughout the application. The types are organized into several categories:
 * 
 * ## Type Categories
 * 
 * ### Entity Types (Database Models)
 * - `Avatar` - Reusable reference images
 * - `Generation` - Image generation session
 * - `GeneratedImage` - Individual output images
 * - `Preset` - Saved prompt configurations
 * - `GenerationHistoryEntry` - Refinement conversation history
 * 
 * ### DTO Types (Data Transfer Objects)
 * - `CreateAvatarInput`, `UpdateAvatarInput`
 * - `CreatePresetInput`, `UpdatePresetInput`
 * - `GenerateImageRequest`, `RefineImageRequest`
 * 
 * ### Enum-like Union Types
 * - `ImageResolution` - "1K" | "2K" | "4K"
 * - `AspectRatio` - "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9"
 * - `WorkflowType` - "flux2" | "z-image-turbo" | "bulletproof-background" | "bulletproof-upscaler"
 * - `GenerationStatus` - "pending" | "processing" | "completed" | "failed"
 * - `VRAMPreset` - "low" | "standard" | "high"
 * 
 * ### UI State Types
 * - `PromptBuilderState` - Complete prompt builder form state
 * - `SubjectConfig` - Individual subject configuration
 * - `Template` - Prompt template structure
 * 
 * ## Usage Example
 * 
 * ```typescript
 * import type {
 *   Generation,
 *   GenerationSettings,
 *   WorkflowType
 * } from "@/lib/types/generation";
 * 
 * const settings: GenerationSettings = {
 *   resolution: "2K",
 *   aspectRatio: "16:9",
 *   imageCount: 2,
 *   workflow: "flux2"
 * };
 * ```
 * 
 * @module lib/types/generation
 */

// ==========================================
// Avatar Types
// ==========================================

/**
 * Avatar type classification for filtering and workflow compatibility
 * 
 * - `"human"`: Person-based avatars (faces, full body shots)
 * - `"object"`: Non-person subjects (products, items, scenery)
 */
export type AvatarType = "human" | "object";

/**
 * Avatar entity - Reusable reference image for image-to-image workflows
 * 
 * Avatars are stored in the database and can be linked to subjects
 * in the prompt builder for consistent character/object generation.
 * 
 * @see CreateAvatarInput for creation
 * @see UpdateAvatarInput for updates
 */
export interface Avatar {
  /** Unique identifier (UUID) */
  id: string;
  /** Display name for the avatar */
  name: string;
  /** URL or path to the avatar image */
  imageUrl: string;
  /** Optional description of the avatar */
  description: string | null;
  /** Classification: "human" for people, "object" for things */
  avatarType: AvatarType;
  /** When the avatar was created */
  createdAt: Date;
  /** When the avatar was last updated */
  updatedAt: Date;
}

/**
 * Input for creating a new avatar
 * 
 * @example
 * ```typescript
 * const input: CreateAvatarInput = {
 *   name: "Professional Headshot",
 *   imageUrl: "/uploads/avatar-123.png",
 *   avatarType: "human",
 *   description: "Business portrait"
 * };
 * ```
 */
export interface CreateAvatarInput {
  name: string;
  imageUrl: string;
  description?: string | undefined;
  avatarType: AvatarType;
}

/**
 * Input for updating an existing avatar (all fields optional)
 */
export interface UpdateAvatarInput {
  name?: string | undefined;
  description?: string | undefined;
  avatarType?: AvatarType | undefined;
}

// ==========================================
// Generation Settings & Status Types
// ==========================================

/**
 * Image resolution preset
 * 
 * Combined with AspectRatio to determine final pixel dimensions:
 * - `"1K"`: ~1 megapixel (1024x1024 for 1:1)
 * - `"2K"`: ~4 megapixels (2048x2048 for 1:1)
 * - `"4K"`: ~16 megapixels (4096x4096 for 1:1)
 * 
 * @see getResolutionDimensions in comfyui.ts for exact pixel values
 */
export type ImageResolution = "1K" | "2K" | "4K";

/**
 * Aspect ratio for generated images
 * 
 * - `"1:1"`: Square (Instagram, profile pictures)
 * - `"16:9"`: Widescreen landscape (YouTube, presentations)
 * - `"9:16"`: Portrait/vertical (Stories, TikTok)
 * - `"4:3"`: Traditional photo ratio
 * - `"3:4"`: Portrait traditional ratio
 * - `"21:9"`: Ultrawide cinematic
 */
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9";

/**
 * Generation status lifecycle
 * 
 * ```
 * pending → processing → completed
 *                    └→ failed (with errorMessage)
 * ```
 */
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Available workflow types for image generation
 * 
 * Each workflow has different capabilities and requirements:
 * 
 * | Workflow              | Input Required | Output          | Speed   |
 * |-----------------------|----------------|-----------------|---------|
 * | flux2                 | None/Optional  | Text-to-image   | Medium  |
 * | z-image-turbo         | Image required | Image-to-image  | Fast    |
 * | bulletproof-background| Image required | Background swap | Medium  |
 * | bulletproof-upscaler  | Image required | 4X upscaled     | Slow    |
 */
export type WorkflowType = "flux2" | "z-image-turbo" | "bulletproof-background" | "bulletproof-upscaler";

/**
 * VRAM usage preset for upscaler workflow
 * 
 * Controls tile size for memory-efficient processing:
 * - `"low"`: 256px tiles (~4GB VRAM)
 * - `"standard"`: 512px tiles (~8GB VRAM)
 * - `"high"`: 1024px tiles (~16GB+ VRAM)
 */
export type VRAMPreset = "low" | "standard" | "high";

/**
 * Complete generation settings configuration
 * 
 * Contains all parameters needed to configure a generation request.
 * Different workflows use different subsets of these settings.
 * 
 * ## Common Settings (all workflows)
 * - `resolution`, `aspectRatio`, `imageCount`, `seed`
 * 
 * ## Flux2 Settings
 * - `steps` (default: 20), `guidance` (default: 4)
 * 
 * ## Z Image Turbo / Background Settings
 * - `steps` (default: 9), `guidance` (default: 1), `denoise`, `shift`
 * 
 * ## Background-Specific
 * - `detectionConfidence`, `subjectToDetect`
 * 
 * ## Upscaler-Specific
 * - `vramPreset`, `originalImageUrl`
 * 
 * @example
 * ```typescript
 * const settings: GenerationSettings = {
 *   resolution: "2K",
 *   aspectRatio: "16:9",
 *   imageCount: 2,
 *   workflow: "flux2",
 *   steps: 25,
 *   guidance: 4.5,
 *   seed: 12345
 * };
 * ```
 */
export interface GenerationSettings {
  /** Output resolution tier */
  resolution: ImageResolution;
  /** Output aspect ratio */
  aspectRatio: AspectRatio;
  /** Number of images to generate (1-4) */
  imageCount: 1 | 2 | 3 | 4;
  /** 
   * Diffusion steps - more steps = higher quality but slower
   * - Flux2: 1-50, default 20
   * - Z Image Turbo/Background: 1-20, default 9
   */
  steps?: number | undefined;
  /** 
   * CFG guidance scale - higher = more prompt adherence
   * - Flux2: 1-10, default 4
   * - Z Image Turbo/Background: 1-5, default 1
   */
  guidance?: number | undefined;
  /** Random seed for reproducibility (random if not provided) */
  seed?: number | undefined;
  /** Workflow type (default: "flux2") */
  workflow?: WorkflowType | undefined;
  /** 
   * Denoising strength for img2img workflows
   * - Z Image Turbo: 0.1-1.0, default 0.4 (lower = preserve more original)
   * - Background: 0.1-1.0, default 0.9 (higher for full replacement)
   */
  denoise?: number | undefined;
  /** Max image dimension in pixels (Z Image Turbo only, default: 1024) */
  largestSize?: number | undefined;
  /** ModelSamplingAuraFlow shift parameter (Z Image Turbo/Background, default: 3) */
  shift?: number | undefined;
  /** SAM3 detection confidence threshold (Background only, default: 0.2) */
  detectionConfidence?: number | undefined;
  /** Text prompt for SAM3 segmentation (Background only, default: "person") */
  subjectToDetect?: string | undefined;
  /** VRAM usage preset for upscaler (Upscaler only, default: "standard") */
  vramPreset?: VRAMPreset | undefined;
  /** Original image URL for comparison view (Upscaler only) */
  originalImageUrl?: string | undefined;
}

// ==========================================
// Generation Entity Types
// ==========================================

/**
 * Generation entity - Parent record for an image generation session
 * 
 * Represents a single generation request with its prompt, settings,
 * and current status. Images are stored separately in GeneratedImage.
 */
export interface Generation {
  /** Unique identifier (UUID) */
  id: string;
  /** The text prompt sent to ComfyUI */
  prompt: string;
  /** Generation configuration */
  settings: GenerationSettings;
  /** Current status in the generation lifecycle */
  status: GenerationStatus;
  /** Error message if status is "failed" */
  errorMessage: string | null;
  /** ComfyUI prompt_id for progress tracking */
  comfyuiPromptId?: string | null;
  /** When the generation was initiated */
  createdAt: Date;
  /** When the generation was last updated */
  updatedAt: Date;
}

/**
 * Generated image entity - Individual output image from a generation
 */
export interface GeneratedImage {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key to parent generation */
  generationId: string;
  /** URL or path to the generated image file */
  imageUrl: string;
  /** When the image was stored */
  createdAt: Date;
}

/**
 * Generation with images - Joined type for API responses
 * 
 * Combines a Generation with its associated GeneratedImage array.
 * Used when fetching generation details with images.
 */
export interface GenerationWithImages extends Generation {
  /** Array of generated images for this generation */
  images: GeneratedImage[];
}

// ==========================================
// Generation History Types
// ==========================================

/**
 * Role in refinement conversation
 * - `"user"`: Refinement instruction from the user
 * - `"assistant"`: Response with generated images
 */
export type HistoryRole = "user" | "assistant";

/**
 * Generation history entry - Single message in refinement conversation
 * 
 * Used for multi-turn image refinement where users can iteratively
 * improve generated images with natural language instructions.
 */
export interface GenerationHistoryEntry {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key to parent generation */
  generationId: string;
  /** Message role: "user" or "assistant" */
  role: HistoryRole;
  /** Message content (instruction or description) */
  content: string;
  /** Image URLs for assistant responses, null for user messages */
  imageUrls: string[] | null;
  /** When this history entry was created */
  createdAt: Date;
}

// ==========================================
// Subject & Preset Configuration Types
// ==========================================

/**
 * Subject configuration - Individual subject in a prompt
 * 
 * Subjects represent people, characters, or objects in the generated image.
 * Each subject can have an avatar linked for consistent appearance, plus
 * various attributes like pose, clothing, and expression.
 * 
 * @example
 * ```typescript
 * const subject: SubjectConfig = {
 *   id: "subject-1",
 *   avatarId: "avatar-123",
 *   avatarName: "John",
 *   pose: "standing confidently",
 *   clothing: "business suit",
 *   expression: "confident smile"
 * };
 * ```
 */
export interface SubjectConfig {
  /** Unique identifier for this subject instance */
  id: string;
  /** Linked avatar ID (optional) */
  avatarId?: string | undefined;
  /** Avatar display name (denormalized for UI) */
  avatarName?: string | undefined;
  /** Avatar description (denormalized for UI) */
  avatarDescription?: string | undefined;
  /** Avatar image URL (denormalized for UI) */
  avatarImageUrl?: string | undefined;
  /** Body pose/position */
  pose?: string | undefined;
  /** What the subject is doing */
  action?: string | undefined;
  /** What the subject is wearing */
  clothing?: string | undefined;
  /** Hair style/color */
  hair?: string | undefined;
  /** Makeup description */
  makeup?: string | undefined;
  /** Facial expression */
  expression?: string | undefined;
  /** Additional custom description */
  customDescription?: string | undefined;
}

/**
 * Preset configuration - Saved prompt builder state
 * 
 * Contains all the template selections and subject configurations
 * that make up a complete prompt builder state. Stored as JSON
 * in the presets table.
 */
export interface PresetConfig {
  /** Location/environment template selection */
  location?: string;
  /** Lighting template selection */
  lighting?: string;
  /** Camera/composition template selection */
  camera?: string;
  /** Style template selection */
  style?: string;
  /** Array of subject configurations */
  subjects: SubjectConfig[];
  /** Additional custom prompt text */
  customPrompt?: string;
  // FLUX.2 Specific Fields
  /** Mood/atmosphere template (FLUX.2) */
  mood?: string;
  /** Camera model template (FLUX.2) */
  cameraModel?: string;
  /** Lens template (FLUX.2) */
  lens?: string;
  /** Color palette template (FLUX.2) */
  colorPalette?: string;
}

/**
 * Preset entity - Saved prompt configuration
 */
export interface Preset {
  /** Unique identifier (UUID) */
  id: string;
  /** User-defined preset name */
  name: string;
  /** Complete preset configuration */
  config: PresetConfig;
  /** When the preset was created */
  createdAt: Date;
  /** When the preset was last updated */
  updatedAt: Date;
}

/**
 * Input for creating a new preset
 */
export interface CreatePresetInput {
  name: string;
  config: PresetConfig;
}

/**
 * Input for updating an existing preset
 */
export interface UpdatePresetInput {
  name?: string;
  config?: PresetConfig;
}

// ==========================================
// Template Types
// ==========================================

/**
 * Template - Reusable prompt fragment
 * 
 * Templates are pre-built prompt fragments organized by category
 * (lighting, style, location, etc.) that users can select to
 * build their final prompt.
 * 
 * @see lib/data/templates.ts for all available templates
 */
export interface Template {
  /** Unique identifier (e.g., "lighting-golden-hour") */
  id: string;
  /** Display name (e.g., "Golden Hour") */
  name: string;
  /** Tooltip description */
  description: string;
  /** Actual text added to the prompt */
  promptFragment: string;
}

// ==========================================
// UI State Types
// ==========================================

/**
 * Prompt builder state - Complete form state for the prompt builder UI
 * 
 * Tracks all template selections and subject configurations that
 * make up the current prompt being built. This state is managed
 * by the usePromptBuilder hook.
 * 
 * @see usePromptBuilder hook for state management
 */
export interface PromptBuilderState {
  /** Selected location template fragment */
  location: string;
  /** Selected lighting template fragment */
  lighting: string;
  /** Selected camera/composition template fragment */
  camera: string;
  /** Selected style template fragment */
  style: string;
  /** Array of subject configurations */
  subjects: SubjectConfig[];
  /** Additional custom prompt text */
  customPrompt: string;
  // FLUX.2 Specific Fields
  /** Selected mood template fragment */
  mood: string;
  /** Selected camera model template fragment */
  cameraModel: string;
  /** Selected lens template fragment */
  lens: string;
  /** Selected color palette template fragment */
  colorPalette: string;
}

// ==========================================
// API Request/Response Types
// ==========================================

/**
 * Request body for POST /api/generate
 * 
 * Contains the assembled prompt, generation settings, and optional
 * reference images for image-to-image workflows.
 */
export interface GenerateImageRequest {
  /** Assembled text prompt */
  prompt: string;
  /** Generation settings */
  settings: GenerationSettings;
  /** Optional reference images for img2img workflows */
  referenceImages?: {
    /** Avatar ID for tracking */
    avatarId: string;
    /** Image URL to upload to ComfyUI */
    imageUrl: string;
    /** Avatar type */
    type: AvatarType;
  }[];
}

/**
 * Request body for POST /api/generate/[id]/refine
 * 
 * Contains refinement instruction for iterative image improvement.
 */
export interface RefineImageRequest {
  /** Parent generation ID */
  generationId: string;
  /** Natural language refinement instruction */
  instruction: string;
}

// ==========================================
// Pagination Types
// ==========================================

/**
 * Generic paginated response wrapper
 * 
 * Used by list endpoints (GET /api/generations, GET /api/avatars, etc.)
 * to provide consistent pagination metadata.
 * 
 * @typeParam T - The entity type being paginated
 * 
 * @example
 * ```typescript
 * // Response from GET /api/generations?page=2&pageSize=10
 * const response: PaginatedResponse<GenerationWithImages> = {
 *   items: [...], // 10 generation records
 *   total: 45,    // Total generations in database
 *   page: 2,      // Current page (1-indexed)
 *   pageSize: 10, // Items per page
 *   hasMore: true // More pages available (45 > 2 * 10)
 * };
 * ```
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  items: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether more pages exist after current page */
  hasMore: boolean;
}
