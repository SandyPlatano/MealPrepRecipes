"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Copy,
  Trash2,
  CheckCircle2,
  Save,
  FolderOpen,
} from "lucide-react";
import { formatWeekRange, getWeekStart } from "@/types/meal-plan";
import { SaveTemplateDialog } from "./save-template-dialog";
import { TemplateManagerDialog } from "./template-manager-dialog";

interface PlannerHeaderProps {
  weekStart: Date;
  onCopyLastWeek: () => Promise<void>;
  onClearAll: () => Promise<void>;
  onSendPlan: () => Promise<void>;
  hasMeals: boolean;
  previousWeekMealCount: number;
  isSending?: boolean;
  currentWeekMealCount: number;
}

export function PlannerHeader({
  weekStart,
  onCopyLastWeek,
  onClearAll,
  hasMeals,
  previousWeekMealCount,
}: PlannerHeaderProps) {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const isCurrentWeek =
    weekStart.toISOString().split("T")[0] ===
    getWeekStart(new Date()).toISOString().split("T")[0];

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    const weekStr = newDate.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  };

  const goToCurrentWeek = () => {
    const currentWeek = getWeekStart(new Date());
    const weekStr = currentWeek.toISOString().split("T")[0];
    router.push(`/app/plan?week=${weekStr}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const monday = getWeekStart(date);
      const weekStr = monday.toISOString().split("T")[0];
      router.push(`/app/plan?week=${weekStr}`);
      setCalendarOpen(false);
    }
  };

  const handleCopyLastWeek = async () => {
    setIsCopying(true);
    try {
      await onCopyLastWeek();
    } finally {
      setIsCopying(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await onClearAll();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
      {/* Week Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("prev")}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[160px] justify-center font-mono font-semibold"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {formatWeekRange(weekStart)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={weekStart}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("next")}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
            This Week
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[100px]">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleCopyLastWeek}
              disabled={previousWeekMealCount === 0 || isCopying}
            >
              <Copy className="h-4 w-4 mr-2" />
              {isCopying ? "Copying..." : `Copy Last Week (${previousWeekMealCount})`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleClearAll}
              disabled={!hasMeals || isClearing}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? "Clearing..." : "Clear All Meals"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Finalize Plan Button - Primary CTA */}
        <Button
          onClick={() => {
            const weekStr = weekStart.toISOString().split("T")[0];
            router.push(`/app/finalize?week=${weekStr}`);
          }}
          disabled={!hasMeals}
          size="sm"
          className="gap-2 min-w-[120px]"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="hidden sm:inline">Finalize Plan</span>
          <span className="sm:hidden">Finalize</span>
        </Button>
      </div>
    </div>
  );
}

