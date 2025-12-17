"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Calendar,
  Download,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatWeekRange } from "@/types/meal-plan";
import type { DayOfWeek } from "@/types/meal-plan";
import { downloadMealPlanAsMarkdown } from "@/lib/export";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  prep_time: string | null;
  cook_time: string | null;
  ingredients: string[];
  instructions: string[];
}

interface Assignment {
  id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  cook: string | null;
  recipe: Recipe;
}

interface ConfirmationActionsProps {
  weekStart: Date;
  assignments: Assignment[];
  weekStartStr: string;
}

export function ConfirmationActions({
  weekStart,
  assignments,
  weekStartStr,
}: ConfirmationActionsProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSendEmail = async () => {
    if (assignments.length === 0) {
      toast.error("No meals to send");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/send-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: formatWeekRange(weekStart),
          weekStart: weekStartStr,
          items: assignments.map((a) => ({
            recipe: a.recipe,
            cook: a.cook,
            day: a.day_of_week,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to send plan");
      } else {
        toast.success("Plan sent to your email!");
      }
    } catch {
      toast.error("Failed to send plan");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (assignments.length === 0) {
      toast.error("No meals to add to calendar");
      return;
    }

    setIsAddingToCalendar(true);
    try {
      const response = await fetch("/api/google-calendar/create-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: formatWeekRange(weekStart),
          items: assignments.map((a) => ({
            recipe: a.recipe,
            cook: a.cook,
            day: a.day_of_week,
          })),
          userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to add to calendar");
      } else if (result.eventsCreated > 0) {
        toast.success(`Created ${result.eventsCreated} calendar events!`);
      } else {
        toast.info(
          "No events created. Check Google Calendar connection in Settings."
        );
      }
    } catch {
      toast.error("Failed to add to calendar");
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const handleDownload = () => {
    if (assignments.length === 0) {
      toast.error("No meals to download");
      return;
    }

    setIsDownloading(true);

    try {
      // Convert assignments to the format expected by the markdown generator
      const mealPlanAssignments = assignments.map((a) => ({
        day_of_week: a.day_of_week,
        cook: a.cook,
        recipe: {
          id: a.recipe.id,
          title: a.recipe.title,
          recipe_type: a.recipe.recipe_type,
          prep_time: a.recipe.prep_time,
          cook_time: a.recipe.cook_time,
          ingredients: a.recipe.ingredients,
          instructions: a.recipe.instructions,
        },
      }));

      // Download as markdown
      downloadMealPlanAsMarkdown({
        weekRange: formatWeekRange(weekStart),
        assignments: mealPlanAssignments,
        includeFullRecipes: true,
      });

      toast.success("Meal plan downloaded!");
    } catch {
      toast.error("Failed to download");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartNewWeek = () => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];
    router.push(`/app?week=${nextWeekStr}`);
  };

  return (
    <Card className="border-t-2 border-primary/20 sticky bottom-0 md:bottom-4 z-10 shadow-lg -mx-4 md:mx-0 rounded-none md:rounded-xl">
      <CardContent className="px-4 py-3 md:p-4 pb-safe">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3">
          {/* Share actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send to Email
            </Button>

            <Button
              variant="outline"
              onClick={handleAddToCalendar}
              disabled={isAddingToCalendar}
            >
              {isAddingToCalendar ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Add to Calendar
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </div>

          <div className="flex-1" />

          {/* Primary CTA */}
          <Button onClick={handleStartNewWeek}>
            Start Planning Next Week
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Mobile Layout - 4 even buttons in a grid */}
        <div className="md:hidden grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={handleSendEmail}
            disabled={isSending}
            className="h-12 flex flex-col items-center justify-center gap-1 px-1"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            <span className="text-[10px] font-medium">Email</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-12 flex flex-col items-center justify-center gap-1 px-1"
          >
            {isDownloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span className="text-[10px] font-medium">Download</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleAddToCalendar}
            disabled={isAddingToCalendar}
            className="h-12 flex flex-col items-center justify-center gap-1 px-1"
          >
            {isAddingToCalendar ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
            <span className="text-[10px] font-medium">Calendar</span>
          </Button>

          <Button
            onClick={handleStartNewWeek}
            className="h-12 flex flex-col items-center justify-center gap-1 px-1"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="text-[10px] font-medium">Next</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
