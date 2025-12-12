"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { formatWeekRange, getWeekStart } from "@/types/meal-plan";
import { SaveTemplateDialog } from "./save-template-dialog";
import { TemplateManagerDialog } from "./template-manager-dialog";
import { AISuggestionModal } from "./AISuggestionModal";
import { UpgradeModal } from "@/components/subscriptions/UpgradeModal";
import type { SubscriptionTier } from "@/types/subscription";

interface PlannerHeaderProps {
  weekStart: Date;
  onCopyLastWeek: () => Promise<void>;
  onClearAll: () => Promise<void>;
  onSendPlan: () => Promise<void>;
  hasMeals: boolean;
  previousWeekMealCount: number;
  isSending?: boolean;
  currentWeekMealCount: number;
  subscriptionTier?: SubscriptionTier;
  aiQuotaRemaining?: number | null;
  existingMealDays?: string[];
}

export function PlannerHeader({
  weekStart,
  onCopyLastWeek,
  onClearAll,
  hasMeals,
  previousWeekMealCount,
  currentWeekMealCount,
  subscriptionTier = 'free',
  aiQuotaRemaining = null,
  existingMealDays = [],
}: PlannerHeaderProps) {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Defer isCurrentWeek calculation to avoid hydration mismatch
  const isCurrentWeek = isMounted
    ? weekStart.toISOString().split("T")[0] ===
      getWeekStart(new Date()).toISOString().split("T")[0]
    : false;

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

  const handleAISuggest = () => {
    if (subscriptionTier === 'free') {
      setUpgradeModalOpen(true);
    } else if (subscriptionTier === 'pro' && aiQuotaRemaining !== null && aiQuotaRemaining <= 0) {
      // Show quota exhausted state
      return;
    } else {
      setAiModalOpen(true);
    }
  };

  const canUseAI = subscriptionTier !== 'free';
  const quotaExhausted = subscriptionTier === 'pro' && aiQuotaRemaining !== null && aiQuotaRemaining <= 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b">
      {/* Week Navigation - Left side */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("prev")}
          className="h-10 w-10 flex-shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="sm:min-w-[180px] justify-center font-mono font-semibold h-10"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="truncate">{formatWeekRange(weekStart)}</span>
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
          className="h-10 w-10 flex-shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="hidden sm:inline-flex h-10">
            This Week
          </Button>
        )}
      </div>

      {/* Actions - Right side */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* AI Suggest Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAISuggest}
          disabled={quotaExhausted}
          className="flex-[1_1_auto] sm:flex-none min-w-[80px] gap-2 h-10 border-coral-500 hover:bg-coral-50 dark:hover:bg-coral-950/20"
        >
          <Sparkles className="h-4 w-4 text-coral-500 flex-shrink-0" />
          <span className="hidden md:inline truncate">
            {canUseAI
              ? quotaExhausted
                ? 'Quota Used'
                : 'AI Suggest'
              : 'AI Suggest ✨'}
          </span>
          <span className="md:hidden">AI</span>
          {canUseAI && aiQuotaRemaining !== null && !quotaExhausted && (
            <span className="hidden sm:inline text-xs text-muted-foreground">
              ({aiQuotaRemaining} left)
            </span>
          )}
        </Button>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-[1_1_auto] sm:flex-none sm:min-w-[100px] min-w-[80px] h-10">
              <MoreHorizontal className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => setTemplateManagerOpen(true)}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Templates
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSaveTemplateOpen(true)}
              disabled={!hasMeals}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
          className="flex-[1_1_auto] sm:flex-none gap-2 sm:min-w-[120px] min-w-[100px] h-10"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline truncate">Finalize Plan</span>
          <span className="sm:hidden truncate">Finalize</span>
        </Button>

        {!isCurrentWeek && (
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="sm:hidden h-10 flex-shrink-0 min-w-[60px]">
            Today
          </Button>
        )}
      </div>

      {/* Template Dialogs */}
      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        weekStart={weekStart.toISOString().split("T")[0]}
        mealCount={currentWeekMealCount}
      />
      <TemplateManagerDialog
        open={templateManagerOpen}
        onOpenChange={setTemplateManagerOpen}
        weekStart={weekStart.toISOString().split("T")[0]}
      />

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        weekStart={weekStart.toISOString().split("T")[0]}
        existingMealDays={existingMealDays}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature="AI Meal Suggestions"
      />
    </div>
  );
}

