"use client";

import { useState } from "react";
import { Cookie, BookOpen, Copy, RefreshCw, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickCartModalActionsProps {
  pantryCount: number;
  showRecipeSources: boolean;
  onToggleRecipeSources: () => void;
  onCopyToClipboard: () => void;
  onRefreshFromMealPlan: () => void;
  onAddItem: (text: string) => void;
  isLoading: boolean;
}

export function QuickCartModalActions({
  pantryCount,
  showRecipeSources,
  onToggleRecipeSources,
  onCopyToClipboard,
  onRefreshFromMealPlan,
  onAddItem,
  isLoading,
}: QuickCartModalActionsProps) {
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAdd = async () => {
    if (!inputValue.trim()) return;

    setIsAdding(true);
    try {
      await onAddItem(inputValue.trim());
      setInputValue("");
      toast.success("Added to cart", {
        description: inputValue.trim(),
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshFromMealPlan();
      toast.success("Refreshed from meal plan");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopy = async () => {
    await onCopyToClipboard();
    toast.success("Copied to clipboard");
  };

  return (
    <div className="px-4 sm:px-6 py-3 border-b space-y-3 flex-shrink-0 bg-background">
      {/* Add Item Input */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add ingredient..."
          className="flex-1"
          disabled={isLoading || isAdding}
        />
        <Button
          onClick={handleAdd}
          disabled={!inputValue.trim() || isLoading || isAdding}
          className="bg-[#D9F99D] text-[#1A1A1A] hover:bg-[#D9F99D]/80"
        >
          {isAdding ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          <span className="ml-1 hidden sm:inline">Add</span>
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Pantry Count */}
        {pantryCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled
          >
            <Cookie className="size-3.5 text-amber-600" />
            {pantryCount} in pantry
          </Button>
        )}

        {/* Recipe Sources Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleRecipeSources}
          className={cn(
            "h-8 text-xs gap-1.5",
            showRecipeSources && "bg-accent"
          )}
        >
          <BookOpen className="size-3.5" />
          Sources
        </Button>

        {/* Copy to Clipboard */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 text-xs gap-1.5"
        >
          <Copy className="size-3.5" />
          Copy
        </Button>

        {/* Refresh from Meal Plan */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 text-xs gap-1.5"
        >
          {isRefreshing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>
    </div>
  );
}
