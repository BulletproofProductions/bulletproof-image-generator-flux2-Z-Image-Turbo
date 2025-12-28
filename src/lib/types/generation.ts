// ==========================================
// ComfyUI Image Generator - TypeScript Types (Simplified - No Auth)
// ==========================================

// Avatar Types
export type AvatarType = "human" | "object";

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  description: string | null;
  avatarType: AvatarType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAvatarInput {
  name: string;
  imageUrl: string;
  description?: string | undefined;
  avatarType: AvatarType;
}

export interface UpdateAvatarInput {
  name?: string | undefined;
  description?: string | undefined;
  avatarType?: AvatarType | undefined;
}

// Generation Settings
export type ImageResolution = "1K" | "2K" | "4K";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "21:9";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";
export type WorkflowType = "flux2" | "z-image-turbo";

export interface GenerationSettings {
  resolution: ImageResolution;
  aspectRatio: AspectRatio;
  imageCount: 1 | 2 | 3 | 4;
  steps?: number | undefined; // 1-50, default 20 (Flux 2) or 1-20 default 9 (Z Image Turbo)
  guidance?: number | undefined; // 1-10, default 4 (Flux 2) or 1-5 default 1 (Z Image Turbo)
  seed?: number | undefined; // Optional, random if not provided
  workflow?: WorkflowType | undefined; // Default: "flux2"
  denoise?: number | undefined; // 0.1-1.0, default 0.4 (Z Image Turbo only)
  largestSize?: number | undefined; // Max image dimension in pixels, default 1024 (Z Image Turbo only)
  shift?: number | undefined; // ModelSamplingAuraFlow shift, default 3 (Z Image Turbo only)
}

export interface Generation {
  id: string;
  prompt: string;
  settings: GenerationSettings;
  status: GenerationStatus;
  errorMessage: string | null;
  comfyuiPromptId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedImage {
  id: string;
  generationId: string;
  imageUrl: string;
  createdAt: Date;
}

export interface GenerationWithImages extends Generation {
  images: GeneratedImage[];
}

// Generation History for Multi-turn
export type HistoryRole = "user" | "assistant";

export interface GenerationHistoryEntry {
  id: string;
  generationId: string;
  role: HistoryRole;
  content: string;
  imageUrls: string[] | null;
  createdAt: Date;
}

// Preset Configuration
export interface SubjectConfig {
  id: string;
  avatarId?: string | undefined;
  avatarName?: string | undefined;
  avatarDescription?: string | undefined;
  avatarImageUrl?: string | undefined;
  pose?: string | undefined;
  action?: string | undefined;
  clothing?: string | undefined;
  hair?: string | undefined;
  makeup?: string | undefined;
  expression?: string | undefined;
  customDescription?: string | undefined;
}

export interface PresetConfig {
  location?: string;
  lighting?: string;
  camera?: string;
  style?: string;
  subjects: SubjectConfig[];
  customPrompt?: string;
  // FLUX.2 Specific Fields
  mood?: string;
  cameraModel?: string;
  lens?: string;
  colorPalette?: string;
}

export interface Preset {
  id: string;
  name: string;
  config: PresetConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePresetInput {
  name: string;
  config: PresetConfig;
}

export interface UpdatePresetInput {
  name?: string;
  config?: PresetConfig;
}

// Template Types
export interface Template {
  id: string;
  name: string;
  description: string;
  promptFragment: string;
}

// Prompt Builder State
export interface PromptBuilderState {
  location: string;
  lighting: string;
  camera: string;
  style: string;
  subjects: SubjectConfig[];
  customPrompt: string;
  // FLUX.2 Specific Fields
  mood: string;
  cameraModel: string;
  lens: string;
  colorPalette: string;
}

// API Response Types
export interface GenerateImageRequest {
  prompt: string;
  settings: GenerationSettings;
  referenceImages?: {
    avatarId: string;
    imageUrl: string;
    type: AvatarType;
  }[];
}

export interface RefineImageRequest {
  generationId: string;
  instruction: string;
}

// Pagination Response Type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
