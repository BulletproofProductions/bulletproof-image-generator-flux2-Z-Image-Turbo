"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";
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

interface ImageCardProps {
  image: SimpleGalleryImage;
  onClick?: () => void;
  className?: string;
}

export function ImageCard({ image, onClick, className }: ImageCardProps) {
  const prompt = image.generation.prompt;
  const truncatedPrompt = prompt.length > 100 ? `${prompt.slice(0, 100)}...` : prompt;
  const createdAt = new Date(image.createdAt);

  return (
    <Card
      className={`group relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${className || ""}`}
      onClick={onClick}
    >
      <div className="aspect-square relative">
        <Image
          src={image.imageUrl}
          alt={prompt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-sm line-clamp-2 mb-2">{truncatedPrompt}</p>
            <span className="text-xs text-white/60">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
