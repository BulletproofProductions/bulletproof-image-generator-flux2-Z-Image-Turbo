import { Metadata } from "next";
import { PublicGalleryClient } from "@/components/gallery/public-gallery-client";

export const metadata: Metadata = {
  title: "Gallery - Bulletproof Productions",
  description: "Explore all AI-generated images",
};

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="text-muted-foreground mt-2">
          Explore all AI-generated images
        </p>
      </div>
      <PublicGalleryClient />
    </div>
  );
}
