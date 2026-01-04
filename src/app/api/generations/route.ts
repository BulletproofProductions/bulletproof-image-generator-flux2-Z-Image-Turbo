/**
 * @fileoverview Generations List API - Paginated Generation History
 * 
 * Provides paginated access to generation history with associated images.
 * Used by the gallery/history view to display past generations.
 * 
 * ## Endpoint
 * 
 * GET /api/generations?page=1&pageSize=10
 * 
 * ## Query Parameters
 * 
 * - `page`: Page number (1-indexed, default: 1)
 * - `pageSize`: Items per page (1-50, default: 10)
 * 
 * ## Response
 * 
 * ```json
 * {
 *   "items": [...],      // Array of GenerationWithImages
 *   "total": 100,        // Total generations count
 *   "page": 1,           // Current page
 *   "pageSize": 10,      // Items per page
 *   "hasMore": true      // More pages available
 * }
 * ```
 * 
 * @module api/generations
 */

import { NextResponse } from "next/server";
import { desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { generations, generatedImages } from "@/lib/schema";
import type { GenerationSettings, GenerationWithImages, PaginatedResponse } from "@/lib/types/generation";

/**
 * GET /api/generations
 * 
 * List all generations with pagination, including associated images.
 * 
 * @param request - Request with pagination query params
 * @returns Paginated list of generations with images
 */
export async function GET(request: Request) {
  try {
    // Parse pagination params with validation
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    const offset = (page - 1) * pageSize;

    // Get total count for pagination info
    const [totalResult] = await db
      .select({ count: count() })
      .from(generations);

    const total = totalResult?.count || 0;

    // Get generations for this page, newest first
    const allGenerations = await db
      .select()
      .from(generations)
      .orderBy(desc(generations.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Batch load all images for these generations (N+1 query optimization)
    const generationIds = allGenerations.map((g) => g.id);
    let images: typeof generatedImages.$inferSelect[] = [];

    if (generationIds.length > 0) {
      const { inArray } = await import("drizzle-orm");
      images = await db
        .select()
        .from(generatedImages)
        .where(inArray(generatedImages.generationId, generationIds));
    }

    // Map generations with their associated images
    const generationsWithImages: GenerationWithImages[] = allGenerations.map((gen) => ({
      id: gen.id,
      prompt: gen.prompt,
      settings: gen.settings as GenerationSettings,
      status: gen.status as "pending" | "processing" | "completed" | "failed",
      errorMessage: gen.errorMessage,
      createdAt: gen.createdAt,
      updatedAt: gen.updatedAt,
      images: images
        .filter((img) => img.generationId === gen.id)
        .map((img) => ({
          id: img.id,
          generationId: img.generationId,
          imageUrl: img.imageUrl,
          createdAt: img.createdAt,
        })),
    }));

    const response: PaginatedResponse<GenerationWithImages> = {
      items: generationsWithImages,
      total,
      page,
      pageSize,
      hasMore: offset + allGenerations.length < total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json(
      { error: "Failed to fetch generations" },
      { status: 500 }
    );
  }
}
