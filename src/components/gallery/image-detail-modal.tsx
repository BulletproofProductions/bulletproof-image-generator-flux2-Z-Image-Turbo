"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Download, Copy, Check, ExternalLink, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GenerationSettings } from "@/lib/types/generation";

// Simplified gallery image type
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

interface ImageDetailModalProps {
  image: SimpleGalleryImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ImageDetailModal({
  image,
  open,
  onOpenChange,
}: ImageDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!image || !open || !mounted) return null;

  const prompt = image.generation.prompt;
  const settings = image.generation.settings;
  const createdAt = new Date(image.createdAt);

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comfyui-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const content = (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-background/80 hover:bg-background"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </Button>

      {/* Full-screen container */}
      <div className="h-full w-full flex flex-col p-4">
        {/* Image container - fills all available space */}
        <div className="relative flex-1 min-h-0">
          <Image
            src={image.imageUrl}
            alt={prompt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Details bar at bottom */}
        <div className="flex-shrink-0 pt-3 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left side: time and settings */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </span>
              <Badge variant="secondary" className="text-xs">{settings.resolution}</Badge>
              <Badge variant="secondary" className="text-xs">{settings.aspectRatio}</Badge>
            </div>

            {/* Right side: actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="h-8 gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy Prompt"}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 gap-1.5">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(image.imageUrl, "_blank")}
                className="h-8 gap-1.5"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open</span>
              </Button>
            </div>
          </div>

          {/* Prompt text */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{prompt}</p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
