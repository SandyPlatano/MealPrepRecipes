"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ChefHat,
  Trash2,
  Edit,
  MoreVertical,
  Loader2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import {
  bulkDeleteCookingHistory,
  deleteCookingHistoryEntry,
} from "@/app/actions/cooking-history";
import { EditCookingHistoryDialog } from "@/components/recipes/edit-cooking-history-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { CookingHistoryWithRecipe } from "@/types/cooking-history";

interface CookingHistoryListProps {
  history: CookingHistoryWithRecipe[];
}

export function CookingHistoryList({ history }: CookingHistoryListProps) {
  const router = useRouter();
  const [localHistory, setLocalHistory] = useState(history);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CookingHistoryWithRecipe | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === localHistory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localHistory.map((e) => e.id)));
    }
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedIds(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSingle = async () => {
    if (!deleteEntryId) return;

    setIsDeleting(true);
    const result = await deleteCookingHistoryEntry(deleteEntryId);
    setIsDeleting(false);

    if (result.error) {
      toast.error("Failed to delete", { description: result.error });
      return;
    }

    setLocalHistory((prev) => prev.filter((e) => e.id !== deleteEntryId));
    setDeleteEntryId(null);
    toast.success("Entry deleted");
    router.refresh();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    const result = await bulkDeleteCookingHistory(Array.from(selectedIds));
    setIsBulkDeleting(false);

    if (result.error) {
      toast.error("Failed to delete", { description: result.error });
      return;
    }

    setLocalHistory((prev) => prev.filter((e) => !selectedIds.has(e.id)));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setShowBulkDeleteDialog(false);
    toast.success(`Deleted ${result.deletedCount} entries`);
    router.refresh();
  };

  const handleEditSuccess = (updatedEntry: {
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
    photo_url?: string | null;
  }) => {
    setLocalHistory((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? { ...e, ...updatedEntry } : e))
    );
    setEditingEntry(null);
    router.refresh();
  };

  if (localHistory.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon="🍳"
            title="No cooking history yet"
            description="Mark recipes as cooked to track what you've made and rate them."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Selection Mode Controls */}
      <div className="flex items-center justify-between mb-4">
        {isSelectionMode ? (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedIds.size === localHistory.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={selectedIds.size === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedIds.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={enterSelectionMode}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select Multiple
          </Button>
        )}
      </div>

      {/* History List */}
      <div className="flex flex-col gap-4">
        {localHistory.map((entry) => (
          <Card
            key={entry.id}
            className={`hover:shadow-lg transition-all ${
              selectedIds.has(entry.id) ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  {isSelectionMode && (
                    <Checkbox
                      checked={selectedIds.has(entry.id)}
                      onCheckedChange={() => toggleSelection(entry.id)}
                      className="mt-1"
                    />
                  )}
                  <div className="flex flex-col gap-1 flex-1">
                    <Link
                      href={`/app/recipes/${entry.recipe_id}`}
                      className="hover:underline"
                    >
                      <CardTitle className="text-xl">
                        {entry.recipe?.title || "Unknown Recipe"}
                      </CardTitle>
                    </Link>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {entry.recipe?.recipe_type && (
                        <Badge variant="secondary">
                          {entry.recipe.recipe_type}
                        </Badge>
                      )}
                      {entry.recipe?.protein_type && (
                        <Badge variant="outline">
                          {entry.recipe.protein_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry.rating && (
                    <StarRating rating={entry.rating} readonly size="sm" />
                  )}
                  {!isSelectionMode && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingEntry(entry)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteEntryId(entry.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col gap-3">
              {/* Photo */}
              {entry.photo_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={entry.photo_url}
                    alt="Cooking photo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Date and Cook Info */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(entry.cooked_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  (
                  {formatDistanceToNow(new Date(entry.cooked_at), {
                    addSuffix: true,
                  })}
                  )
                </span>
                {(entry.cooked_by_profile?.first_name ||
                  entry.cooked_by_profile?.last_name) && (
                  <div className="flex items-center gap-1.5">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {[
                        entry.cooked_by_profile.first_name,
                        entry.cooked_by_profile.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Modifications */}
              {entry.modifications && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Changes made:
                  </p>
                  <p className="text-sm">{entry.modifications}</p>
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <div className="border-l-2 border-muted-foreground/20 pl-3">
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{entry.notes}&quot;
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingEntry && (
        <EditCookingHistoryDialog
          entry={editingEntry}
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Single Delete Confirmation */}
      <AlertDialog
        open={!!deleteEntryId}
        onOpenChange={(open) => !open && setDeleteEntryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cooking Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this cooking history entry. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingle}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Entries?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selectedIds.size} cooking history
              {selectedIds.size === 1 ? " entry" : " entries"}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.size} Entries`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
