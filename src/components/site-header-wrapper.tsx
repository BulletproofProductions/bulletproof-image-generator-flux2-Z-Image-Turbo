"use client";

import { useGenerationContext } from "./generation-provider";
import { SiteHeader } from "./site-header";

export function SiteHeaderWrapper() {
  const { isGenerating } = useGenerationContext();
  console.log("[SiteHeaderWrapper] isGenerating from context:", isGenerating);
  return <SiteHeader isGenerating={isGenerating} />;
}
