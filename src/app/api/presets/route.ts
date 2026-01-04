/**
 * @fileoverview Presets API - Save and Load Prompt Builder Configurations
 * 
 * Presets allow users to save their prompt builder configurations and reload
 * them later. This enables quick switching between different generation styles.
 * 
 * ## Endpoints
 * 
 * - GET /api/presets - List all presets
 * - POST /api/presets - Create a new preset
 * 
 * ## Preset Structure
 * 
 * ```json
 * {
 *   "id": "preset_123",
 *   "name": "Corporate Portrait",
 *   "config": {
 *     "promptBuilderState": { ... },
 *     "settings": { ... }
 *   },
 *   "createdAt": "2024-01-01T00:00:00Z"
 * }
 * ```
 * 
 * @module api/presets
 */

import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { presets } from "@/lib/schema";
import type { Preset, CreatePresetInput, PresetConfig } from "@/lib/types/generation";

/**
 * GET /api/presets
 * 
 * List all presets ordered by creation date (newest first).
 * 
 * @returns JSON array of Preset objects
 */
export async function GET() {
  try {
    const allPresets = await db
      .select()
      .from(presets)
      .orderBy(desc(presets.createdAt));

    const formattedPresets: Preset[] = allPresets.map((p) => ({
      id: p.id,
      name: p.name,
      config: p.config as PresetConfig,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({ presets: formattedPresets });
  } catch (error) {
    console.error("Error fetching presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/presets
 * 
 * Create a new preset from the current prompt builder state.
 * 
 * @param request - Request with JSON body { name, config }
 * @returns Created Preset object
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePresetInput;
    const { name, config } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Config is required and must be an object" },
        { status: 400 }
      );
    }

    // Validate config structure
    if (!Array.isArray(config.subjects)) {
      return NextResponse.json(
        { error: "Config must contain a subjects array" },
        { status: 400 }
      );
    }

    // Create the preset
    const [newPreset] = await db
      .insert(presets)
      .values({
        name: name.trim(),
        config: config,
      })
      .returning();

    if (!newPreset) {
      return NextResponse.json(
        { error: "Failed to create preset" },
        { status: 500 }
      );
    }

    const formattedPreset: Preset = {
      id: newPreset.id,
      name: newPreset.name,
      config: newPreset.config as PresetConfig,
      createdAt: newPreset.createdAt,
      updatedAt: newPreset.updatedAt,
    };

    return NextResponse.json({ preset: formattedPreset }, { status: 201 });
  } catch (error) {
    console.error("Error creating preset:", error);
    return NextResponse.json(
      { error: "Failed to create preset" },
      { status: 500 }
    );
  }
}
