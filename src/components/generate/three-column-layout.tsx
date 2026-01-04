/**
 * @fileoverview Three-Column Layout Component for the Generation Page
 * 
 * This component provides the main layout structure for the image generation interface.
 * It implements a responsive design pattern that switches between:
 * 
 * - **Desktop (lg+)**: Three collapsible columns
 *   - Left: Prompt Builder panel
 *   - Center: Preview & Generate panel
 *   - Right: Results panel
 * 
 * - **Mobile/Tablet (<lg)**: Tabbed interface
 *   - Builder tab
 *   - Preview tab
 *   - Results tab
 * 
 * ## Features
 * 
 * - Collapsible side panels with smooth animations
 * - Fixed-height viewport with internal scrolling
 * - Persistent collapse state during session
 * - Responsive grid layout with configurable column widths
 * 
 * ## Layout Algorithm
 * 
 * Desktop grid columns are calculated based on collapse state:
 * ```
 * Both open:     [350px/400px] [1fr] [350px/400px]
 * Left collapsed: [1fr] [350px/400px]
 * Right collapsed: [350px/400px] [1fr]
 * Both collapsed: [1fr]
 * ```
 * 
 * @example
 * ```tsx
 * <ThreeColumnLayout
 *   leftPanel={<PromptBuilderPanel />}
 *   middlePanel={<PreviewPanel />}
 *   rightPanel={<ResultsPanel />}
 * />
 * ```
 * 
 * @module components/generate/three-column-layout
 */

"use client";

import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Props for the ThreeColumnLayout component
 */
interface ThreeColumnLayoutProps {
  /** Content for the left panel (typically PromptBuilderPanel) */
  leftPanel: ReactNode;
  /** Content for the middle panel (typically PreviewPanel) */
  middlePanel: ReactNode;
  /** Content for the right panel (typically ResultsPanel) */
  rightPanel: ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Three-column responsive layout with collapsible side panels
 * 
 * Renders as a tabbed interface on mobile and a three-column grid on desktop.
 * Side panels can be collapsed to maximize the center content area.
 * 
 * @param props - Component props
 * @param props.leftPanel - Left panel content (Prompt Builder)
 * @param props.middlePanel - Center panel content (Preview & Generate)
 * @param props.rightPanel - Right panel content (Results)
 * @param props.className - Additional CSS classes
 * 
 * @returns The layout component with responsive behavior
 */
export function ThreeColumnLayout({
  leftPanel,
  middlePanel,
  rightPanel,
  className,
}: ThreeColumnLayoutProps) {
  // Track panel collapse state (session-only, not persisted)
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Layout - Tabbed Interface 
          Uses shadcn/ui Tabs for a familiar mobile navigation pattern.
          Each tab contains a full-height scrollable panel. */}
      <div className={cn("lg:hidden", className)}>
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="builder" className="mt-0">
            <div className="rounded-lg border bg-card min-h-[calc(100vh-12rem)] overflow-y-auto">
              {leftPanel}
            </div>
          </TabsContent>
          <TabsContent value="preview" className="mt-0">
            <div className="rounded-lg border bg-card min-h-[calc(100vh-12rem)] overflow-y-auto">
              {middlePanel}
            </div>
          </TabsContent>
          <TabsContent value="results" className="mt-0">
            <div className="rounded-lg border bg-card min-h-[calc(100vh-12rem)] overflow-y-auto">
              {rightPanel}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Layout - Three Columns
          Uses CSS Grid with dynamic column definitions based on collapse state.
          Panel widths: 350px (lg) / 400px (xl) for side panels, 1fr for center. */}
      <div
        className={cn(
          "hidden lg:grid gap-4 h-full transition-all duration-300",
          // Dynamic grid columns based on collapse state
          leftCollapsed && rightCollapsed
            ? "grid-cols-1"
            : leftCollapsed
              ? "grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]"
              : rightCollapsed
                ? "grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]"
                : "grid-cols-[350px_1fr_350px] xl:grid-cols-[400px_1fr_400px]",
          className
        )}
      >
        {/* Left Panel - Prompt Builder
            Fixed height with internal scroll for long template lists.
            Collapse button positioned at panel edge. */}
        {!leftCollapsed && (
          <div className="h-[calc(100vh-8rem)] overflow-hidden relative">
            <div className="h-full overflow-y-auto rounded-lg border bg-card">
              {leftPanel}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftCollapsed(true)}
              className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted z-10"
              title="Collapse panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Collapsed Left Panel Button
            Fixed position button to restore the left panel.
            Vertical text indicates the panel content. */}
        {leftCollapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLeftCollapsed(false)}
            className="fixed left-4 top-1/2 -translate-y-1/2 h-auto py-2 px-3 flex flex-col gap-1 z-10"
            title="Expand prompt builder"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs writing-mode-vertical">Builder</span>
          </Button>
        )}

        {/* Middle Panel - Preview & Generate
            Always visible, takes remaining space (1fr).
            Contains prompt preview and generate button. */}
        <div className="h-[calc(100vh-8rem)] overflow-hidden">
          <div className="h-full overflow-y-auto rounded-lg border bg-card">
            {middlePanel}
          </div>
        </div>

        {/* Right Panel - Results
            Shows generation results and history.
            Collapse button positioned at panel edge. */}
        {!rightCollapsed && (
          <div className="h-[calc(100vh-8rem)] overflow-hidden relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightCollapsed(true)}
              className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted z-10"
              title="Collapse panel"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="h-full overflow-y-auto rounded-lg border bg-card">
              {rightPanel}
            </div>
          </div>
        )}

        {/* Collapsed Right Panel Button
            Fixed position button to restore the right panel. */}
        {rightCollapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRightCollapsed(false)}
            className="fixed right-4 top-1/2 -translate-y-1/2 h-auto py-2 px-3 flex flex-col gap-1 z-10"
            title="Expand results"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs writing-mode-vertical">Results</span>
          </Button>
        )}
      </div>
    </>
  );
}
