/**
 * @fileoverview Image Card Component for Gallery Display
 * 
 * A card component for displaying a single generated image with
 * hover actions for download, view, and delete operations.
 * 
 * ## Features
 * 
 * - Square aspect ratio with cover fit
 * - Hover overlay with action buttons
 * - Download with generated filename
 * - Open in new tab
 * - Delete with confirmation dialog
 * - Optional selection state for multi-select
 * 
 * ## Hover Actions
 * 
 * | Action | Icon | Description |
 * |--------|------|-------------|
 * | Download | ⬇ | Downloads image to local machine |
 * | External | ↗ | Opens image in new browser tab |
 * | Delete | 🗑 | Removes image with confirmation |
 * 
 * @example
 * ```tsx
 * <ImageCard
 *   image={generatedImage}
 *   onDelete={handleDelete}
 *   showActions={true}
 *   isSelected={selectedId === image.id}
 *   onSelect={() => setSelectedId(image.id)}
 * />
 * ```
 * 
 * @module components/generate/results/image-card
 */

"use client";

import { useState } from "react";
import { Download, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { GeneratedImage } from "@/lib/types/generation";

/**
 * Props for the ImageCard component
 */
interface ImageCardProps {
  /** The generated image data */
  image: GeneratedImage;
  /** Callback to delete the image */
  onDelete?: (id: string) => void;
  /** Whether to show action buttons on hover */
  showActions?: boolean;
  /** Whether this card is currently selected */
  isSelected?: boolean;
  /** Callback when card is clicked for selection */
  onSelect?: () => void;
}

/**
 * Image card with hover actions for gallery display
 * 
 * Displays a generated image with an overlay of action buttons
 * that appear on hover. Supports selection state for multi-select
 * scenarios in the gallery.
 * 
 * @param props - Component props
 * @returns Image card with hover actions
 */
export function ImageCard({
  image,
  onDelete,
  showActions = true,
  isSelected = false,
  onSelect,
}: ImageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(image.imageUrl, "_blank");
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(image.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`overflow-hidden group cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-0 relative">
        <div className="aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.imageUrl}
            alt="Generated image"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hover overlay with actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenInNewTab();
                }}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>

              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Image</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this image? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
