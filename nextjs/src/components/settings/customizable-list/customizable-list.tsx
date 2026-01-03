"use client";

/**
 * CustomizableList - Generic CRUD list component
 *
 * Consolidates common patterns across settings sections:
 * - State management (items, dialogs, forms)
 * - Drag-to-reorder
 * - Create/Edit dialogs
 * - Delete confirmation
 * - Emoji/Color pickers
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useListState } from "./use-list-state";
import { SortableWrapper } from "./sortable-wrapper";
import { ListItem } from "./list-item";
import { ListDialog } from "./list-dialog";
import { DeleteConfirmation } from "./delete-confirmation";
import type { BaseListItem, CustomizableListProps } from "./types";

export function CustomizableList<T extends BaseListItem, F>({
  householdId,
  initialItems,
  config,
  actions,
  renderItemContent,
  renderItemBadges,
  renderFormFields,
  renderPreview,
  renderDeleteDialog,
  usageLimit,
  colorPalette,
}: CustomizableListProps<T, F>) {
  const {
    items,
    isCreating,
    editingItem,
    deleteConfirmItem,
    isDialogOpen,
    formData,
    setFormData,
    isSaving,
    handleCreate,
    handleEdit,
    handleClose,
    handleSave,
    handleDelete,
    handleRequestDelete,
    handleCancelDelete,
    handleReorder,
  } = useListState({
    initialItems,
    initialFormData: config.initialFormData,
    actions,
    householdId,
  });

  const { features, emptyState, dialog, deleteConfirmation } = config;
  const Icon = config.icon;
  const EmptyIcon = emptyState.icon;

  // Get item properties for rendering
  const getItemProps = (item: T) => ({
    color: features.color ? (item as unknown as { color?: string }).color : undefined,
    emoji: features.emoji ? (item as unknown as { emoji?: string }).emoji : undefined,
    isSystem: features.systemItems ? item.isSystem : false,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {usageLimit && (
              <span className="text-sm text-muted-foreground">
                {usageLimit.count} / {usageLimit.limit}
              </span>
            )}
            <Button
              onClick={handleCreate}
              size="sm"
              disabled={usageLimit && usageLimit.count >= usageLimit.limit}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {EmptyIcon && (
              <EmptyIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            )}
            <h3 className="text-sm font-medium text-muted-foreground">
              {emptyState.title}
            </h3>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {emptyState.description}
            </p>
            <Button onClick={handleCreate} variant="outline" size="sm" className="mt-4">
              <Plus className="h-4 w-4 mr-1" />
              Create your first
            </Button>
          </div>
        ) : (
          // Item list
          <SortableWrapper
            items={items}
            onReorder={handleReorder}
            disabled={!features.dragReorder}
          >
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const itemProps = getItemProps(item);
                return (
                  <ListItem
                    key={item.id}
                    id={item.id}
                    color={itemProps.color}
                    emoji={itemProps.emoji}
                    isSystem={itemProps.isSystem}
                    dragEnabled={features.dragReorder}
                    onClick={() => handleEdit(item)}
                    onDelete={() => handleRequestDelete(item)}
                  >
                    {renderItemContent(item)}
                    {renderItemBadges && (
                      <div className="flex items-center gap-1">
                        {renderItemBadges(item)}
                      </div>
                    )}
                  </ListItem>
                );
              })}
            </div>
          </SortableWrapper>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <ListDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        onSave={handleSave}
        isSaving={isSaving}
        title={editingItem ? dialog.editTitle(editingItem) : dialog.createTitle}
        preview={renderPreview?.(formData)}
      >
        {renderFormFields({
          formData,
          setFormData,
          isEditing: editingItem !== null,
          isSaving,
        })}
      </ListDialog>

      {/* Delete Confirmation */}
      {deleteConfirmItem && (
        renderDeleteDialog ? (
          renderDeleteDialog({
            item: deleteConfirmItem,
            isOpen: true,
            onClose: handleCancelDelete,
            onConfirm: handleDelete,
            isSaving,
          })
        ) : (
          <DeleteConfirmation
            isOpen={true}
            onClose={handleCancelDelete}
            onConfirm={handleDelete}
            isSaving={isSaving}
            title={deleteConfirmation.title}
            description={deleteConfirmation.description(deleteConfirmItem)}
          />
        )
      )}
    </Card>
  );
}
