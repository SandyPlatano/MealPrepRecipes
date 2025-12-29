import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import type { CookingHistoryEntry } from "../hooks/use-recipe-history";

interface RecipeHistorySectionProps {
  history: CookingHistoryEntry[];
  onEditEntry: (entry: CookingHistoryEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export function RecipeHistorySection({
  history,
  onEditEntry,
  onDeleteEntry,
}: RecipeHistorySectionProps) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col">
      <div>
        <h3 className="text-lg font-semibold">Cooking History</h3>
        <p className="text-sm text-muted-foreground">
          Made {history.length} time{history.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {history.slice(0, 5).map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50 group"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {new Date(entry.cooked_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {(entry.cooked_by_profile?.first_name ||
                  entry.cooked_by_profile?.last_name) && (
                  <span className="text-xs text-muted-foreground">
                    by{" "}
                    {[
                      entry.cooked_by_profile.first_name,
                      entry.cooked_by_profile.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                )}
              </div>
              {entry.modifications && (
                <div className="text-xs">
                  <span className="font-medium text-primary">Tweaks: </span>
                  <span className="text-muted-foreground">
                    {entry.modifications}
                  </span>
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
        ))}
      </ul>
    </div>
  );
}
