import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { comfyui, getResolutionDimensions } from "@/lib/comfyui";
import { db } from "@/lib/db";
import { generations, generatedImages, generationHistory } from "@/lib/schema";
import { upload } from "@/lib/storage";
import type {
  GenerationSettings,
  GenerationWithImages,
  GenerationHistoryEntry,
  ImageResolution,
  AspectRatio,
} from "@/lib/types/generation";


interface RouteParams {
  params: Promise<{ id: string }>;
}

interface RefineRequestBody {
  instruction: string;
  selectedImageId?: string;
}

/**
 * POST /api/generate/[id]/refine
 * Refine an existing generation with additional instructions using ComfyUI
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as RefineRequestBody;
    const { instruction, selectedImageId } = body;

    // Validate instruction
    if (!instruction || typeof instruction !== "string" || instruction.trim().length === 0) {
      return NextResponse.json(
        { error: "Instruction is required" },
        { status: 400 }
      );
    }

    // Check if ComfyUI is available
    const isComfyUIAvailable = await comfyui.healthCheck();
    if (!isComfyUIAvailable) {
      return NextResponse.json(
        { error: "ComfyUI server is not running. Please start ComfyUI and try again." },
        { status: 503 }
      );
    }

    // Get the generation
    const [generation] = await db
      .select()
      .from(generations)
      .where(eq(generations.id, id));

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    if (generation.status !== "completed") {
      return NextResponse.json(
        { error: "Can only refine completed generations" },
        { status: 400 }
      );
    }

    // Get existing images for this generation
    const existingImages = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.generationId, id));

    if (existingImages.length === 0) {
      return NextResponse.json(
        { error: "No images to refine" },
        { status: 400 }
      );
    }

    // Select the image to use as reference
    let referenceImage = existingImages[0];
    if (selectedImageId) {
      const selected = existingImages.find((img) => img.id === selectedImageId);
      if (selected) {
        referenceImage = selected;
      }
    }

    if (!referenceImage) {
      return NextResponse.json(
        { error: "Reference image not found" },
        { status: 400 }
      );
    }

    // Update generation status to processing
    await db
      .update(generations)
      .set({ status: "processing" })
      .where(eq(generations.id, id));

    // Store the new user instruction in history
    await db.insert(generationHistory).values({
      generationId: id,
      role: "user",
      content: instruction.trim(),
      imageUrls: [referenceImage.imageUrl],
    });

    // Parse the settings
    const settings = generation.settings as GenerationSettings;

    try {
      // Get dimensions from resolution and aspect ratio
      const { width, height } = getResolutionDimensions(
        settings.resolution as ImageResolution,
        settings.aspectRatio as AspectRatio
      );

      // Upload reference image to ComfyUI
      const imageResponse = await fetch(referenceImage.imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch reference image");
      }
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const uploadResult = await comfyui.uploadImage(
        imageBuffer,
        `ref-${id}-refine-${Date.now()}.png`
      );

      // Build the refinement prompt (combine original prompt with instruction)
      const refinementPrompt = `${generation.prompt}. ${instruction.trim()}`;

      // Determine which workflow to use
      const workflow = settings.workflow || "flux2";

      // Generate refined image(s)
      const imageCount = settings.imageCount || 1;
      const savedImages = [];

      for (let i = 0; i < imageCount; i++) {
        // Build the workflow based on workflow type
        let comfyWorkflow;
        if (workflow === "z-image-turbo") {
          // Z Image Turbo uses previous output as input image
          comfyWorkflow = comfyui.buildZImageTurboWorkflow({
            prompt: refinementPrompt,
            inputImageFilename: uploadResult.name,
            steps: settings.steps ?? 9,
            cfg: settings.guidance ?? 1,
            denoise: settings.denoise ?? 0.4,
            seed: settings.seed !== undefined ? settings.seed + i : undefined,
            largestSize: settings.largestSize ?? 1024,
            shift: settings.shift ?? 3,
          });
        } else {
          // Default: Flux 2 workflow with reference image
          comfyWorkflow = comfyui.buildFlux2Workflow({
            prompt: refinementPrompt,
            width,
            height,
            steps: settings.steps ?? 20,
            guidance: settings.guidance ?? 4,
            seed: settings.seed !== undefined ? settings.seed + i : undefined,
            referenceImageFilename: uploadResult.name,
          });
        }

        // Queue the prompt
        const queueResult = await comfyui.queuePrompt(comfyWorkflow);

        // Wait for completion
        const history = await comfyui.waitForCompletion(queueResult.prompt_id);

        // Get the generated images from the output
        const outputNode = Object.values(history.outputs).find((output) => output.images?.length);
        if (!outputNode?.images?.length) {
          throw new Error("No images in generation output");
        }

        // Fetch and save each generated image
        for (const imageInfo of outputNode.images) {
          const generatedImageBuffer = await comfyui.getImage(
            imageInfo.filename,
            imageInfo.subfolder,
            imageInfo.type
          );

          const timestamp = Date.now();
          const filename = `gen-${id}-refine-${i}-${timestamp}.png`;

          // Upload to storage
          const storageResult = await upload(generatedImageBuffer, filename, "generations");

          // Save to database
          const [savedImage] = await db
            .insert(generatedImages)
            .values({
              generationId: id,
              imageUrl: storageResult.url,
            })
            .returning();

          if (savedImage) {
            savedImages.push(savedImage);
          }
        }
      }

      if (savedImages.length === 0) {
        throw new Error("No images were generated");
      }

      // Store the assistant response in history
      await db.insert(generationHistory).values({
        generationId: id,
        role: "assistant",
        content: `Generated ${savedImages.length} refined image(s) successfully`,
        imageUrls: savedImages.map((img) => img.imageUrl),
      });

      // Update generation status back to completed and update the prompt
      const newPrompt = `${generation.prompt} | Refinement: ${instruction.trim()}`;
      await db
        .update(generations)
        .set({
          status: "completed",
          prompt: newPrompt,
        })
        .where(eq(generations.id, id));

      // Fetch all images for this generation (including new ones)
      const allImages = await db
        .select()
        .from(generatedImages)
        .where(eq(generatedImages.generationId, id));

      // Fetch updated history
      const updatedHistory = await db
        .select()
        .from(generationHistory)
        .where(eq(generationHistory.generationId, id))
        .orderBy(asc(generationHistory.createdAt));

      // Build response
      const generationWithImages: GenerationWithImages = {
        id: generation.id,
        prompt: newPrompt,
        settings: settings,
        status: "completed",
        errorMessage: null,
        createdAt: generation.createdAt,
        updatedAt: new Date(),
        images: allImages.map((img) => ({
          id: img.id,
          generationId: img.generationId,
          imageUrl: img.imageUrl,
          createdAt: img.createdAt,
        })),
      };

      const historyResponse: GenerationHistoryEntry[] = updatedHistory.map((h) => ({
        id: h.id,
        generationId: h.generationId,
        role: h.role as "user" | "assistant",
        content: h.content,
        imageUrls: h.imageUrls as string[] | null,
        createdAt: h.createdAt,
      }));

      return NextResponse.json({
        generation: generationWithImages,
        history: historyResponse,
      });
    } catch (genError) {
      // Update generation status back to completed (refinement failed but original is still valid)
      await db
        .update(generations)
        .set({ status: "completed" })
        .where(eq(generations.id, id));

      const errorMessage = genError instanceof Error ? genError.message : "Failed to generate refined images";
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error refining generation:", error);
    const message = error instanceof Error ? error.message : "Failed to refine generation";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
