/**
 * @fileoverview Subject Card Component
 * 
 * A card that displays and allows editing of a single subject configuration.
 * Subjects represent people, characters, or objects in the generated image.
 * 
 * ## Subject Properties
 * 
 * | Property | Type | Description |
 * |----------|------|-------------|
 * | Avatar | Image | Reference image for the subject |
 * | Pose | Template | Body position/stance |
 * | Action | Template | What the subject is doing |
 * | Clothing | Template | What the subject is wearing |
 * | Expression | Template | Facial expression |
 * | Hair | Free text | Hair style/color |
 * | Makeup | Free text | Makeup description |
 * | Custom | Free text | Any additional details |
 * 
 * ## Card Layout
 * 
 * ```
 * ┌─────────────────────────────────────┐
 * │ Subject 1                      [🗑] │ <- Header with delete
 * ├─────────────────────────────────────┤
 * │ ┌──────┐                            │
 * │ │Avatar│ Avatar Name                │ <- Clickable avatar area
 * │ └──────┘ Click to change            │
 * │                                     │
 * │ Pose        [Select pose...      v] │
 * │ Action      [Select action...    v] │
 * │ Clothing    [Select clothing...  v] │
 * │ Expression  [Select expression...v] │
 * │ Hair        [____________________ ] │
 * │ Makeup      [____________________ ] │
 * │ Custom      [____________________ ] │
 * └─────────────────────────────────────┘
 * ```
 * 
 * @example
 * ```tsx
 * <SubjectCard
 *   subject={subjectConfig}
 *   index={0}
 *   onUpdate={(updates) => updateSubject(id, updates)}
 *   onRemove={() => removeSubject(id)}
 *   onSelectAvatar={() => openAvatarModal(id)}
 * />
 * ```
 * 
 * @module components/generate/prompt-builder/subject-card
 */

"use client";

import Image from "next/image";
import { Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  poseTemplates,
  actionTemplates,
  clothingTemplates,
  expressionTemplates,
} from "@/lib/data/templates";
import type { SubjectConfig } from "@/lib/types/generation";
import { TemplateSelector } from "./template-selector";

/**
 * Props for the SubjectCard component
 */
interface SubjectCardProps {
  /** The subject configuration to display/edit */
  subject: SubjectConfig;
  /** Zero-based index for display ("Subject 1", "Subject 2", etc.) */
  index: number;
  /** Callback when any subject property changes */
  onUpdate: (updates: Partial<SubjectConfig>) => void;
  /** Callback to remove this subject */
  onRemove: () => void;
  /** Callback to open avatar selector for this subject */
  onSelectAvatar: () => void;
}

/**
 * Subject configuration card with avatar and attribute editors
 * 
 * Displays a card with all editable properties for a single subject.
 * Template selectors are used for categorized attributes (pose, action, etc.)
 * while free-text inputs are used for open-ended properties (hair, makeup).
 * 
 * @param props - Component props
 * @returns Subject card with all edit controls
 */
export function SubjectCard({
  subject,
  index,
  onUpdate,
  onRemove,
  onSelectAvatar,
}: SubjectCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Subject {index + 1}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Avatar Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Reference Avatar</Label>
          <button
            type="button"
            onClick={onSelectAvatar}
            className="w-full p-3 border rounded-lg flex items-center gap-3 hover:border-primary/50 transition-colors"
          >
            {subject.avatarImageUrl ? (
              <>
                <div className="relative h-12 w-12 rounded overflow-hidden shrink-0">
                  <Image
                    src={subject.avatarImageUrl}
                    alt={subject.avatarName || "Avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{subject.avatarName}</div>
                  <div className="text-xs text-muted-foreground">Click to change</div>
                </div>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">No avatar selected</div>
                  <div className="text-xs text-muted-foreground">Click to select</div>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Pose */}
        <TemplateSelector
          label="Pose"
          templates={poseTemplates}
          value={subject.pose || ""}
          onChange={(value) => onUpdate({ pose: value })}
          placeholder="Select or type pose..."
        />

        {/* Action */}
        <TemplateSelector
          label="Action"
          templates={actionTemplates}
          value={subject.action || ""}
          onChange={(value) => onUpdate({ action: value })}
          placeholder="Select or type action..."
        />

        {/* Clothing */}
        <TemplateSelector
          label="Clothing"
          templates={clothingTemplates}
          value={subject.clothing || ""}
          onChange={(value) => onUpdate({ clothing: value })}
          placeholder="Select or type clothing..."
        />

        {/* Expression */}
        <TemplateSelector
          label="Expression"
          templates={expressionTemplates}
          value={subject.expression || ""}
          onChange={(value) => onUpdate({ expression: value })}
          placeholder="Select or type expression..."
        />

        {/* Hair */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Hair (optional)</Label>
          <Input
            value={subject.hair || ""}
            onChange={(e) => onUpdate({ hair: e.target.value })}
            placeholder="e.g., long brown hair, short blonde hair"
          />
        </div>

        {/* Makeup */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Makeup (optional)</Label>
          <Input
            value={subject.makeup || ""}
            onChange={(e) => onUpdate({ makeup: e.target.value })}
            placeholder="e.g., natural makeup, red lipstick"
          />
        </div>

        {/* Custom Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Custom Description (optional)</Label>
          <Input
            value={subject.customDescription || ""}
            onChange={(e) => onUpdate({ customDescription: e.target.value })}
            placeholder="Any additional details..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
