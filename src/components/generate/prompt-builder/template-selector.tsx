/**
 * @fileoverview Template Selector Component
 * 
 * A dropdown-style selector for choosing prompt templates from a category.
 * Displays a button that opens a modal with searchable template options.
 * 
 * ## Features
 * 
 * - Opens a full modal with template grid
 * - Shows selected template name or custom value
 * - Clear button to reset selection
 * - Supports both predefined templates and custom text input
 * 
 * ## Display Logic
 * 
 * | Condition | Display |
 * |-----------|--------|
 * | Template selected | Template name |
 * | Custom value | Custom value text + "Custom:" label |
 * | Nothing selected | Placeholder text |
 * 
 * @example
 * ```tsx
 * <TemplateSelector
 *   label="Style"
 *   templates={styleTemplates}
 *   value={selectedStyle}
 *   onChange={setSelectedStyle}
 *   placeholder="Select a style..."
 * />
 * ```
 * 
 * @module components/generate/prompt-builder/template-selector
 */

"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Template } from "@/lib/types/generation";
import { TemplateSelectorModal } from "./template-selector-modal";

/**
 * Props for the TemplateSelector component
 */
interface TemplateSelectorProps {
  /** Label displayed above the selector */
  label: string;
  /** Array of templates to choose from */
  templates: Template[];
  /** Current value (template ID or custom text) */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text when nothing selected */
  placeholder?: string;
  /** Whether to allow custom text input (default: true) */
  allowCustom?: boolean;
}

/**
 * Template selector with modal picker
 * 
 * Renders a button that shows the current selection and opens
 * a modal when clicked. The modal displays a searchable grid
 * of templates with optional custom input.
 * 
 * @param props - Component props
 * @returns Template selector button with modal
 */
export function TemplateSelector({
  label,
  templates,
  value,
  onChange,
  placeholder = "Select an option...",
  allowCustom = true,
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  // Find the selected template
  const selectedTemplate = templates.find((t) => t.id === value);
  const displayValue = selectedTemplate?.name || value || "";
  const isCustomValue = value && !selectedTemplate;

  const handleSelect = (template: Template) => {
    onChange(template.id);
  };

  const handleCustomChange = (customValue: string) => {
    onChange(customValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 justify-between h-10 px-3 font-normal"
          onClick={() => setOpen(true)}
        >
          <span className={displayValue ? "text-foreground" : "text-muted-foreground"}>
            {displayValue || placeholder}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isCustomValue && (
        <p className="text-xs text-muted-foreground">Custom: {value}</p>
      )}

      <TemplateSelectorModal
        open={open}
        onOpenChange={setOpen}
        title={`Select ${label}`}
        templates={templates}
        selectedId={selectedTemplate?.id}
        onSelect={handleSelect}
        allowCustom={allowCustom}
        customValue={isCustomValue ? value : ""}
        onCustomChange={handleCustomChange}
      />
    </div>
  );
}
