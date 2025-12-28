"use client";

import { toast } from "sonner";
import { GenerationErrorAlert } from "@/components/generate/generation-error-alert";
import { PreviewPanel } from "@/components/generate/preview/preview-panel";
import { PromptBuilderPanel } from "@/components/generate/prompt-builder/prompt-builder-panel";
import { ResultsPanel } from "@/components/generate/results/results-panel";
import { ThreeColumnLayout } from "@/components/generate/three-column-layout";
import { useGenerationContext } from "@/components/generation-provider";
import { usePresets } from "@/hooks/use-presets";
import { usePromptBuilder } from "@/hooks/use-prompt-builder";
import type { Preset, PresetConfig } from "@/lib/types/generation";

export default function HomePage() {
  // Prompt builder state
  const {
    state,
    settings,
    setLocation,
    setLighting,
    setCamera,
    setStyle,
    setCustomPrompt,
    setSettings,
    setWorkflow,
    // FLUX.2 Specific Setters
    setMood,
    setCameraModel,
    setLens,
    setColorPalette,
    addSubject,
    removeSubject,
    updateSubject,
    linkAvatarToSubject,
    assembledPrompt,
    loadFromPreset,
  } = usePromptBuilder();

  // Presets state
  const {
    presets,
    isLoading: presetsLoading,
    createPreset,
    deletePreset,
  } = usePresets();

  // Generation state
  const {
    currentGeneration,
    isGenerating,
    isRefining,
    error,
    progress,
    currentPromptId,
    currentImageIndex,
    totalImages,
    generate,
    refine,
    clearError,
    completeGeneration,
  } = useGenerationContext();

  // Handle generation
  const handleGenerate = async () => {
    if (!assembledPrompt) {
      toast.error("Please build a prompt before generating");
      return;
    }

    // Get reference images from subjects with avatars
    const referenceImages = state.subjects
      .filter((s) => s.avatarId)
      .map((s) => ({
        avatarId: s.avatarId!,
        type: "human" as const,
      }));

    // Validate that at least one subject with an avatar is selected
    if (referenceImages.length === 0) {
      toast.error("Please add at least one subject and select an avatar as a reference image");
      return;
    }

    const generateInput = {
      prompt: assembledPrompt,
      settings,
      referenceImages,
    };
    const result = await generate(generateInput);

    if (result) {
      toast.success("Images generated successfully!");
    }
  };

  // Handle generation progress completion
  const handleProgressComplete = () => {
    completeGeneration();
  };

  // Handle generation progress error
  const handleProgressError = () => {
    completeGeneration();
  };

  // Handle refinement
  const handleRefine = async (instruction: string, selectedImageId?: string) => {
    if (!currentGeneration) return;

    const refineInput = {
      generationId: currentGeneration.id,
      instruction,
      ...(selectedImageId && { selectedImageId }),
    };
    const result = await refine(refineInput);

    if (result) {
      toast.success("Refinement complete!");
    }
  };

  // Preset handlers
  const handleSavePreset = async (name: string, config: PresetConfig): Promise<boolean> => {
    const success = await createPreset(name, config);
    if (success) {
      toast.success(`Preset "${name}" saved successfully!`);
    } else {
      toast.error("Failed to save preset");
    }
    return success;
  };

  const handleLoadPreset = (preset: Preset) => {
    loadFromPreset({
      location: preset.config.location ?? "",
      lighting: preset.config.lighting ?? "",
      camera: preset.config.camera ?? "",
      style: preset.config.style ?? "",
      subjects: preset.config.subjects,
      customPrompt: preset.config.customPrompt ?? "",
      // FLUX.2 Specific Fields
      mood: preset.config.mood ?? "",
      cameraModel: preset.config.cameraModel ?? "",
      lens: preset.config.lens ?? "",
      colorPalette: preset.config.colorPalette ?? "",
    });
    toast.success(`Loaded preset "${preset.name}"`);
  };

  const handleDeletePreset = async (id: string): Promise<boolean> => {
    const preset = presets.find((p) => p.id === id);
    const success = await deletePreset(id);
    if (success) {
      toast.success(`Preset "${preset?.name}" deleted`);
    } else {
      toast.error("Failed to delete preset");
    }
    return success;
  };

  // Get current config for preset saving
  const currentConfig: PresetConfig = {
    ...(state.location && { location: state.location }),
    ...(state.lighting && { lighting: state.lighting }),
    ...(state.camera && { camera: state.camera }),
    ...(state.style && { style: state.style }),
    subjects: state.subjects,
    ...(state.customPrompt && { customPrompt: state.customPrompt }),
    // FLUX.2 Specific Fields
    ...(state.mood && { mood: state.mood }),
    ...(state.cameraModel && { cameraModel: state.cameraModel }),
    ...(state.lens && { lens: state.lens }),
    ...(state.colorPalette && { colorPalette: state.colorPalette }),
  };

  // Get generated image URLs
  const generatedImages = currentGeneration?.images?.map((img: any) => img.imageUrl) ?? [];

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Error Alert */}
      {error && (
        <GenerationErrorAlert
          error={error}
          onDismiss={clearError}
          onRetry={handleGenerate}
        />
      )}

      <ThreeColumnLayout
        leftPanel={
          <PromptBuilderPanel
            location={state.location}
            lighting={state.lighting}
            camera={state.camera}
            style={state.style}
            customPrompt={state.customPrompt}
            mood={state.mood}
            cameraModel={state.cameraModel}
            lens={state.lens}
            colorPalette={state.colorPalette}
            onLocationChange={setLocation}
            onLightingChange={setLighting}
            onCameraChange={setCamera}
            onStyleChange={setStyle}
            onCustomPromptChange={setCustomPrompt}
            onMoodChange={setMood}
            onCameraModelChange={setCameraModel}
            onLensChange={setLens}
            onColorPaletteChange={setColorPalette}
            subjects={state.subjects}
            onAddSubject={addSubject}
            onRemoveSubject={removeSubject}
            onUpdateSubject={updateSubject}
            onLinkAvatarToSubject={linkAvatarToSubject}
          />
        }
        middlePanel={
          <PreviewPanel
            assembledPrompt={assembledPrompt}
            settings={settings}
            onSettingsChange={setSettings}
            onWorkflowChange={setWorkflow}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            hasReferenceImage={state.subjects.some((s) => !!s.avatarId)}
            currentPromptId={currentPromptId}
            currentImageIndex={currentImageIndex}
            totalImages={totalImages}
            progress={progress}
            currentConfig={currentConfig}
            presets={presets}
            presetsLoading={presetsLoading}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={handleDeletePreset}
            onProgressComplete={handleProgressComplete}
            onProgressError={handleProgressError}
          />
        }
        rightPanel={
          <ResultsPanel
            images={generatedImages}
            isGenerating={isGenerating}
            expectedCount={settings.imageCount}
            generationId={currentGeneration?.id}
            onRefine={handleRefine}
            isRefining={isRefining}
          />
        }
      />
    </div>
  );
}
