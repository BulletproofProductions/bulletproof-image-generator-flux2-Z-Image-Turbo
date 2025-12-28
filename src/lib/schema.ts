import { pgTable, text, timestamp, index, uuid, jsonb } from "drizzle-orm/pg-core";

// ==========================================
// ComfyUI Image Generator Tables (Simplified - No Auth)
// ==========================================

// Avatars - Reusable reference images for image-to-image generation
export const avatars = pgTable(
  "avatars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    description: text("description"),
    avatarType: text("avatar_type").notNull().default("human"), // "human" | "object"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

// Presets - Saved prompt configurations
export const presets = pgTable(
  "presets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    config: jsonb("config").notNull(), // Full prompt builder configuration
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

// Generations - Parent record for each generation session
export const generations = pgTable(
  "generations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    prompt: text("prompt").notNull(),
    settings: jsonb("settings").notNull(), // Resolution, aspect ratio, etc.
    status: text("status").notNull().default("pending"), // "pending" | "processing" | "completed" | "failed"
    errorMessage: text("error_message"),
    comfyuiPromptId: text("comfyui_prompt_id"), // ComfyUI prompt_id for real progress tracking
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("generations_status_idx").on(table.status),
  ]
);

// Generated Images - Individual images from a generation
export const generatedImages = pgTable(
  "generated_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generations.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("generated_images_generation_id_idx").on(table.generationId),
  ]
);

// Generation History - Multi-turn conversation history for refinements
export const generationHistory = pgTable(
  "generation_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    imageUrls: jsonb("image_urls"), // Array of image URLs for this turn
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("generation_history_generation_id_idx").on(table.generationId)]
);
