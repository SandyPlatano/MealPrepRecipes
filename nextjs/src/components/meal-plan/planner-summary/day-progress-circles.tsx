import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/types/meal-plan";
import { DAY_LETTERS } from "./constants";
import type { DayProgressCirclesProps } from "./types";

export function DayProgressCircles({ daysWithMeals }: DayProgressCirclesProps) {
  // Get current day index (0 = Sunday, 1 = Monday, etc.)
  const today = new Date().getDay();

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between gap-1">
        {DAYS_OF_WEEK.map((day, index) => {
          const hasPlanned = daysWithMeals.has(day);
          // Convert index (0=Monday) to day of week (1=Monday, 0=Sunday)
          const dayOfWeek = index === 6 ? 0 : index + 1;
          const isToday = today === dayOfWeek;

          return (
            <Tooltip key={day}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center",
                    "text-xs font-mono font-bold transition-all duration-300 cursor-default",
                    hasPlanned
                      ? "bg-[#D9F99D] text-[#1A1A1A] shadow-sm"
                      : "bg-gray-100 text-gray-600",
                    isToday && "ring-2 ring-[#D9F99D] ring-offset-2 ring-offset-background",
                    hasPlanned && "hover:scale-110 hover:shadow-lg"
                  )}
                >
                  {DAY_LETTERS[day]}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {day}: {hasPlanned ? "Meals planned" : "No meals"}
                  {isToday && " (Today)"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
