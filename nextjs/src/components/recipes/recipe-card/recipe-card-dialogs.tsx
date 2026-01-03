import dynamic from "next/dynamic";
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
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";

// Lazy load dialogs - only loaded when user opens them
const EditCookingHistoryDialog = dynamic(
  () =>
    import("@/components/recipes/edit-cooking-history-dialog").then(
      (mod) => mod.EditCookingHistoryDialog
    ),
  { ssr: false }
);

const MarkCookedDialog = dynamic(
  () => import("../mark-cooked-dialog").then((mod) => mod.MarkCookedDialog),
  { ssr: false }
);

const ShareExportSheet = dynamic(
  () => import("../share-export-sheet").then((mod) => mod.ShareExportSheet),
  { ssr: false }
);

import { AddToPlanSheet } from "../add-to-plan-sheet";

interface RecipeCardDialogsProps {
  recipe: RecipeWithFavoriteAndNutrition;
  deleteDialogOpen: boolean;
  isDeleting: boolean;
  showCookedDialog: boolean;
  showShareDialog: boolean;
  showEditHistoryDialog: boolean;
  showAddToPlanSheet: boolean;
  cookingEntryToEdit: {
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
    photo_url?: string | null;
    cooked_by_profile?: { first_name: string | null; last_name: string | null } | null;
  } | null;
  onDeleteDialogChange: (open: boolean) => void;
  onDelete: () => void;
  onCookedDialogChange: (open: boolean) => void;
  onCookingSuccess: (newRating: number | null) => void;
  onShareDialogClose: () => void;
  onEditHistoryDialogChange: (open: boolean) => void;
  onCookingEntryUpdated: (
    updated: {
      id: string;
      cooked_at: string;
      rating: number | null;
      notes: string | null;
      modifications: string | null;
      photo_url?: string | null;
      cooked_by_profile?: { first_name: string | null; last_name: string | null } | null;
    } | null
  ) => void;
  onAddToPlanSheetClose: () => void;
  onAddFromSheet: (day: DayOfWeek, cook: string | null, servingSize: number | null) => void;
}

export function RecipeCardDialogs({
  recipe,
  deleteDialogOpen,
  isDeleting,
  showCookedDialog,
  showShareDialog,
  showEditHistoryDialog,
  showAddToPlanSheet,
  cookingEntryToEdit,
  onDeleteDialogChange,
  onDelete,
  onCookedDialogChange,
  onCookingSuccess,
  onShareDialogClose,
  onEditHistoryDialogChange,
  onCookingEntryUpdated,
  onAddToPlanSheetClose,
  onAddFromSheet,
}: RecipeCardDialogsProps) {
  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete This Recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to delete &quot;{recipe.title}&quot; forever. Gone from your
              collection, favorites, and any meal plans. No take-backs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MarkCookedDialog
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        open={showCookedDialog}
        onOpenChange={onCookedDialogChange}
        onSuccess={onCookingSuccess}
      />

      {cookingEntryToEdit && (
        <EditCookingHistoryDialog
          entry={cookingEntryToEdit}
          open={showEditHistoryDialog}
          onOpenChange={onEditHistoryDialogChange}
          onSuccess={onCookingEntryUpdated}
        />
      )}

      <ShareExportSheet
        isOpen={showShareDialog}
        onClose={onShareDialogClose}
        recipe={recipe}
        isPublic={recipe.is_public ?? false}
        shareToken={recipe.share_token ?? null}
        viewCount={recipe.view_count ?? 0}
      />

      <AddToPlanSheet
        recipe={recipe}
        isOpen={showAddToPlanSheet}
        onClose={onAddToPlanSheetClose}
        onAdd={onAddFromSheet}
      />
    </>
  );
}
