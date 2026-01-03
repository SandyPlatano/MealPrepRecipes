import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";

interface RecipeCardBadgesProps {
  hasAnyWarnings: boolean;
  allWarnings: string[];
}

export function RecipeCardBadges({ hasAnyWarnings, allWarnings }: RecipeCardBadgesProps) {
  if (!hasAnyWarnings) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="absolute top-2 left-12 z-10 p-1.5 rounded-full bg-amber-100/90 dark:bg-amber-900/80 backdrop-blur-sm shadow-sm">
          <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        Contains: {allWarnings.slice(0, 3).join(", ")}
        {allWarnings.length > 3 && ` +${allWarnings.length - 3} more`}
      </TooltipContent>
    </Tooltip>
  );
}
