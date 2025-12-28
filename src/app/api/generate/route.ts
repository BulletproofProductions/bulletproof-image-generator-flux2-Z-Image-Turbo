import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { comfyui, getResolutionDimensions } from "@/lib/comfyui";
import { db } from "@/lib/db";
import { generations, generatedImages as generatedImagesTable, generationHistory, avatars } from "@/lib/schema";
import { upload, readFromStorage } from "@/lib/storage";
import type {
  GenerationSettings,
  GenerationStatus,
  AvatarType,
  GenerationWithImages,
  ImageResolution,
  AspectRatio,
  WorkflowType,
} from "@/lib/types/generation";


interface ReferenceImage {
  imageUrl: string;
  type: AvatarType;
  name: string;
}

interface GenerateRequestBody {
  prompt: string;
  settings: GenerationSettings;
  referenceImages?: {
    avatarId: string;
    type: AvatarType;
  }[];
}

/**
 * POST /api/generate
 * Start a new image generation using ComfyUI
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const { prompt, settings, referenceImages = [] } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!settings || !settings.resolution || !settings.aspectRatio) {
      return NextResponse.json(
        { error: "Settings with resolution and aspectRatio are required" },
        { status: 400 }
      );
    }

    // Validate settings
    const validResolutions = ["1K", "2K", "4K"];
    const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
    const validImageCounts = [1, 2, 3, 4];

    if (!validResolutions.includes(settings.resolution)) {
      return NextResponse.json(
        { error: "Invalid resolution" },
        { status: 400 }
      );
    }

    if (!validAspectRatios.includes(settings.aspectRatio)) {
      return NextResponse.json(
        { error: "Invalid aspect ratio" },
        { status: 400 }
      );
    }

    if (settings.imageCount && !validImageCounts.includes(settings.imageCount)) {
      return NextResponse.json(
        { error: "Invalid image count. Must be 1-4" },
        { status: 400 }
      );
    }

    // Validate optional ComfyUI settings
    if (settings.steps !== undefined && (settings.steps < 1 || settings.steps > 50)) {
      return NextResponse.json(
        { error: "Steps must be between 1 and 50" },
        { status: 400 }
      );
    }

    if (settings.guidance !== undefined && (settings.guidance < 1 || settings.guidance > 10)) {
      return NextResponse.json(
        { error: "Guidance must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Validate workflow type
    const workflow = settings.workflow || "flux2";
    const validWorkflows: WorkflowType[] = ["flux2", "z-image-turbo"];
    if (!validWorkflows.includes(workflow)) {
      return NextResponse.json(
        { error: "Invalid workflow. Must be 'flux2' or 'z-image-turbo'" },
        { status: 400 }
      );
    }

    // Validate Z Image Turbo specific parameters
    if (workflow === "z-image-turbo") {
      if (settings.denoise !== undefined && (settings.denoise < 0.1 || settings.denoise > 1.0)) {
        return NextResponse.json(
          { error: "Denoise must be between 0.1 and 1.0" },
          { status: 400 }
        );
      }
      if (settings.largestSize !== undefined && (settings.largestSize < 256 || settings.largestSize > 4096)) {
        return NextResponse.json(
          { error: "Largest size must be between 256 and 4096" },
          { status: 400 }
        );
      }
    }

    // Validate Z Image Turbo requires an input image
    if (workflow === "z-image-turbo" && referenceImages.length === 0) {
      return NextResponse.json(
        { error: "Input image required for Z Image Turbo" },
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

    // Get avatar details for reference images
    let avatarDetails: ReferenceImage[] = [];
    if (referenceImages.length > 0) {
      const avatarIds = referenceImages.map((r) => r.avatarId);
      const avatarRecords = await db
        .select()
        .from(avatars)
        .where(inArray(avatars.id, avatarIds));

      // Map avatar records to reference images
      avatarDetails = referenceImages
        .map((ref) => {
          const avatar = avatarRecords.find((a) => a.id === ref.avatarId);
          if (!avatar) return null;
          return {
            imageUrl: avatar.imageUrl,
            type: avatar.avatarType as AvatarType,
            name: avatar.name,
          } as ReferenceImage;
        })
        .filter((a): a is ReferenceImage => a !== null);
    }

    // Create the generation record with 'processing' status
    const [generation] = await db
      .insert(generations)
      .values({
        prompt: prompt.trim(),
        settings: settings,
        status: "processing",
      })
      .returning();

    if (!generation) {
      return NextResponse.json(
        { error: "Failed to create generation record" },
        { status: 500 }
      );
    }

    // Store the initial user message in history
    await db.insert(generationHistory).values({
      generationId: generation.id,
      role: "user",
      content: prompt.trim(),
      imageUrls: avatarDetails.map((a) => a.imageUrl),
    });

    try {
      // Get dimensions from resolution and aspect ratio
      const { width, height } = getResolutionDimensions(
        settings.resolution as ImageResolution,
        settings.aspectRatio as AspectRatio
      );

      // Upload reference image to ComfyUI if provided
      let referenceImageFilename: string | undefined;
      if (avatarDetails.length > 0 && avatarDetails[0]) {
        const refImage = avatarDetails[0];
        // Read the reference image from storage
        const imageBuffer = await readFromStorage(refImage.imageUrl);
        const uploadResult = await comfyui.uploadImage(
          imageBuffer,
          `ref-${generation.id}-${Date.now()}.png`
        );
        referenceImageFilename = uploadResult.name;
      }

      // Generate images (loop for imageCount)
      const imageCount = settings.imageCount || 1;

      // Start generation asynchronously - don't wait for completion
      // This allows progress tracking via SSE while generation happens
      (async () => {
        try {
          const generatedImages = [];

          for (let i = 0; i < imageCount; i++) {

            // Build the workflow based on selected workflow type
            let comfyWorkflow;
            if (workflow === "z-image-turbo") {
              // Z Image Turbo requires input image - use reference image
              if (!referenceImageFilename) {
                throw new Error("Input image required for Z Image Turbo workflow");
              }
              comfyWorkflow = comfyui.buildZImageTurboWorkflow({
                prompt: prompt.trim(),
                inputImageFilename: referenceImageFilename,
                steps: settings.steps ?? 9,
                cfg: settings.guidance ?? 1,
                denoise: settings.denoise ?? 0.4,
                seed: settings.seed !== undefined ? settings.seed + i : undefined,
                largestSize: settings.largestSize ?? 1024,
                shift: settings.shift ?? 3,
              });
            } else {
              // Default: Flux 2 workflow
              comfyWorkflow = comfyui.buildFlux2Workflow({
                prompt: prompt.trim(),
                width,
                height,
                steps: settings.steps ?? 20,
                guidance: settings.guidance ?? 4,
                seed: settings.seed !== undefined ? settings.seed + i : undefined,
                referenceImageFilename,
              });
            }

            // Queue the prompt
            const queueResult = await comfyui.queuePrompt(comfyWorkflow);
            console.log(`[Generate API] Queued ${workflow} prompt for generation ${generation.id}: ${queueResult.prompt_id}`);

            // Store comfyuiPromptId in the database for this generation (only for the first image)
            if (i === 0 && queueResult.prompt_id) {
              await db.update(generations)
                .set({ comfyuiPromptId: queueResult.prompt_id })
                .where(eq(generations.id, generation.id));
              console.log(`[Generate API] Stored comfyuiPromptId for generation ${generation.id}: ${queueResult.prompt_id}`);
            }

            // Wait for completion
            const history = await comfyui.waitForCompletion(queueResult.prompt_id);

            // Get the generated images from the output
            const outputNode = Object.values(history.outputs).find((output) => output.images?.length);
            if (!outputNode?.images?.length) {
              throw new Error("No images in generation output");
            }

            // Fetch and save each generated image
            for (const imageInfo of outputNode.images) {
              const imageBuffer = await comfyui.getImage(
                imageInfo.filename,
                imageInfo.subfolder,
                imageInfo.type
              );

              // Convert buffer to base64 for storage
              const timestamp = Date.now();
              const filename = `gen-${generation.id}-${i}-${timestamp}.png`;

              // Upload to storage
              const uploadResult = await upload(imageBuffer, filename, "generations");

              // Save to database
              const [savedImage] = await db
                .insert(generatedImagesTable)
                .values({
                  generationId: generation.id,
                  imageUrl: uploadResult.url,
                })
                .returning();

              if (savedImage) {
                generatedImages.push(savedImage);
              }
            }
          }

          if (generatedImages.length === 0) {
            throw new Error("No images were generated");
          }

          // Store the assistant response in history
          await db.insert(generationHistory).values({
            generationId: generation.id,
            role: "assistant",
            content: `Generated ${generatedImages.length} image(s) successfully`,
            imageUrls: generatedImages.map((img) => img.imageUrl),
          });

          // Update generation status to completed
          await db
            .update(generations)
            .set({ status: "completed" })
            .where(eq(generations.id, generation.id));

          console.log(`[Generate API] Generation ${generation.id} completed successfully`);
        } catch (asyncError) {
          // Update generation status to failed
          const errorMessage = asyncError instanceof Error ? asyncError.message : "Generation failed";
          console.error(`[Generate API] Generation ${generation.id} failed:`, errorMessage);
          
          await db
            .update(generations)
            .set({
              status: "failed",
              errorMessage: errorMessage,
            })
            .where(eq(generations.id, generation.id));
        }
      })(); // Start async processing

      // Return immediately with the generation and ComfyUI prompt_id for progress tracking
      // The client will use the generation.id as the key to track progress via SSE
      // Try to fetch any images already generated (should be empty at first, but will be filled after completion)
      const images = await db
        .select()
        .from(generatedImagesTable)
        .where(eq(generatedImagesTable.generationId, generation.id));

      const generationWithImages: GenerationWithImages = {
        id: generation.id,
        prompt: generation.prompt,
        settings: generation.settings as GenerationSettings,
        status: generation.status as GenerationStatus,
        errorMessage: generation.errorMessage,
        comfyuiPromptId: generation.comfyuiPromptId,
        createdAt: generation.createdAt,
        updatedAt: generation.updatedAt,
        images: images || [],
      };

      return NextResponse.json({ generation: generationWithImages }, { status: 201 });
    } catch (genError) {
      // Update generation status to failed
      const errorMessage = genError instanceof Error ? genError.message : "Generation failed";
      await db
        .update(generations)
        .set({
          status: "failed",
          errorMessage: errorMessage,
        })
        .where(eq(generations.id, generation.id));

      return NextResponse.json(
        {
          error: errorMessage,
          generation: {
            id: generation.id,
            status: "failed",
            errorMessage: errorMessage,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error generating images:", error);
    const message = error instanceof Error ? error.message : "Failed to generate images";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
