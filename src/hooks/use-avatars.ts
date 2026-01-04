/**
 * @fileoverview Avatar Management Hook - CRUD Operations for Reference Images
 * 
 * Avatars are reference images (people or objects) that can be linked to subjects
 * in the prompt builder. When linked, the avatar's image is used as a reference
 * for img2img generation, and its description is included in the prompt.
 * 
 * ## Avatar Types
 * 
 * - **human**: Reference photos of people (headshots, full body)
 * - **object**: Reference images of products, objects, or items
 * 
 * ## API Endpoints
 * 
 * - GET /api/avatars - List all avatars
 * - POST /api/avatars - Create avatar (multipart/form-data with image)
 * - PUT /api/avatars/:id - Update avatar metadata
 * - DELETE /api/avatars/:id - Delete avatar and image
 * 
 * ## Image Storage
 * 
 * Images are stored via @vercel/blob in production or local filesystem in
 * development. The imageUrl is stored in the database.
 * 
 * ## Usage Example
 * 
 * ```tsx
 * const { avatars, createAvatar, deleteAvatar, isLoading } = useAvatars();
 * 
 * // Create a new avatar with image
 * const handleUpload = async (file: File) => {
 *   const avatar = await createAvatar(
 *     { name: "John Doe", avatarType: "human", description: "CEO portrait" },
 *     file
 *   );
 *   if (avatar) {
 *     console.log("Avatar created:", avatar.id);
 *   }
 * };
 * 
 * // Delete an avatar
 * const handleDelete = async (id: string) => {
 *   const success = await deleteAvatar(id);
 *   if (success) console.log("Avatar deleted");
 * };
 * ```
 * 
 * @module hooks/use-avatars
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { Avatar, CreateAvatarInput, UpdateAvatarInput } from "@/lib/types/generation";

/**
 * Return type for the useAvatars hook
 */
interface UseAvatarsReturn {
  /** List of all avatars */
  avatars: Avatar[];
  /** Whether avatars are being loaded */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Refresh the avatars list from the API */
  fetchAvatars: () => Promise<void>;
  /** Create a new avatar with an image file */
  createAvatar: (input: CreateAvatarInput, image: File) => Promise<Avatar | null>;
  /** Update an existing avatar's metadata */
  updateAvatar: (id: string, input: UpdateAvatarInput) => Promise<Avatar | null>;
  /** Delete an avatar and its image */
  deleteAvatar: (id: string) => Promise<boolean>;
  /** Find an avatar by ID (from local state) */
  getAvatarById: (id: string) => Avatar | undefined;
}

/**
 * Avatar Management Hook
 * 
 * Provides CRUD operations for managing avatars (reference images).
 * Automatically fetches avatars on mount and maintains local state
 * synchronized with the server.
 * 
 * @returns Object containing avatar state and management functions
 */
export function useAvatars(): UseAvatarsReturn {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // API OPERATIONS
  // ============================================================================

  /**
   * Fetch all avatars from the API
   * Called automatically on mount and can be called manually to refresh
   */
  const fetchAvatars = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/avatars");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch avatars");
      }

      setAvatars(data.avatars);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch avatars";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new avatar with an image file
   * Uses FormData for multipart upload
   * 
   * @param input - Avatar metadata (name, type, description)
   * @param image - Image file to upload
   * @returns The created Avatar, or null on error
   */
  const createAvatar = useCallback(
    async (input: CreateAvatarInput, image: File): Promise<Avatar | null> => {
      try {
        setError(null);

        // Build FormData for multipart upload
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("avatarType", input.avatarType);
        formData.append("image", image);
        if (input.description) {
          formData.append("description", input.description);
        }

        const response = await fetch("/api/avatars", {
          method: "POST",
          body: formData, // No Content-Type header - browser sets it with boundary
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create avatar");
        }

        // Optimistically add the new avatar to local state
        setAvatars((prev) => [data.avatar, ...prev]);
        return data.avatar;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create avatar";
        setError(message);
        return null;
      }
    },
    []
  );

  /**
   * Update an existing avatar's metadata
   * Note: Image cannot be updated - delete and recreate instead
   * 
   * @param id - Avatar ID to update
   * @param input - Updated metadata (name, description)
   * @returns The updated Avatar, or null on error
   */
  const updateAvatar = useCallback(
    async (id: string, input: UpdateAvatarInput): Promise<Avatar | null> => {
      try {
        setError(null);

        const response = await fetch(`/api/avatars/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update avatar");
        }

        // Update avatar in local state
        setAvatars((prev) =>
          prev.map((avatar) => (avatar.id === id ? data.avatar : avatar))
        );
        return data.avatar;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update avatar";
        setError(message);
        return null;
      }
    },
    []
  );

  /**
   * Delete an avatar and its associated image
   * 
   * @param id - Avatar ID to delete
   * @returns true if deleted successfully, false on error
   */
  const deleteAvatar = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch(`/api/avatars/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete avatar");
      }

      // Remove from local state
      setAvatars((prev) => prev.filter((avatar) => avatar.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete avatar";
      setError(message);
      return false;
    }
  }, []);

  /**
   * Find an avatar by ID from local state
   * Does not make an API call - uses cached data
   * 
   * @param id - Avatar ID to find
   * @returns The Avatar if found, undefined otherwise
   */
  const getAvatarById = useCallback(
    (id: string): Avatar | undefined => {
      return avatars.find((avatar) => avatar.id === id);
    },
    [avatars]
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch avatars on mount
  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  return {
    avatars,
    isLoading,
    error,
    fetchAvatars,
    createAvatar,
    updateAvatar,
    deleteAvatar,
    getAvatarById,
  };
}
