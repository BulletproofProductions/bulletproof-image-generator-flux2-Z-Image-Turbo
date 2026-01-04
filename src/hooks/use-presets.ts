/**
 * @fileoverview Preset Management Hook - Save and Load Prompt Builder Configurations
 * 
 * Presets allow users to save their prompt builder configurations (template
 * selections, subjects, custom prompts) and reload them later. This enables
 * quick switching between different generation styles and workflows.
 * 
 * ## Preset Structure
 * 
 * A preset contains:
 * - **name**: User-defined name for the preset
 * - **config**: Complete PromptBuilderState snapshot
 *   - Template selections (style, lighting, location, etc.)
 *   - Subject configurations (but NOT linked avatar IDs)
 *   - Custom prompt text
 * 
 * ## API Endpoints
 * 
 * - GET /api/presets - List all presets
 * - POST /api/presets - Create a new preset
 * - PUT /api/presets/:id - Update preset name or config
 * - DELETE /api/presets/:id - Delete a preset
 * 
 * ## Usage Example
 * 
 * ```tsx
 * const { presets, createPreset, deletePreset } = usePresets();
 * const { state } = usePromptBuilder();
 * 
 * // Save current prompt builder state as a preset
 * const handleSave = async () => {
 *   const success = await createPreset("Corporate Portrait", {
 *     promptBuilderState: state,
 *     settings: { resolution: "2K", aspectRatio: "1:1" }
 *   });
 *   if (success) console.log("Preset saved!");
 * };
 * 
 * // Load a preset into the prompt builder
 * const handleLoad = (preset: Preset) => {
 *   loadFromPreset(preset.config.promptBuilderState);
 * };
 * ```
 * 
 * @module hooks/use-presets
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  Preset,
  PresetConfig,
  CreatePresetInput,
  UpdatePresetInput,
} from "@/lib/types/generation";

/**
 * Return type for the usePresets hook
 */
interface UsePresetsReturn {
  /** List of all presets */
  presets: Preset[];
  /** Whether presets are being loaded */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Refresh the presets list from the API */
  fetchPresets: () => Promise<void>;
  /** Create a new preset from current state */
  createPreset: (name: string, config: PresetConfig) => Promise<boolean>;
  /** Update an existing preset */
  updatePreset: (id: string, input: UpdatePresetInput) => Promise<boolean>;
  /** Delete a preset */
  deletePreset: (id: string) => Promise<boolean>;
  /** Find a preset by ID (from local state) */
  getPresetById: (id: string) => Preset | undefined;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Preset Management Hook
 * 
 * Provides CRUD operations for managing generation presets.
 * Automatically fetches presets on mount and maintains local state
 * synchronized with the server.
 * 
 * @returns Object containing preset state and management functions
 */
export function usePresets(): UsePresetsReturn {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // API OPERATIONS
  // ============================================================================

  /**
   * Fetch all presets from the API
   * Called automatically on mount and can be called manually to refresh
   */
  const fetchPresets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/presets");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch presets");
      }

      setPresets(data.presets);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch presets";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new preset with the given name and configuration
   * 
   * @param name - User-friendly name for the preset
   * @param config - PresetConfig containing the state to save
   * @returns true if created successfully, false on error
   */
  const createPreset = useCallback(
    async (name: string, config: PresetConfig): Promise<boolean> => {
      try {
        setError(null);

        const input: CreatePresetInput = { name, config };

        const response = await fetch("/api/presets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create preset");
        }

        // Optimistically add the new preset to local state
        setPresets((prev) => [data.preset, ...prev]);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create preset";
        setError(message);
        return false;
      }
    },
    []
  );

  /**
   * Update an existing preset's name or configuration
   * 
   * @param id - Preset ID to update
   * @param input - Updated fields (name, config - both optional)
   * @returns true if updated successfully, false on error
   */
  const updatePreset = useCallback(
    async (id: string, input: UpdatePresetInput): Promise<boolean> => {
      try {
        setError(null);

        const response = await fetch(`/api/presets/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update preset");
        }

        // Update preset in local state
        setPresets((prev) =>
          prev.map((preset) => (preset.id === id ? data.preset : preset))
        );
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update preset";
        setError(message);
        return false;
      }
    },
    []
  );

  /**
   * Delete a preset by ID
   * 
   * @param id - Preset ID to delete
   * @returns true if deleted successfully, false on error
   */
  const deletePreset = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/presets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete preset");
      }

      // Remove from local state
      setPresets((prev) => prev.filter((preset) => preset.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete preset";
      setError(message);
      return false;
    }
  }, []);

  /**
   * Find a preset by ID from local state
   * Does not make an API call - uses cached data
   * 
   * @param id - Preset ID to find
   * @returns The Preset if found, undefined otherwise
   */
  const getPresetById = useCallback(
    (id: string): Preset | undefined => {
      return presets.find((preset) => preset.id === id);
    },
    [presets]
  );

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch presets on mount
  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  return {
    presets,
    isLoading,
    error,
    fetchPresets,
    createPreset,
    updatePreset,
    deletePreset,
    getPresetById,
    clearError,
  };
}
