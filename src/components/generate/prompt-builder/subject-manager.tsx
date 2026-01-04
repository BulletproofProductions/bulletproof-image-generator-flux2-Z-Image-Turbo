/**
 * @fileoverview Subject Manager Component
 * 
 * Manages the list of subjects in a prompt. Subjects represent people,
 * characters, or objects that appear in the generated image.
 * 
 * ## Responsibilities
 * 
 * - Display list of subject cards
 * - Add new subjects
 * - Remove existing subjects
 * - Open avatar selector modal for linking
 * - Pass updates to subject configurations
 * 
 * ## Subject Workflow
 * 
 * ```
 * 1. User clicks "Add Subject"
 * 2. New SubjectConfig created with empty values
 * 3. User clicks avatar area on SubjectCard
 * 4. AvatarSelectorModal opens (managed here)
 * 5. User selects avatar
 * 6. Avatar linked to subject via onLinkAvatar callback
 * ```
 * 
 * ## Empty State
 * 
 * When no subjects exist, displays a dashed border box with
 * instructions and an "Add Your First Subject" button.
 * 
 * @example
 * ```tsx
 * <SubjectManager
 *   subjects={subjects}
 *   onAdd={handleAddSubject}
 *   onRemove={handleRemoveSubject}
 *   onUpdate={handleUpdateSubject}
 *   onLinkAvatar={handleLinkAvatar}
 * />
 * ```
 * 
 * @module components/generate/prompt-builder/subject-manager
 */

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AvatarSelectorModal } from "@/components/avatars/avatar-selector-modal";
import { Button } from "@/components/ui/button";
import { useAvatars } from "@/hooks/use-avatars";
import type { SubjectConfig, Avatar } from "@/lib/types/generation";
import { SubjectCard } from "./subject-card";

/**
 * Props for the SubjectManager component
 */
interface SubjectManagerProps {
  /** Array of subject configurations */
  subjects: SubjectConfig[];
  /** Callback to add a new subject */
  onAdd: () => void;
  /** Callback to remove a subject by ID */
  onRemove: (id: string) => void;
  /** Callback to update subject properties */
  onUpdate: (id: string, updates: Partial<SubjectConfig>) => void;
  /** Callback to link/unlink an avatar to a subject */
  onLinkAvatar: (subjectId: string, avatar: Avatar | null) => void;
}

/**
 * Subject list manager with avatar selection
 * 
 * Coordinates the list of subjects and the avatar selector modal.
 * Each subject is rendered as a SubjectCard with its own edit controls.
 * 
 * @param props - Component props
 * @returns Subject list with management controls
 */
export function SubjectManager({
  subjects,
  onAdd,
  onRemove,
  onUpdate,
  onLinkAvatar,
}: SubjectManagerProps) {
  const { avatars, isLoading: avatarsLoading } = useAvatars();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [selectingForSubjectId, setSelectingForSubjectId] = useState<string | null>(null);

  const handleOpenAvatarSelector = (subjectId: string) => {
    setSelectingForSubjectId(subjectId);
    setAvatarModalOpen(true);
  };

  const handleSelectAvatar = (avatar: Avatar | null) => {
    if (selectingForSubjectId) {
      onLinkAvatar(selectingForSubjectId, avatar);
    }
    setSelectingForSubjectId(null);
  };

  // Get the currently selected avatar ID for the subject being edited
  const selectedAvatarId = selectingForSubjectId
    ? subjects.find((s) => s.id === selectingForSubjectId)?.avatarId
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Subjects</h3>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <div className="p-8 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No subjects added yet</p>
          <Button variant="outline" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Subject
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={index}
              onUpdate={(updates) => onUpdate(subject.id, updates)}
              onRemove={() => onRemove(subject.id)}
              onSelectAvatar={() => handleOpenAvatarSelector(subject.id)}
            />
          ))}
        </div>
      )}

      {/* Avatar Selector Modal */}
      <AvatarSelectorModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        avatars={avatars}
        isLoading={avatarsLoading}
        selectedId={selectedAvatarId}
        onSelect={handleSelectAvatar}
      />
    </div>
  );
}
