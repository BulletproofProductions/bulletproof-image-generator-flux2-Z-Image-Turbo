"use client";

import { createContext, useContext, ReactNode } from "react";
import { useGeneration, type UseGenerationReturn } from "@/hooks/use-generation";

type GenerationContextType = UseGenerationReturn;

const GenerationContext = createContext<GenerationContextType | undefined>(
  undefined
);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const generationState = useGeneration();

  return (
    <GenerationContext.Provider value={generationState}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGenerationContext(): GenerationContextType {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error(
      "[useGenerationContext] Must be used within GenerationProvider"
    );
  }
  return context;
}
