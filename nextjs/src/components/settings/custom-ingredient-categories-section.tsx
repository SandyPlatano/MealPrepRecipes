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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
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
import {
  EmojiPickerField,
  ColorPickerField,
  DeleteConfirmation,
} from "./customizable-list";

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
  };

  // Close dialogs
  const handleClose = () => {
    setEditingCategory(null);
    setIsCreating(false);
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
            <EmojiPickerField
              value={formData.emoji}
              onChange={(emoji) => setFormData((prev) => ({ ...prev, emoji }))}
              onClear={() => setFormData((prev) => ({ ...prev, emoji: "" }))}
              categories={["foods", "objects", "nature", "symbols"]}
            />

            {/* Color */}
            <ColorPickerField
              value={formData.color}
              onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
            />

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
      <DeleteConfirmation
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        isSaving={isSaving}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone. Child categories will be moved to the top level.`}
      />
    </div>
  );
}
