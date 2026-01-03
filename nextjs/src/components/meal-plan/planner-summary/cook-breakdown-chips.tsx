import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEFAULT_COOK_COLORS } from "./constants";
import type { CookBreakdownChipsProps } from "./types";

export function CookBreakdownChips({
  breakdown,
  cookColors,
}: CookBreakdownChipsProps) {
  const hasCooksAssigned = Object.keys(breakdown.breakdown).length > 0;
  const cookNames = Object.keys(breakdown.breakdown);

  // Get cook color with fallback to default colors
  const getCookColor = (cook: string): string => {
    if (cookColors[cook]) {
      return cookColors[cook];
    }
    // Fallback to default color based on index
    const index = cookNames.indexOf(cook);
    return DEFAULT_COOK_COLORS[index % DEFAULT_COOK_COLORS.length];
  };

  if (!hasCooksAssigned) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>No cooks assigned yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(breakdown.breakdown).map(([cook, count]) => {
        const cookColor = getCookColor(cook);
        return (
          <div
            key={cook}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-md",
              "bg-secondary text-secondary-foreground text-sm font-medium",
              "transition-all hover:shadow-sm border border-input"
            )}
            style={{
              borderLeft: `3px solid ${cookColor}`,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cookColor }}
            />
            <span className="truncate max-w-[100px]">{cook}</span>
            <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
              {count}
            </Badge>
          </div>
        );
      })}
      {breakdown.unassigned > 0 && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm border border-input">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
          <span>Unassigned</span>
          <Badge variant="outline" className="h-5 px-1.5 text-xs font-mono">
            {breakdown.unassigned}
          </Badge>
        </div>
      )}
    </div>
  );
}
