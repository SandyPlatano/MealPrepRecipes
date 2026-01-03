import { CalendarOff, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DateBadgeProps {
  dayNumber: number;
  dayAbbrev: string;
  monthAbbrev: string;
  isToday: boolean;
  isFocused: boolean;
  keyboardNumber: number;
  googleConnected?: boolean;
  isCalendarExcluded?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export function DateBadge({
  dayNumber,
  dayAbbrev,
  monthAbbrev,
  isToday,
  isFocused,
  keyboardNumber,
  googleConnected = false,
  isCalendarExcluded = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
}: DateBadgeProps) {
  return (
    <div
      className={cn(
        "absolute top-3 left-3 flex flex-col items-center z-10",
        isToday && "text-primary",
        isSelectionMode && "cursor-pointer"
      )}
      onClick={isSelectionMode ? (e) => { e.stopPropagation(); onToggleSelection?.(); } : undefined}
    >
      {/* Selection Checkbox (shown in selection mode) */}
      {isSelectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection?.();
          }}
          className={cn(
            "size-6 rounded-md border-2 flex items-center justify-center transition-all mb-1",
            isSelected
              ? "bg-[#D9F99D] border-[#D9F99D] text-[#1A1A1A]"
              : "border-gray-300 hover:border-[#D9F99D]"
          )}
          aria-label={isSelected ? "Deselect day" : "Select day"}
        >
          {isSelected && <Check className="size-4" />}
        </button>
      )}

      <div className="text-xl md:text-2xl font-bold font-mono leading-none">
        {dayNumber}
      </div>
      <div className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide">{dayAbbrev}</div>
      <div className="text-[8px] md:text-[9px] text-muted-foreground">{monthAbbrev}</div>
      {isToday && (
        <Badge variant="default" className="text-[7px] md:text-[8px] px-1 py-0 mt-1">
          Today
        </Badge>
      )}
      {googleConnected && isCalendarExcluded && (
        <div className="mt-1 flex items-center justify-center" title="Calendar sync disabled">
          <CalendarOff className="size-2.5 md:size-3 text-muted-foreground" />
        </div>
      )}
      {/* Keyboard shortcut hint - hidden on mobile */}
      <div
        className={cn(
          "hidden md:flex items-center justify-center mt-1 text-[9px] font-mono px-1 py-0.5 rounded transition-all",
          isFocused
            ? "bg-[#D9F99D] text-[#1A1A1A]"
            : "bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100"
        )}
        title={`Press ${keyboardNumber} to focus, then A to add`}
      >
        {keyboardNumber}
      </div>
    </div>
  );
}
