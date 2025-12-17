"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { GripVertical, Clock, CheckCircle2, Circle } from "lucide-react";
import Image from "next/image";
import type { PrepSessionRecipeWithDetails, PrepRecipeStatus } from "@/types/meal-prep";

export interface PrepRecipeProgressProps {
  recipe: PrepSessionRecipeWithDetails;
  onStatusChange: (recipeId: string, newStatus: PrepRecipeStatus) => void;
}

const STATUS_STEPS: PrepRecipeStatus[] = [
  "pending",
  "prepping",
  "cooking",
  "cooling",
  "portioned",
  "done",
];

const STATUS_LABELS: Record<PrepRecipeStatus, string> = {
  pending: "Pending",
  prepping: "Prepping",
  cooking: "Cooking",
  cooling: "Cooling",
  portioned: "Portioned",
  done: "Done",
};

const STATUS_COLORS: Record<PrepRecipeStatus, string> = {
  pending: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  prepping: "bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  cooking: "bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  cooling: "bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  portioned: "bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-300",
  done: "bg-emerald-200 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
};

export function PrepRecipeProgress({
  recipe,
  onStatusChange,
}: PrepRecipeProgressProps) {
  const currentStatusIndex = STATUS_STEPS.indexOf(recipe.status);
  const progressPercentage = ((currentStatusIndex + 1) / STATUS_STEPS.length) * 100;

  const totalTime =
    (recipe.estimated_prep_minutes || 0) +
    (recipe.estimated_cook_minutes || 0);

  const handleStatusClick = (status: PrepRecipeStatus) => {
    const statusIndex = STATUS_STEPS.indexOf(status);
    const currentIndex = STATUS_STEPS.indexOf(recipe.status);

    // Only allow advancing to next status or going back one step
    if (statusIndex === currentIndex + 1 || statusIndex === currentIndex - 1) {
      onStatusChange(recipe.id, status);
    }
  };

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground/50" />
      </div>

      <CardContent className="p-4 pl-10">
        <div className="flex items-start gap-4">
          {/* Recipe Image Thumbnail */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {recipe.recipe.image_url ? (
              <Image
                src={recipe.recipe.image_url}
                alt={recipe.recipe.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-3xl opacity-20">🍽️</div>
              </div>
            )}
          </div>

          {/* Recipe Info and Progress */}
          <div className="flex-1 min-w-0">
            {/* Title and Badges */}
            <div className="flex items-start gap-2 mb-3">
              <h3 className="font-semibold text-base line-clamp-1 flex-1">
                {recipe.recipe.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Batch Multiplier Badge */}
                {recipe.batch_multiplier > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {recipe.batch_multiplier}x batch
                  </Badge>
                )}
                {/* Time Estimate */}
                {totalTime > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{totalTime}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Servings and Container Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{recipe.servings_to_prep} servings</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{recipe.containers_needed} containers</span>
              {recipe.container_type && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="capitalize">{recipe.container_type}</span>
                </>
              )}
            </div>

            {/* Progress Bar */}
            <Progress value={progressPercentage} className="h-2 mb-3" />

            {/* Status Stepper */}
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isNext = index === currentStatusIndex + 1;
                const isPrevious = index === currentStatusIndex - 1;
                const isClickable = isNext || isPrevious;

                return (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    onClick={() => isClickable && handleStatusClick(status)}
                    disabled={!isClickable && !isCurrent}
                    className={cn(
                      "flex-1 px-2 py-1 h-auto min-w-0 transition-all",
                      isCurrent && "ring-2 ring-primary ring-offset-1",
                      !isClickable && !isCurrent && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1 w-full">
                      {/* Status Icon */}
                      <div className="flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle
                            className={cn(
                              "h-4 w-4",
                              isCurrent && "fill-primary text-primary",
                              !isCurrent && "text-muted-foreground"
                            )}
                          />
                        )}
                      </div>
                      {/* Status Label */}
                      <span
                        className={cn(
                          "text-xs font-medium truncate w-full text-center",
                          isCurrent && STATUS_COLORS[status],
                          isCurrent && "px-1.5 py-0.5 rounded-md",
                          !isCurrent && isCompleted && "text-green-600 dark:text-green-400",
                          !isCurrent && !isCompleted && "text-muted-foreground"
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
