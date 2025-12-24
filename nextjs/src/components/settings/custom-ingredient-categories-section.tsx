"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Smile,
  Palette,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createCustomIngredientCategory,
  updateCustomIngredientCategory,
  deleteCustomIngredientCategory,
  reorderCustomIngredientCategories,
} from "@/app/actions/custom-ingredient-categories";
import type {
  CustomIngredientCategory,
  CustomIngredientCategoryFormData,
} from "@/types/custom-ingredient-category";
import { MEAL_TYPE_COLOR_PALETTE } from "@/types/settings";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface CustomIngredientCategoriesSectionProps {
  householdId: string;
  initialCategories: CustomIngredientCategory[];
}

export function CustomIngredientCategoriesSection({
  householdId,
  initialCategories,
}: CustomIngredientCategoriesSectionProps) {
  const [categories, setCategories] = useState<CustomIngredientCategory[]>(
    initialCategories
  );
  const [editingCategory, setEditingCategory] =
    useState<CustomIngredientCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CustomIngredientCategoryFormData>({
    name: "",
    emoji: "🛒",
    color: "#6366f1",
    parentCategoryId: null,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customColorInput, setCustomColorInput] = useState("#6366f1");
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CustomIngredientCategory | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Build hierarchy: group categories by parent
  const categoriesByParent = categories.reduce(
    (acc, cat) => {
      const parentId = cat.parentCategoryId || "root";
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(cat);
      return acc;
    },
    {} as Record<string, CustomIngredientCategory[]>
  );

  // Recursive function to render categories with nesting
  const renderCategory = (
    category: CustomIngredientCategory,
    depth: number = 0
  ): React.ReactNode => {
    const children = categoriesByParent[category.id] || [];
    const hasEmoji = category.emoji && category.emoji.trim() !== "";

    return (
      <div key={category.id}>
        {/* Category Row */}
        <div
          className={cn(
            "group flex items-center gap-3 p-3 rounded-lg border transition-all",
            "hover:border-primary hover:bg-accent/50",
            dragOverIndex !== null && "opacity-50"
          )}
          style={{
            marginLeft: `${depth * 24}px`,
            borderLeftColor: category.color,
            borderLeftWidth: "3px",
          }}
          draggable={!category.isSystem}
          onDragStart={(e) => {
            const index = categories.findIndex((c) => c.id === category.id);
            setDraggedIndex(index);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            const index = categories.findIndex((c) => c.id === category.id);
            setDragOverIndex(index);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (draggedIndex === null || dragOverIndex === null) return;
            if (draggedIndex === dragOverIndex) return;

            const newCategories = [...categories];
            const [draggedCategory] = newCategories.splice(draggedIndex, 1);
            newCategories.splice(dragOverIndex, 0, draggedCategory);

            setCategories(newCategories);
            handleReorder(newCategories);
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
        >
          {/* Drag Handle */}
          {!category.isSystem && (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
          )}

          {/* Emoji */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md text-lg"
            style={{ backgroundColor: `${category.color}15` }}
          >
            {hasEmoji ? category.emoji : "—"}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{category.name}</div>
            {depth > 0 && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FolderTree className="h-3 w-3" />
                Nested category
              </div>
            )}
          </div>

          {/* System Badge */}
          {category.isSystem && (
            <Badge variant="secondary" className="text-xs">
              System
            </Badge>
          )}

          {/* Color Swatch */}
          <div
            className="h-5 w-5 rounded-full ring-1 ring-black/10"
            style={{ backgroundColor: category.color }}
          />

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {!category.isSystem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCategoryToDelete(category)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>

        {/* Render Children */}
        {children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  // Open edit dialog
  const handleEdit = (category: CustomIngredientCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      emoji: category.emoji,
      color: category.color,
      parentCategoryId: category.parentCategoryId,
      defaultStoreId: category.defaultStoreId,
    });
    setCustomColorInput(category.color);
  };

  // Open create dialog
  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      emoji: "🛒",
      color: "#6366f1",
      parentCategoryId: null,
    });
    setCustomColorInput("#6366f1");
  };

  // Close dialogs
  const handleClose = () => {
    setEditingCategory(null);
    setIsCreating(false);
    setShowEmojiPicker(false);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);

    if (editingCategory) {
      // Update
      const result = await updateCustomIngredientCategory(
        editingCategory.id,
        formData
      );
      setIsSaving(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Update local state
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, ...formData } : c
        )
      );

      toast.success("Category updated");
    } else {
      // Create
      const result = await createCustomIngredientCategory(householdId, formData);
      setIsSaving(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        setCategories((prev) => [...prev, result.data!]);
        toast.success("Category created");
      }
    }

    handleClose();
  };

  // Delete category
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsSaving(true);
    const result = await deleteCustomIngredientCategory(categoryToDelete.id);
    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    // Update local state
    setCategories((prev) => {
      const filtered = prev.filter((c) => c.id !== categoryToDelete.id);
      return filtered.map((c) =>
        c.parentCategoryId === categoryToDelete.id
          ? { ...c, parentCategoryId: null }
          : c
      );
    });

    toast.success("Category deleted");
    setCategoryToDelete(null);
  };

  // Reorder categories
  const handleReorder = async (newOrder: CustomIngredientCategory[]) => {
    const orderedIds = newOrder.map((c) => c.id);
    const result = await reorderCustomIngredientCategories(
      householdId,
      orderedIds
    );

    if (result.error) {
      toast.error("Failed to reorder categories");
      // Revert on error
      setCategories(initialCategories);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: { native: string }) => {
    setFormData((prev) => ({ ...prev, emoji: emoji.native }));
    setShowEmojiPicker(false);
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
    setCustomColorInput(color);
  };

  // Handle custom color input
  const handleCustomColorChange = (value: string) => {
    setCustomColorInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setFormData((prev) => ({ ...prev, color: value }));
    }
  };

  const rootCategories = categoriesByParent["root"] || [];
  const availableParents = categories.filter(
    (c) => !editingCategory || c.id !== editingCategory.id
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ingredient Categories</h3>
          <p className="text-sm text-muted-foreground">
            Customize how shopping list items are grouped
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="flex flex-col gap-2">
        {rootCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories yet. Add one to get started.
          </div>
        ) : (
          rootCategories.map((category) => renderCategory(category, 0))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreating || editingCategory !== null}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Add Category" : "Edit Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Asian Grocery"
              />
            </div>

            {/* Emoji */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                Emoji
              </Label>
              <div className="flex items-center gap-2">
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12 w-16 text-2xl p-0">
                      {formData.emoji || "—"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-0 z-[10000]"
                    align="start"
                    usePortal={false}
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={handleEmojiSelect}
                      theme="auto"
                      previewPosition="none"
                      skinTonePosition="search"
                      categories={[
                        "foods",
                        "objects",
                        "nature",
                        "places",
                        "symbols",
                      ]}
                      perLine={8}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, emoji: "" }))
                  }
                  disabled={!formData.emoji}
                >
                  Clear
                </Button>
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </Label>

              {/* Color palette grid */}
              <div className="grid grid-cols-8 gap-2">
                {MEAL_TYPE_COLOR_PALETTE.map((c) => (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => handleColorSelect(c.color)}
                    className={cn(
                      "h-8 w-8 rounded-md transition-all",
                      formData.color === c.color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-110 ring-1 ring-black/10"
                    )}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Custom color input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Custom:</span>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    placeholder="#6366f1"
                    className="font-mono text-sm pl-10"
                  />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 cursor-pointer rounded border-0"
                  />
                </div>
              </div>
            </div>

            {/* Parent Category */}
            <div className="flex flex-col gap-2">
              <Label className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Parent Category (Optional)
              </Label>
              <p className="text-xs text-muted-foreground">
                Nest this category under another category
              </p>
              <Select
                value={formData.parentCategoryId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentCategoryId: value === "none" ? null : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="max-h-60 z-[10000]">
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {availableParents
                    .filter((c) => !c.parentCategoryId) // Only top-level can be parents
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2">
              <Label>Preview</Label>
              <div
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{
                  backgroundColor: `${formData.color}10`,
                  borderLeftColor: formData.color,
                  borderLeftWidth: "3px",
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-md text-lg"
                  style={{ backgroundColor: `${formData.color}15` }}
                >
                  {formData.emoji || "—"}
                </div>
                <span className="font-medium">
                  {formData.name || "Category Name"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={categoryToDelete !== null}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;?
              This action cannot be undone. Child categories will be moved to the
              top level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
