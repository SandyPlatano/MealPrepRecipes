import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingModeFABProps {
  highlightedCount: number;
  onClick: () => void;
}

export function CookingModeFAB({
  highlightedCount,
  onClick,
}: CookingModeFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-8 right-6 z-40 lg:hidden",
        "h-16 w-16 rounded-full",
        "bg-[#D9F99D] text-[#1A1A1A]",
        "shadow-xl shadow-lime-200/30",
        "flex items-center justify-center",
        "active:scale-95 transition-all duration-200",
        "hover:shadow-2xl hover:shadow-lime-200/40"
      )}
      aria-label="View ingredients"
    >
      <UtensilsCrossed className="h-7 w-7" />
      {highlightedCount > 0 && (
        <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
          {highlightedCount}
        </span>
      )}
    </button>
  );
}
