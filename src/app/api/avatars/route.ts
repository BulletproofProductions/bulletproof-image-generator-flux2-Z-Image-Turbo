import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { avatars } from "@/lib/schema";
import { upload } from "@/lib/storage";
import type { Avatar, AvatarType } from "@/lib/types/generation";

/**
 * GET /api/avatars
 * List all avatars
 */
export async function GET() {
  try {
    const allAvatars = await db
      .select()
      .from(avatars)
      .orderBy(desc(avatars.createdAt));

    return NextResponse.json({ avatars: allAvatars as Avatar[] });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/avatars
 * Create a new avatar with image upload
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const avatarType = formData.get("avatarType") as AvatarType;
    const image = formData.get("image") as File | null;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!avatarType || !["human", "object"].includes(avatarType)) {
      return NextResponse.json(
        { error: "Avatar type must be 'human' or 'object'" },
        { status: 400 }
      );
    }

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    // Validate image type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Allowed: JPEG, PNG, GIF, WEBP" },
        { status: 400 }
      );
    }

    // Validate image size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Upload the image
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const timestamp = Date.now();
    const extension = image.name.split(".").pop() || "png";
    const filename = `avatar-${timestamp}.${extension}`;

    const uploadResult = await upload(buffer, filename, "avatars");

    // Create avatar record
    const [newAvatar] = await db
      .insert(avatars)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        avatarType: avatarType,
        imageUrl: uploadResult.url,
      })
      .returning();

    return NextResponse.json({ avatar: newAvatar as Avatar }, { status: 201 });
  } catch (error) {
    console.error("Error creating avatar:", error);
    return NextResponse.json(
      { error: "Failed to create avatar" },
      { status: 500 }
    );
  }
}
