"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  Smile,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  CustomSectionConfig,
  CustomSectionItem,
  InternalLinkItem,
  ExternalLinkItem,
} from "@/types/sidebar-customization";
import {
  isInternalLinkItem,
  isExternalLinkItem,
  isDividerItem,
} from "@/types/sidebar-customization";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface CustomLinkEditorProps {
  section: CustomSectionConfig;
  onAddItem: (
    sectionId: string,
    item: Omit<CustomSectionItem, "id" | "sortOrder">
  ) => Promise<void>;
  onRemoveItem: (sectionId: string, itemId: string) => Promise<void>;
  onReorderItems?: (sectionId: string, itemIds: string[]) => Promise<void>;
}

type LinkType = "internal" | "external";

interface NewLinkForm {
  type: LinkType;
  label: string;
  url: string;
  emoji: string | null;
  openInNewTab: boolean;
}

const INITIAL_FORM: NewLinkForm = {
  type: "internal",
  label: "",
  url: "",
  emoji: null,
  openInNewTab: true,
};

export function CustomLinkEditor({
  section,
  onAddItem,
  onRemoveItem,
  onReorderItems,
}: CustomLinkEditorProps) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [form, setForm] = useState<NewLinkForm>(INITIAL_FORM);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get sorted items
  const sortedItems = [...section.items].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!onReorderItems) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const itemIds = sortedItems.map((item) => item.id);
    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...itemIds];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);

    await onReorderItems(section.id, newOrder);
    toast.success("Link order updated");
  };

  const handleAddLink = async () => {
    if (!form.label.trim() || !form.url.trim()) return;

    setIsSubmitting(true);
    try {
      if (form.type === "internal") {
        // Ensure internal links start with /
        const href = form.url.startsWith("/") ? form.url : `/${form.url}`;
        const internalItem: Omit<InternalLinkItem, "id" | "sortOrder"> = {
          type: "internal-link",
          label: form.label.trim(),
          href,
          icon: null,
          emoji: form.emoji,
        };
        await onAddItem(section.id, internalItem);
      } else {
        // Ensure external links have protocol
        let url = form.url.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }
        const externalItem: Omit<ExternalLinkItem, "id" | "sortOrder"> = {
          type: "external-link",
          label: form.label.trim(),
          url,
          icon: null,
          emoji: form.emoji,
          openInNewTab: form.openInNewTab,
        };
        await onAddItem(section.id, externalItem);
      }

      toast.success("Link added");
      setForm(INITIAL_FORM);
      setIsAddingLink(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await onRemoveItem(section.id, itemId);
    toast.success("Link removed");
  };

  const handleEmojiSelect = (emojiData: { native: string }) => {
    setForm((prev) => ({ ...prev, emoji: emojiData.native }));
    setShowEmojiPicker(false);
  };

  const handleClearEmoji = () => {
    setForm((prev) => ({ ...prev, emoji: null }));
  };

  const handleCloseDialog = () => {
    setForm(INITIAL_FORM);
    setShowEmojiPicker(false);
    setIsAddingLink(false);
  };

  return (
    <div className="space-y-3">
      {/* Links List */}
      {sortedItems.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {sortedItems.map((item) => (
                <SortableLinkItem
                  key={item.id}
                  item={item}
                  onRemove={() => handleRemoveItem(item.id)}
                  canReorder={!!onReorderItems}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>No links yet</p>
          <p className="text-xs">Add links to create shortcuts in your sidebar</p>
        </div>
      )}

      {/* Add Link Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setIsAddingLink(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Link
      </Button>

      {/* Add Link Dialog */}
      <Dialog open={isAddingLink} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Add Link
            </DialogTitle>
            <DialogDescription>
              Add a link to your custom section.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Link Type */}
            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select
                value={form.type}
                onValueChange={(value: LinkType) =>
                  setForm((prev) => ({ ...prev, type: value, url: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <span>App Page</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="external">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>External URL</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="link-label">Label</Label>
              <Input
                id="link-label"
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="e.g., My Recipes, Blog"
              />
            </div>

            {/* URL/Path */}
            <div className="space-y-2">
              <Label htmlFor="link-url">
                {form.type === "internal" ? "App Path" : "URL"}
              </Label>
              <Input
                id="link-url"
                value={form.url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder={
                  form.type === "internal"
                    ? "/app/recipes"
                    : "https://example.com"
                }
              />
              {form.type === "internal" && (
                <p className="text-xs text-muted-foreground">
                  Start with / for app pages (e.g., /app/recipes, /app/planner)
                </p>
              )}
            </div>

            {/* Emoji */}
            <div className="space-y-2">
              <Label>Icon (Optional)</Label>
              <div className="flex items-center gap-2">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 w-10 text-lg",
                        !form.emoji && "text-muted-foreground"
                      )}
                    >
                      {form.emoji || <Smile className="h-4 w-4" />}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="auto"
                      previewPosition="none"
                      skinTonePosition="search"
                    />
                  </PopoverContent>
                </Popover>

                {form.emoji && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearEmoji}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Open in New Tab (external only) */}
            {form.type === "external" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="new-tab" className="text-sm">
                  Open in new tab
                </Label>
                <Switch
                  id="new-tab"
                  checked={form.openInNewTab}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, openInNewTab: checked }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLink}
              disabled={isSubmitting || !form.label.trim() || !form.url.trim()}
            >
              {isSubmitting ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sortable link item component
interface SortableLinkItemProps {
  item: CustomSectionItem;
  onRemove: () => void;
  canReorder: boolean;
}

function SortableLinkItem({ item, onRemove, canReorder }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Dividers render differently
  if (isDividerItem(item)) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md bg-muted/50",
          isDragging && "opacity-50"
        )}
      >
        {canReorder && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 border-t" />
        {item.label && (
          <span className="text-xs text-muted-foreground font-medium">
            {item.label}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Link items
  const isExternal = isExternalLinkItem(item);
  const isInternal = isInternalLinkItem(item);
  const label = isExternal || isInternal ? item.label : "Unknown";
  const url = isExternal ? item.url : isInternal ? item.href : "";
  const emoji = isExternal || isInternal ? item.emoji : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded-md bg-muted/50 group",
        isDragging && "opacity-50 shadow-md"
      )}
    >
      {/* Drag Handle */}
      {canReorder && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-background rounded"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {/* Icon/Emoji */}
      <div className="flex items-center justify-center w-6 h-6 shrink-0">
        {emoji ? (
          <span className="text-sm">{emoji}</span>
        ) : isExternal ? (
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Label & URL */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
