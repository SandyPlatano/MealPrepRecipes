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
import { UpgradeModal } from "@/components/subscriptions/UpgradeModal";
import type { SubscriptionTier } from "@/types/subscription";

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
    <div className="flex flex-col gap-3 pb-4 border-b">
      {/* Week Navigation - Full width */}
      <div className="flex items-center gap-2 w-full">
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
              className="flex-1 justify-center font-mono font-semibold h-10 min-w-0"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="truncate">{formatWeekRange(weekStartDate)}</span>
              {!canNavigateWeeks && (
                <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[70vh] max-h-[70vh] w-[95vw] max-w-md p-0 flex flex-col [&>button]:z-10">
            <div className="p-4 pb-2 flex-1 overflow-auto">
              {!canNavigateWeeks && (
                <div className="mb-3 p-3 bg-muted rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4" />
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
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="hidden sm:inline-flex h-10">
            This Week
          </Button>
        )}
      </div>

      {/* Actions - Full width */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full">
        {/* Review Button */}
        {hasMeals ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-[1_1_auto] sm:flex-none gap-2 min-w-[80px] h-10"
          >
            <Link href={`/app/review?week=${weekStartStr}`}>
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Review</span>
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            variant="outline"
            size="sm"
            className="flex-[1_1_auto] sm:flex-none gap-2 min-w-[80px] h-10"
          >
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Review</span>
          </Button>
        )}

        {/* Confirm Plan Button - Primary CTA */}
        {hasMeals ? (
          <Button
            asChild
            size="sm"
            className="flex-[1_1_auto] sm:flex-none gap-2 sm:min-w-[120px] min-w-[100px] h-10"
          >
            <Link href={`/app/confirmation?week=${weekStartStr}`}>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Confirm Plan</span>
              <span className="sm:hidden truncate">Confirm</span>
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            size="sm"
            className="flex-[1_1_auto] sm:flex-none gap-2 sm:min-w-[120px] min-w-[100px] h-10"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline truncate">Confirm Plan</span>
            <span className="sm:hidden truncate">Confirm</span>
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

