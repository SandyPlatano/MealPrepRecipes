"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, ChevronDown } from "lucide-react";
import type { CookingHistoryEntry } from "@/hooks/use-recipe-detail-state";

interface RecipeDetailHistoryProps {
  history: CookingHistoryEntry[];
  onEditEntry: (entry: CookingHistoryEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export function RecipeDetailHistory({
  history,
  onEditEntry,
  onDeleteEntry,
}: RecipeDetailHistoryProps) {
  if (history.length === 0) return null;

  const renderHistoryEntry = (entry: CookingHistoryEntry) => (
    <li
      key={entry.id}
      className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50 group"
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {new Date(entry.cooked_at).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </span>
          {(entry.cooked_by_profile?.first_name || entry.cooked_by_profile?.last_name) && (
            <span className="text-xs text-muted-foreground">
              by {[entry.cooked_by_profile.first_name, entry.cooked_by_profile.last_name].filter(Boolean).join(" ")}
            </span>
          )}
        </div>
        {entry.modifications && (
          <div className="text-xs">
            <span className="font-medium text-primary">Tweaks: </span>
            <span className="text-muted-foreground">{entry.modifications}</span>
          </div>
        )}
        {entry.notes && (
          <span className="text-muted-foreground text-xs">
            {entry.notes}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {entry.rating && (
          <StarRating rating={entry.rating} readonly size="sm" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditEntry(entry)}>
              <Edit className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteEntry(entry.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );

  const firstEntry = history[0];
  const remainingEntries = history.slice(1, 5);

  return (
    <div className="flex flex-col gap-4">
      {/* Title Row with visual hierarchy */}
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white whitespace-nowrap">Cooking History</h3>
        <Badge className="bg-[#D9F99D]/20 text-[#1A1A1A] dark:text-white border-0 text-xs">
          Made {history.length} time{history.length !== 1 ? "s" : ""}
        </Badge>
        <Separator className="flex-1" />
      </div>
      <ul className="flex flex-col gap-2">
        {/* Always show the most recent entry */}
        {renderHistoryEntry(firstEntry)}

        {/* Collapsible section for older entries */}
        {remainingEntries.length > 0 && (
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group w-full justify-center py-1">
              <span>Show {remainingEntries.length} more</span>
              <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="flex flex-col gap-2 pt-2">
                {remainingEntries.map(renderHistoryEntry)}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </ul>
    </div>
  );
}
