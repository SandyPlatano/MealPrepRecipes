"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/types/meal-plan";
import type { DefaultCooksByDay } from "@/types/settings";
import { getDefaultCooksByDay, setDefaultCookForDay, resetDefaultCooksByDay } from "@/app/actions/settings";
import { toast } from "sonner";

interface DefaultCooksByDayEditorProps {
  cookNames: string[];
  cookColors?: Record<string, string>;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

const SHORT_DAY_LABELS: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function DefaultCooksByDayEditor({ cookNames, cookColors = {} }: DefaultCooksByDayEditorProps) {
  const [defaults, setDefaults] = useState<DefaultCooksByDay>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load initial data
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const result = await getDefaultCooksByDay();
        if (!result.error && result.data) {
          setDefaults(result.data);
        }
      } catch (error) {
        console.error("Error loading default cooks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCookChange = (day: DayOfWeek, value: string) => {
    // Optimistic update
    const newCook = value === "__none__" ? null : value;
    setDefaults((prev) => ({ ...prev, [day]: newCook }));

    startTransition(async () => {
      const result = await setDefaultCookForDay(day, newCook);
      if (result.error) {
        toast.error(result.error);
        // Revert on error by reloading
        const reloaded = await getDefaultCooksByDay();
        if (reloaded.data) {
          setDefaults(reloaded.data);
        }
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetDefaultCooksByDay();
      if (result.error) {
        toast.error(result.error);
      } else {
        setDefaults({});
        toast.success("Default cooks cleared");
      }
    });
  };

  const hasAnyDefaults = Object.values(defaults).some((v) => v !== null && v !== undefined);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick-Add Defaults
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cookNames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick-Add Defaults
          </CardTitle>
          <CardDescription>
            Add cook names above to enable default cook assignments.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick-Add Defaults
            </CardTitle>
            <CardDescription className="mt-1">
              Pre-select who cooks on each day when adding meals.
            </CardDescription>
          </div>
          {hasAnyDefaults && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("space-y-3", isPending && "opacity-60 pointer-events-none")}>
          {DAYS_OF_WEEK.map((day) => {
            const currentCook = defaults[day] || null;
            const cookColor = currentCook ? cookColors[currentCook] : undefined;

            return (
              <div key={day} className="flex items-center gap-3">
                <span className="text-sm font-medium w-20 text-muted-foreground">
                  <span className="hidden sm:inline">{DAY_LABELS[day]}</span>
                  <span className="sm:hidden">{SHORT_DAY_LABELS[day]}</span>
                </span>
                <Select
                  value={currentCook || "__none__"}
                  onValueChange={(value) => handleCookChange(day, value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue>
                      {currentCook ? (
                        <div className="flex items-center gap-2">
                          {cookColor && (
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: cookColor }}
                            />
                          )}
                          <ChefHat className={cn("h-4 w-4", !cookColor && "text-muted-foreground")} />
                          <span>{currentCook}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No default</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">No default</span>
                    </SelectItem>
                    {cookNames.map((cook) => {
                      const color = cookColors[cook];
                      return (
                        <SelectItem key={cook} value={cook}>
                          <div className="flex items-center gap-2">
                            {color && (
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                              />
                            )}
                            <ChefHat className={cn("h-4 w-4", !color && "text-muted-foreground")} />
                            <span>{cook}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
