import { useState, useEffect } from "react";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";

export interface StoreModeState {
  storeMode: boolean;
  handleToggleStoreMode: () => void;
}

export function useStoreMode(
  expandedCategories: Set<string>,
  setExpandedCategories: React.Dispatch<React.SetStateAction<Set<string>>>,
  sortedCategories: string[],
  groupedItems: Record<string, unknown[]>
): StoreModeState {
  const [storeMode, setStoreMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("shopping-store-mode");
    if (saved === "true") {
      setStoreMode(true);
    }
  }, []);

  // Auto-advance to next category when current is completed
  useEffect(() => {
    if (!storeMode || expandedCategories.size === 0) return;

    // Check if all expanded categories are complete
    const expandedArray = Array.from(expandedCategories);
    const allExpandedComplete = expandedArray.every(cat => {
      const items = groupedItems[cat] as { is_checked?: boolean }[] | undefined;
      return items?.every(item => item.is_checked);
    });

    if (allExpandedComplete) {
      // Find next category with unchecked items
      const nextWithUnchecked = sortedCategories.find(cat =>
        !expandedCategories.has(cat) &&
        (groupedItems[cat] as { is_checked?: boolean }[] | undefined)?.some(item => !item.is_checked)
      );

      if (nextWithUnchecked) {
        triggerHaptic("success");
        setExpandedCategories(new Set([nextWithUnchecked]));
        toast.success(`Moving to ${nextWithUnchecked}`, { duration: 2000 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeMode, groupedItems]);

  const handleToggleStoreMode = () => {
    const newValue = !storeMode;
    setStoreMode(newValue);
    localStorage.setItem("shopping-store-mode", String(newValue));
    triggerHaptic("medium");

    if (newValue) {
      // Entering store mode: collapse all, expand first with unchecked
      const firstWithUnchecked = sortedCategories.find(cat =>
        (groupedItems[cat] as { is_checked?: boolean }[] | undefined)?.some(item => !item.is_checked)
      );
      if (firstWithUnchecked) {
        setExpandedCategories(new Set([firstWithUnchecked]));
      } else {
        setExpandedCategories(new Set());
      }
      toast.success("Store Mode activated - focus on one category at a time");
    } else {
      toast.success("Store Mode deactivated");
    }
  };

  return {
    storeMode,
    handleToggleStoreMode,
  };
}
