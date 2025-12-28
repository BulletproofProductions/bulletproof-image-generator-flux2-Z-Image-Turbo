import { NextResponse } from "next/server";
import { eq, desc, count, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { generations, generatedImages } from "@/lib/schema";
import type { GenerationSettings, PaginatedResponse } from "@/lib/types/generation";

// Simplified gallery image type (no user, no likes)
interface SimpleGalleryImage {
  id: string;
  generationId: string;
  imageUrl: string;
  createdAt: Date;
  generation: {
    prompt: string;
    settings: GenerationSettings;
    createdAt: Date;
  };
}

/**
 * GET /api/gallery/public
 * List all images with pagination and search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = search
      ? ilike(generations.prompt, `%${search}%`)
      : undefined;

    // Get total count of images (with search filter)
    const totalQuery = whereConditions
      ? db
          .select({ count: count() })
          .from(generatedImages)
          .innerJoin(generations, eq(generatedImages.generationId, generations.id))
          .where(whereConditions)
      : db.select({ count: count() }).from(generatedImages);

    const [totalResult] = await totalQuery;
    const total = totalResult?.count || 0;

    // Get images with generation info
    const baseQuery = db
      .select({
        image: generatedImages,
        generation: generations,
      })
      .from(generatedImages)
      .innerJoin(generations, eq(generatedImages.generationId, generations.id));

    const images = whereConditions
      ? await baseQuery
          .where(whereConditions)
          .orderBy(desc(generatedImages.createdAt))
          .limit(pageSize)
          .offset(offset)
      : await baseQuery
          .orderBy(desc(generatedImages.createdAt))
          .limit(pageSize)
          .offset(offset);

    // Map to SimpleGalleryImage type
    const galleryImages: SimpleGalleryImage[] = images.map((row) => ({
      id: row.image.id,
      generationId: row.image.generationId,
      imageUrl: row.image.imageUrl,
      createdAt: row.image.createdAt,
      generation: {
        prompt: row.generation.prompt,
        settings: row.generation.settings as GenerationSettings,
        createdAt: row.generation.createdAt,
      },
    }));

    const response: PaginatedResponse<SimpleGalleryImage> = {
      items: galleryImages,
      total,
      page,
      pageSize,
      hasMore: offset + images.length < total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}
