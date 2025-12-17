"use client";

import * as React from "react";
import { Timer, Activity, Coffee, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PrepTimeline, PrepTimelineStep } from "@/types/meal-prep";

export interface PrepTimelineProps {
  timeline: PrepTimeline;
  currentStep?: number;
}

/**
 * Format minutes as "H:MM" (e.g., 45 -> "0:45", 90 -> "1:30")
 */
function formatTimeOffset(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Get color classes for action type badges
 */
function getActionBadgeStyles(action: PrepTimelineStep["action"]) {
  switch (action) {
    case "prep":
      return "!bg-blue-100 !text-blue-800 !border-blue-300 dark:!bg-blue-900 dark:!text-blue-200 dark:!border-blue-700";
    case "cook":
      return "!bg-orange-100 !text-orange-800 !border-orange-300 dark:!bg-orange-900 dark:!text-orange-200 dark:!border-orange-700";
    case "rest":
      return "!bg-gray-100 !text-gray-800 !border-gray-300 dark:!bg-gray-800 dark:!text-gray-200 dark:!border-gray-600";
    case "portion":
      return "!bg-green-100 !text-green-800 !border-green-300 dark:!bg-green-900 dark:!text-green-200 dark:!border-green-700";
    default:
      return "";
  }
}

export function PrepTimeline({ timeline, currentStep }: PrepTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-5 w-5" />
          Prep Timeline
        </CardTitle>
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{timeline.total_duration_minutes} min total</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{timeline.active_time_minutes} min active</span>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{timeline.passive_time_minutes} min passive</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {timeline.steps.map((step, index) => {
              const isCurrentStep = currentStep !== undefined && index === currentStep;

              return (
                <div
                  key={index}
                  className={cn(
                    "relative flex gap-4 pb-4",
                    index !== timeline.steps.length - 1 && "border-l-2 border-muted ml-4"
                  )}
                >
                  {/* Time marker */}
                  <div className="flex-shrink-0 w-16 -ml-[2.5rem]">
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background",
                        isCurrentStep
                          ? "border-primary animate-pulse shadow-lg shadow-primary/50"
                          : "border-muted"
                      )}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-1 font-mono">
                      {formatTimeOffset(step.time_offset_minutes)}
                    </div>
                  </div>

                  {/* Step content */}
                  <div
                    className={cn(
                      "flex-1 rounded-lg border p-4 bg-card transition-all",
                      step.is_passive && "border-dashed",
                      isCurrentStep && "border-primary shadow-md"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{step.recipe_title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Badge className={getActionBadgeStyles(step.action)}>
                        {step.action}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Timer className="h-3 w-3" />
                      <span>{step.duration_minutes} min</span>
                      {step.is_passive && (
                        <span className="ml-2 italic">(passive - you can multitask)</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Parallel opportunities */}
        {timeline.parallel_opportunities.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Parallel Opportunities
            </h4>
            <ul className="space-y-2">
              {timeline.parallel_opportunities.map((opportunity, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
