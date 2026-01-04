/**
 * @fileoverview Database Schema for Bulletproof AI Image Generator
 * 
 * This module defines the PostgreSQL database schema using Drizzle ORM.
 * The schema is designed for a simplified ComfyUI image generator without authentication.
 * 
 * ## Database Architecture
 * 
 * The schema consists of 5 tables organized into two categories:
 * 
 * ### Standalone Entities (no foreign keys):
 * - `avatars` - Reusable reference images for image-to-image workflows
 * - `presets` - Saved prompt builder configurations for quick recall
 * 
 * ### Generation Entities (with foreign key relationships):
 * - `generations` - Parent record for each image generation session
 * - `generatedImages` - Individual output images (1:N with generations)
 * - `generationHistory` - Multi-turn conversation history for refinements (1:N with generations)
 * 
 * ## Cascade Behavior
 * Both `generatedImages` and `generationHistory` use `onDelete: "cascade"` so that
 * deleting a generation automatically removes all associated images and history entries.
 * 
 * ## Indexes
 * - `generations_status_idx` - Optimizes queries filtering by generation status
 * - `generated_images_generation_id_idx` - Optimizes joins from generations to images
 * - `generation_history_generation_id_idx` - Optimizes joins from generations to history
 * 
 * @module lib/schema
 * @see {@link https://orm.drizzle.team/docs/overview Drizzle ORM Documentation}
 */

import { pgTable, text, timestamp, index, uuid, jsonb } from "drizzle-orm/pg-core";

// ==========================================
// Standalone Entities (No Foreign Keys)
// ==========================================

/**
 * Avatars Table - Reusable reference images for image-to-image generation
 * 
 * Avatars serve as persistent reference images that can be linked to subjects
 * in the prompt builder. They are used by workflows that support image-to-image
 * generation (z-image-turbo, bulletproof-background, bulletproof-upscaler).
 * 
 * @example
 * ```typescript
 * // Creating an avatar
 * const avatar = await db.insert(avatars).values({
 *   name: "Professional Headshot",
 *   imageUrl: "/uploads/avatar-123.png",
 *   avatarType: "human",
 *   description: "Business portrait with neutral background"
 * });
 * ```
 * 
 * @property {uuid} id - Primary key, auto-generated UUID v4
 * @property {string} name - Display name for the avatar (required)
 * @property {string} imageUrl - Path or URL to the avatar image file (required)
 * @property {string|null} description - Optional description of the avatar
 * @property {string} avatarType - Type classification: "human" for people, "object" for things
 * @property {Date} createdAt - Timestamp when avatar was created
 * @property {Date} updatedAt - Timestamp of last update (auto-updated on changes)
 */
export const avatars = pgTable(
  "avatars",
  {
    /** Unique identifier - UUID v4, auto-generated */
    id: uuid("id").defaultRandom().primaryKey(),
    /** Display name for the avatar */
    name: text("name").notNull(),
    /** Path or URL to the stored image file */
    imageUrl: text("image_url").notNull(),
    /** Optional description explaining the avatar's purpose or content */
    description: text("description"),
    /** 
     * Avatar type classification for filtering and workflow compatibility:
     * - "human": Person-based avatars (faces, full body)
     * - "object": Non-person subjects (products, items, scenery)
     */
    avatarType: text("avatar_type").notNull().default("human"),
    /** Timestamp when the avatar was first created */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** Timestamp of last modification (auto-updates via $onUpdate trigger) */
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

/**
 * Presets Table - Saved prompt builder configurations for quick recall
 * 
 * Presets store complete prompt builder state as JSON, allowing users to save
 * and restore their favorite configurations. The config JSON includes all
 * template selections, subject configurations, and custom prompt text.
 * 
 * @example
 * ```typescript
 * // Saving a preset
 * const preset = await db.insert(presets).values({
 *   name: "Product Photography Setup",
 *   config: {
 *     style: "Commercial product photography",
 *     lighting: "Studio softbox lighting",
 *     camera: "Macro shot",
 *     subjects: [{ id: "1", customDescription: "White sneaker" }]
 *   }
 * });
 * ```
 * 
 * @property {uuid} id - Primary key, auto-generated UUID v4
 * @property {string} name - User-defined preset name (required)
 * @property {object} config - Full PresetConfig object stored as JSONB
 * @property {Date} createdAt - Timestamp when preset was created
 * @property {Date} updatedAt - Timestamp of last update (auto-updated)
 * 
 * @see {@link PresetConfig} for the structure of the config field
 */
export const presets = pgTable(
  "presets",
  {
    /** Unique identifier - UUID v4, auto-generated */
    id: uuid("id").defaultRandom().primaryKey(),
    /** User-defined name for identifying this preset */
    name: text("name").notNull(),
    /** 
     * Complete prompt builder configuration stored as JSONB.
     * Contains: location, lighting, camera, style, subjects[], customPrompt,
     * and FLUX.2 specific fields: mood, cameraModel, lens, colorPalette
     * @see PresetConfig type in lib/types/generation.ts
     */
    config: jsonb("config").notNull(),
    /** Timestamp when the preset was first created */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** Timestamp of last modification (auto-updates via $onUpdate trigger) */
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

// ==========================================
// Generation Entities (With Foreign Key Relationships)
// ==========================================

/**
 * Generations Table - Parent record for each image generation session
 * 
 * This is the central table for tracking image generation requests. Each row
 * represents one generation session which may produce multiple images.
 * The generation stores the original prompt, settings, and status information.
 * 
 * ## Status Flow
 * ```
 * pending → processing → completed
 *                    └→ failed (with errorMessage)
 * ```
 * 
 * ## ComfyUI Integration
 * The `comfyuiPromptId` field stores the prompt_id returned by ComfyUI's
 * /prompt endpoint, enabling real-time progress tracking via WebSocket.
 * 
 * @example
 * ```typescript
 * // Creating a generation
 * const generation = await db.insert(generations).values({
 *   prompt: "A professional headshot of a business woman",
 *   settings: { resolution: "2K", aspectRatio: "1:1", imageCount: 2 },
 *   status: "pending"
 * });
 * 
 * // Updating status after ComfyUI queuing
 * await db.update(generations)
 *   .set({ status: "processing", comfyuiPromptId: "abc-123" })
 *   .where(eq(generations.id, generationId));
 * ```
 * 
 * @property {uuid} id - Primary key, auto-generated UUID v4
 * @property {string} prompt - The text prompt sent to ComfyUI (required)
 * @property {object} settings - GenerationSettings object as JSONB (required)
 * @property {string} status - Current status: "pending"|"processing"|"completed"|"failed"
 * @property {string|null} errorMessage - Error details if status is "failed"
 * @property {string|null} comfyuiPromptId - ComfyUI prompt_id for progress tracking
 * @property {Date} createdAt - Timestamp when generation was initiated
 * @property {Date} updatedAt - Timestamp of last status change
 */
export const generations = pgTable(
  "generations",
  {
    /** Unique identifier - UUID v4, auto-generated */
    id: uuid("id").defaultRandom().primaryKey(),
    /** The text prompt sent to ComfyUI for image generation */
    prompt: text("prompt").notNull(),
    /** 
     * Generation configuration stored as JSONB.
     * Contains: resolution, aspectRatio, imageCount, steps, guidance, seed,
     * workflow type, and workflow-specific settings (denoise, vramPreset, etc.)
     * @see GenerationSettings type in lib/types/generation.ts
     */
    settings: jsonb("settings").notNull(),
    /** 
     * Current generation status:
     * - "pending": Queued but not yet started
     * - "processing": Currently being processed by ComfyUI
     * - "completed": Successfully generated all images
     * - "failed": Generation failed (see errorMessage for details)
     */
    status: text("status").notNull().default("pending"),
    /** Error message when status is "failed", null otherwise */
    errorMessage: text("error_message"),
    /** 
     * ComfyUI's prompt_id returned from /prompt endpoint.
     * Used to track real-time progress via WebSocket and poll /history endpoint.
     * Null until the generation is actually queued to ComfyUI.
     */
    comfyuiPromptId: text("comfyui_prompt_id"),
    /** Timestamp when the generation request was created */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    /** Timestamp of last modification (status changes, etc.) */
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    /** Index on status column for efficient filtering (e.g., find all pending/processing jobs) */
    index("generations_status_idx").on(table.status),
  ]
);

/**
 * Generated Images Table - Individual output images from a generation session
 * 
 * Each generation can produce multiple images (1-4 typically). This table stores
 * each individual image with a foreign key reference to its parent generation.
 * 
 * ## Cascade Delete Behavior
 * When a generation is deleted, all associated images in this table are
 * automatically deleted due to `onDelete: "cascade"` constraint.
 * 
 * @example
 * ```typescript
 * // Storing generated images after ComfyUI completion
 * const imageUrls = ["/uploads/gen-123-1.png", "/uploads/gen-123-2.png"];
 * await db.insert(generatedImages).values(
 *   imageUrls.map(url => ({
 *     generationId: generation.id,
 *     imageUrl: url
 *   }))
 * );
 * ```
 * 
 * @property {uuid} id - Primary key, auto-generated UUID v4
 * @property {uuid} generationId - Foreign key to generations.id (required)
 * @property {string} imageUrl - Path or URL to the generated image file (required)
 * @property {Date} createdAt - Timestamp when image was stored
 */
export const generatedImages = pgTable(
  "generated_images",
  {
    /** Unique identifier - UUID v4, auto-generated */
    id: uuid("id").defaultRandom().primaryKey(),
    /** 
     * Foreign key reference to the parent generation.
     * Uses CASCADE delete: images are automatically removed when generation is deleted.
     */
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generations.id, { onDelete: "cascade" }),
    /** Path or URL to the generated image file (local path or cloud storage URL) */
    imageUrl: text("image_url").notNull(),
    /** Timestamp when the image was stored after generation completed */
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    /** Index on generationId for efficient joins when fetching images for a generation */
    index("generated_images_generation_id_idx").on(table.generationId),
  ]
);

/**
 * Generation History Table - Multi-turn conversation history for image refinements
 * 
 * Stores the conversation history for iterative image refinement. Each entry
 * represents either a user instruction ("make it brighter") or an assistant
 * response (the resulting images). This enables multi-turn refinement workflows.
 * 
 * ## Conversation Flow
 * ```
 * User: "Make the lighting more dramatic"     → role: "user", imageUrls: null
 * Assistant: [new images generated]           → role: "assistant", imageUrls: ["url1", "url2"]
 * User: "Now add more vibrant colors"         → role: "user", imageUrls: null
 * Assistant: [refined images]                 → role: "assistant", imageUrls: ["url3", "url4"]
 * ```
 * 
 * ## Cascade Delete Behavior
 * When a generation is deleted, all associated history entries are
 * automatically deleted due to `onDelete: "cascade"` constraint.
 * 
 * @example
 * ```typescript
 * // Recording a refinement request and response
 * await db.insert(generationHistory).values([
 *   { generationId: gen.id, role: "user", content: "Make it brighter" },
 *   { generationId: gen.id, role: "assistant", content: "Refined with brighter lighting", imageUrls: ["/img1.png"] }
 * ]);
 * ```
 * 
 * @property {uuid} id - Primary key, auto-generated UUID v4
 * @property {uuid} generationId - Foreign key to generations.id (required)
 * @property {string} role - Message role: "user" for instructions, "assistant" for responses
 * @property {string} content - The message content (instruction or description)
 * @property {string[]|null} imageUrls - Array of image URLs for assistant responses, null for user messages
 * @property {Date} createdAt - Timestamp when this history entry was created
 */
export const generationHistory = pgTable(
  "generation_history",
  {
    /** Unique identifier - UUID v4, auto-generated */
    id: uuid("id").defaultRandom().primaryKey(),
    /** 
     * Foreign key reference to the parent generation.
     * Uses CASCADE delete: history is automatically removed when generation is deleted.
     */
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generations.id, { onDelete: "cascade" }),
    /** 
     * The role of this message in the conversation:
     * - "user": Refinement instruction from the user
     * - "assistant": Generated response with resulting images
     */
    role: text("role").notNull(),
    /** The message content - either user's instruction or assistant's description */
    content: text("content").notNull(),
    /** 
     * Array of image URLs for assistant messages, stored as JSONB.
     * Null for user messages (instructions don't have associated images).
     */
    imageUrls: jsonb("image_urls"),
    /** Timestamp when this conversation entry was created */
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    /** Index on generationId for efficient retrieval of conversation history */
    index("generation_history_generation_id_idx").on(table.generationId)
  ]
);
