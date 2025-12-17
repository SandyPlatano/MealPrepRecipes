"use client";

import { format } from "date-fns";
import { CalendarDays, Clock, ChefHat, Play, Eye, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PrepSession, PrepSessionStatus } from "@/types/meal-prep";

// ============================================================================
// Types
// ============================================================================

export interface PrepSessionCardProps {
  session: PrepSession;
  recipeCount?: number;
  completedRecipeCount?: number;
  onStart?: (sessionId: string) => void;
  onView?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get status badge variant and label
 */
function getStatusConfig(status: PrepSessionStatus): {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
  className: string;
} {
  switch (status) {
    case "planned":
      return {
        variant: "default",
        label: "Planned",
        className: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20",
      };
    case "in_progress":
      return {
        variant: "default",
        label: "In Progress",
        className: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/20",
      };
    case "completed":
      return {
        variant: "default",
        label: "Completed",
        className: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20",
      };
    case "cancelled":
      return {
        variant: "secondary",
        label: "Cancelled",
        className: "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
      };
  }
}

/**
 * Format minutes to human readable time
 */
function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ============================================================================
// Component
// ============================================================================

export function PrepSessionCard({
  session,
  recipeCount = 0,
  completedRecipeCount = 0,
  onStart,
  onView,
  onDelete,
}: PrepSessionCardProps) {
  const statusConfig = getStatusConfig(session.status);
  const scheduledDate = new Date(session.scheduled_date);
  const progress = calculateProgress(completedRecipeCount, recipeCount);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {session.name}
            </CardTitle>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{format(scheduledDate, "MMM d, yyyy")}</span>
              </div>
              {session.estimated_total_time_minutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatMinutes(session.estimated_total_time_minutes)}</span>
                </div>
              )}
            </div>
          </div>
          <Badge
            variant={statusConfig.variant}
            className={statusConfig.className}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipe count and progress */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ChefHat className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {recipeCount} {recipeCount === 1 ? "recipe" : "recipes"}
              {session.status === "in_progress" && recipeCount > 0 && (
                <span className="ml-1">
                  ({completedRecipeCount}/{recipeCount} done)
                </span>
              )}
            </span>
          </div>

          {/* Progress bar for in-progress sessions */}
          {session.status === "in_progress" && recipeCount > 0 && (
            <Progress value={progress} className="h-2" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          {/* Start button - only for planned sessions */}
          {session.status === "planned" && onStart && (
            <Button
              size="sm"
              onClick={() => onStart(session.id)}
              className="flex-1"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Start
            </Button>
          )}

          {/* View button - always available */}
          {onView && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(session.id)}
              className={session.status === "planned" && onStart ? "flex-1" : "flex-1"}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          )}

          {/* Delete button - only for cancelled/completed or if no onStart */}
          {onDelete && (session.status === "cancelled" || session.status === "completed" || !onStart) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(session.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
