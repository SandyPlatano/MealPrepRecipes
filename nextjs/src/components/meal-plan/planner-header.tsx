"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Lock,
  Eye,
} from "lucide-react";
import { formatWeekRange, getWeekStart } from "@/types/meal-plan";
import { SaveTemplateDialog } from "./save-template-dialog";
import { TemplateManagerDialog } from "./template-manager-dialog";
import { AISuggestionModal } from "./AISuggestionModal";
import { PlannerViewToggle } from "./planner-view-toggle";
import { UpgradeModal } from "@/components/subscriptions/UpgradeModal";
import type { SubscriptionTier } from "@/types/subscription";
import type { PlannerViewSettings } from "@/types/settings";
import { DEFAULT_PLANNER_VIEW_SETTINGS } from "@/types/settings";

interface PlannerHeaderProps {
  weekStartStr: string;
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
  canNavigateWeeks?: boolean;
  plannerViewSettings?: PlannerViewSettings;
  onPlannerViewChange?: (settings: PlannerViewSettings) => void;
}

export function PlannerHeader({
  weekStartStr,
  onCopyLastWeek,
  onClearAll,
  hasMeals,
  previousWeekMealCount,
  currentWeekMealCount,
  subscriptionTier = 'free',
  aiQuotaRemaining = null,
  existingMealDays = [],
  canNavigateWeeks = false,
  plannerViewSettings,
  onPlannerViewChange,
}: PlannerHeaderProps) {
  const router = useRouter();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalFeature, setUpgradeModalFeature] = useState("AI Meal Suggestions");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Create a Date object for display purposes (e.g., formatWeekRange, Calendar)
  // Use 'T00:00:00' to ensure consistent parsing across timezones
  const weekStartDate = new Date(weekStartStr + "T00:00:00");

  // Defer isCurrentWeek calculation to avoid hydration mismatch
  const isCurrentWeek = isMounted
    ? weekStartStr === getWeekStart(new Date()).toISOString().split("T")[0]
    : false;

  const navigateWeek = (direction: "prev" | "next") => {
    if (!canNavigateWeeks) {
      setUpgradeModalFeature("Multi-Week Planning");
      setUpgradeModalOpen(true);
      return;
    }
    const newDate = new Date(weekStartStr + "T00:00:00");
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
    if (!date) return;

    const monday = getWeekStart(date);
    const weekStr = monday.toISOString().split("T")[0];
    const currentWeekStr = getWeekStart(new Date()).toISOString().split("T")[0];

    // Allow selecting current week even for free users
    if (!canNavigateWeeks && weekStr !== currentWeekStr) {
      setUpgradeModalFeature("Multi-Week Planning");
      setUpgradeModalOpen(true);
      setCalendarOpen(false);
      return;
    }

    router.push(`/app/plan?week=${weekStr}`);
    setCalendarOpen(false);
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
      setUpgradeModalFeature("AI Meal Suggestions");
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
          className="h-10 w-10 flex-shrink-0 relative"
        >
          <ChevronLeft className="h-5 w-5" />
          {!canNavigateWeeks && (
            <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
          )}
        </Button>

        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="justify-center font-mono font-semibold h-10 min-w-0"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="truncate">{formatWeekRange(weekStartDate)}</span>
              {!canNavigateWeeks && (
                <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-sm p-0 overflow-hidden [&>button]:z-10">
            {/* Header */}
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold tracking-tight">Select Week</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Choose a week to plan your meals
              </p>
            </div>

            {/* Calendar */}
            <div className="px-4 pb-6">
              {!canNavigateWeeks && (
                <div className="mb-4 mx-2 p-3 bg-gradient-to-r from-coral-50 to-coral-100/50 dark:from-coral-950/30 dark:to-coral-900/20 rounded-xl text-sm text-coral-700 dark:text-coral-300 flex items-center gap-2 border border-coral-200/50 dark:border-coral-800/30">
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  <span>Upgrade to Pro to plan any week</span>
                </div>
              )}
              <Calendar
                mode="single"
                selected={weekStartDate}
                onSelect={handleDateSelect}
                initialFocus
                className="w-full"
              />
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateWeek("next")}
          className="h-10 w-10 flex-shrink-0 relative"
        >
          <ChevronRight className="h-5 w-5" />
          {!canNavigateWeeks && (
            <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
          )}
        </Button>

        {!isCurrentWeek && (
          <>
            <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="hidden sm:inline-flex h-10">
              This Week
            </Button>
            <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="sm:hidden h-10">
              Today
            </Button>
          </>
        )}
      </div>

      {/* Actions - Right side */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <PlannerViewToggle
          settings={plannerViewSettings || DEFAULT_PLANNER_VIEW_SETTINGS}
          onChange={onPlannerViewChange}
        />

        {/* Review Button */}
        {hasMeals ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-2 h-10"
          >
            <Link href={`/app/review?week=${weekStartStr}`}>
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span>Review</span>
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            variant="outline"
            size="sm"
            className="gap-2 h-10"
          >
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span>Review</span>
          </Button>
        )}

        {/* Confirm Plan Button - Primary CTA */}
        {hasMeals ? (
          <Button
            asChild
            size="sm"
            className="gap-2 h-10"
          >
            <Link href={`/app/confirmation?week=${weekStartStr}`}>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Confirm Plan</span>
              <span className="sm:hidden">Confirm</span>
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            size="sm"
            className="gap-2 h-10"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Confirm Plan</span>
            <span className="sm:hidden">Confirm</span>
          </Button>
        )}

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* AI Suggest */}
            <DropdownMenuItem
              onClick={handleAISuggest}
              disabled={quotaExhausted}
              className="text-coral-600 focus:text-coral-600"
            >
              <Sparkles className="h-4 w-4 mr-2 text-coral-500" />
              {canUseAI
                ? quotaExhausted
                  ? 'Quota Used'
                  : `AI Suggest${aiQuotaRemaining !== null ? ` (${aiQuotaRemaining} left)` : ''}`
                : 'AI Suggest ✨'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
      </div>

      {/* Template Dialogs */}
      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        weekStart={weekStartStr}
        mealCount={currentWeekMealCount}
      />
      <TemplateManagerDialog
        open={templateManagerOpen}
        onOpenChange={setTemplateManagerOpen}
        weekStart={weekStartStr}
      />

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        weekStart={weekStartStr}
        existingMealDays={existingMealDays}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        feature={upgradeModalFeature}
      />
    </div>
  );
}

