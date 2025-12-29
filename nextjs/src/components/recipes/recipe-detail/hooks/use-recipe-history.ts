import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCookingHistoryEntry } from "@/app/actions/cooking-history";

export interface CookingHistoryEntry {
  id: string;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  modifications: string | null;
  photo_url: string | null;
  cooked_by_profile?: { first_name: string | null; last_name: string | null } | null;
}

interface UseRecipeHistoryProps {
  initialHistory: CookingHistoryEntry[];
}

export interface RecipeHistoryState {
  localHistory: CookingHistoryEntry[];
  editingHistoryEntry: CookingHistoryEntry | null;
  deleteHistoryEntryId: string | null;
  isDeletingHistoryEntry: boolean;
  cookedToday: boolean;
  lastCooked: string | null;
  setEditingHistoryEntry: (entry: CookingHistoryEntry | null) => void;
  setDeleteHistoryEntryId: (id: string | null) => void;
  handleCookedSuccess: () => void;
  handleEditHistorySuccess: (updatedEntry: {
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
  }) => void;
  handleDeleteHistoryEntry: () => Promise<void>;
}

export function useRecipeHistory({
  initialHistory,
}: UseRecipeHistoryProps): RecipeHistoryState {
  const router = useRouter();
  const [localHistory, setLocalHistory] = useState(initialHistory);
  const [editingHistoryEntry, setEditingHistoryEntry] = useState<CookingHistoryEntry | null>(null);
  const [deleteHistoryEntryId, setDeleteHistoryEntryId] = useState<string | null>(null);
  const [isDeletingHistoryEntry, setIsDeletingHistoryEntry] = useState(false);

  // Check if recipe was cooked today
  const today = new Date().toDateString();
  const cookedToday = localHistory.some(
    (entry) => new Date(entry.cooked_at).toDateString() === today
  );

  const lastCooked = localHistory.length > 0 ? localHistory[0].cooked_at : null;

  const handleCookedSuccess = () => {
    // Optimistically add a new entry to local history
    const newEntry: CookingHistoryEntry = {
      id: `temp-${Date.now()}`,
      cooked_at: new Date().toISOString(),
      rating: null,
      notes: null,
      modifications: null,
      photo_url: null,
      cooked_by_profile: null,
    };
    setLocalHistory([newEntry, ...localHistory]);
    // Also refresh the page to get server data
    router.refresh();
  };

  const handleEditHistorySuccess = (updatedEntry: {
    id: string;
    cooked_at: string;
    rating: number | null;
    notes: string | null;
    modifications: string | null;
  }) => {
    // Optimistically update the entry in local history
    setLocalHistory((prev) =>
      prev.map((entry) =>
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      )
    );
    router.refresh();
  };

  const handleDeleteHistoryEntry = async () => {
    if (!deleteHistoryEntryId) return;

    setIsDeletingHistoryEntry(true);
    const result = await deleteCookingHistoryEntry(deleteHistoryEntryId);
    setIsDeletingHistoryEntry(false);

    if (result.error) {
      toast.error("Failed to delete", { description: result.error });
      return;
    }

    // Optimistically remove from local history
    setLocalHistory((prev) => prev.filter((entry) => entry.id !== deleteHistoryEntryId));
    setDeleteHistoryEntryId(null);
    toast.success("Entry deleted");
    router.refresh();
  };

  return {
    localHistory,
    editingHistoryEntry,
    deleteHistoryEntryId,
    isDeletingHistoryEntry,
    cookedToday,
    lastCooked,
    setEditingHistoryEntry,
    setDeleteHistoryEntryId,
    handleCookedSuccess,
    handleEditHistorySuccess,
    handleDeleteHistoryEntry,
  };
}
