"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GenerationSettings, PaginatedResponse } from "@/lib/types/generation";
import { GalleryGrid } from "./gallery-grid";
import { ImageCard } from "./image-card";
import { ImageDetailModal } from "./image-detail-modal";

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

export function PublicGalleryClient() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [images, setImages] = useState<SimpleGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState<SimpleGalleryImage | null>(null);
  const pageSize = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch gallery images
  const fetchImages = useCallback(async (pageNum: number, searchQuery: string, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(`/api/gallery/public?${params}`);
      if (!response.ok) throw new Error("Failed to fetch images");

      const data: PaginatedResponse<SimpleGalleryImage> = await response.json();

      if (isInitial) {
        setImages(data.items);
      } else {
        setImages((prev) => [...prev, ...data.items]);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch and search changes
  useEffect(() => {
    fetchImages(1, debouncedSearch, true);
  }, [debouncedSearch, fetchImages]);

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchImages(nextPage, debouncedSearch, false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search images by prompt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* All Images Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">
            {debouncedSearch ? `Search Results` : "Latest Images"}
          </h2>
          {total > 0 && (
            <span className="text-sm text-muted-foreground">({total} total)</span>
          )}
        </div>

        <GalleryGrid
          loading={loading}
          isEmpty={images.length === 0}
          emptyMessage={
            debouncedSearch
              ? `No images found for "${debouncedSearch}"`
              : "No images yet. Generate some!"
          }
        >
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </GalleryGrid>

        {/* Load More Button */}
        {hasMore && !loading && images.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </section>

      {/* Image Detail Modal */}
      <ImageDetailModal
        image={selectedImage}
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      />
    </div>
  );
}
