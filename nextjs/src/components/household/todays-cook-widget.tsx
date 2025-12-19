"use client";

import { useState, useEffect } from "react";
import { ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getTodaysCook } from "@/app/actions/household";
import { useCookingScheduleRealtime } from "@/hooks/use-household-realtime";
import type { TodaysCook, ScheduleMealType } from "@/types/household";
import { getTodaysCookDisplayName } from "@/types/household";

// ============================================================================
// Types
// ============================================================================

interface TodaysCookWidgetProps {
  householdId: string | null;
  showMealTypeTabs?: boolean;
  defaultMealType?: ScheduleMealType;
  compact?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get initials from cook name for avatar fallback
 */
function getInitials(name: string): string {
  if (!name || name === "No one assigned") {
    return "?";
  }

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get meal type display label
 */
function getMealTypeLabel(mealType: ScheduleMealType): string {
  return mealType.charAt(0).toUpperCase() + mealType.slice(1);
}

// ============================================================================
// Component
// ============================================================================

export function TodaysCookWidget({
  householdId,
  showMealTypeTabs = false,
  defaultMealType = "dinner",
  compact = false,
}: TodaysCookWidgetProps) {
  const [selectedMealType, setSelectedMealType] = useState<ScheduleMealType>(defaultMealType);
  const [todaysCook, setTodaysCook] = useState<TodaysCook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's cook
  const fetchTodaysCook = async (mealType: ScheduleMealType) => {
    if (!householdId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await getTodaysCook(mealType);

    if (fetchError) {
      setError(fetchError);
    } else {
      setTodaysCook(data);
    }

    setIsLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchTodaysCook(selectedMealType);
  }, [selectedMealType, householdId]);

  // Subscribe to real-time schedule changes
  useCookingScheduleRealtime(householdId, () => {
    fetchTodaysCook(selectedMealType);
  });

  // Handle meal type change
  const handleMealTypeChange = (mealType: string) => {
    setSelectedMealType(mealType as ScheduleMealType);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-3" : ""}>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChefHat className="h-4 w-4" />
            {showMealTypeTabs ? "Today's Cook" : `Today's ${getMealTypeLabel(selectedMealType)}`}
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? "p-0" : ""}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-3" : ""}>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChefHat className="h-4 w-4" />
            Today's Cook
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? "p-0" : ""}>
          <p className="text-sm text-muted-foreground">Failed to load cook schedule</p>
        </CardContent>
      </Card>
    );
  }

  // Get display name
  const displayName = getTodaysCookDisplayName(todaysCook);
  const isAssigned = todaysCook !== null && displayName !== "No one assigned";
  const initials = getInitials(displayName);

  // Render with tabs
  if (showMealTypeTabs) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardHeader className={compact ? "p-0 pb-3" : ""}>
          <CardTitle className="flex items-center gap-2 text-base">
            <ChefHat className="h-4 w-4" />
            Today's Cook
          </CardTitle>
        </CardHeader>
        <CardContent className={compact ? "p-0" : ""}>
          <Tabs value={selectedMealType} onValueChange={handleMealTypeChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedMealType} className="mt-4">
              {isAssigned ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {todaysCook?.user_avatar_url && (
                      <AvatarImage src={todaysCook.user_avatar_url} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate">{displayName}</p>
                    <Badge variant="secondary" className="mt-1">
                      {getMealTypeLabel(selectedMealType)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <ChefHat className="h-5 w-5 opacity-30" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">No cook scheduled</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Render single meal type
  return (
    <Card className={compact ? "p-4" : ""}>
      <CardHeader className={compact ? "p-0 pb-3" : ""}>
        <CardTitle className="flex items-center gap-2 text-base">
          <ChefHat className="h-4 w-4" />
          Today's {getMealTypeLabel(selectedMealType)}
        </CardTitle>
      </CardHeader>
      <CardContent className={compact ? "p-0" : ""}>
        {isAssigned ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {todaysCook?.user_avatar_url && (
                <AvatarImage src={todaysCook.user_avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground">is cooking today</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <ChefHat className="h-5 w-5 opacity-30" />
            </div>
            <div className="flex-1">
              <p className="text-sm">No cook scheduled</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
