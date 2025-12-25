"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWeekPlan,
  getOrCreateMealPlan,
  addMealAssignment,
  removeMealAssignment,
  getRecipesForPlanning,
} from "@/app/actions/meal-plans";
import type { WeekPlanData, MealType, DayOfWeek } from "@/types/meal-plan";
import type { Recipe } from "@/types/recipe";

// Query keys for meal plan cache management
export const mealPlanKeys = {
  all: ["meal-plans"] as const,
  weeks: () => [...mealPlanKeys.all, "week"] as const,
  week: (weekStart: string) => [...mealPlanKeys.weeks(), weekStart] as const,
  recipesForPlanning: () => [...mealPlanKeys.all, "recipes-for-planning"] as const,
};

/**
 * Hook to fetch the meal plan for a specific week.
 * Creates the plan if it doesn't exist.
 */
export function useWeekPlan(weekStart: string) {
  return useQuery({
    queryKey: mealPlanKeys.week(weekStart),
    queryFn: async () => {
      const result = await getWeekPlan(weekStart);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as WeekPlanData;
    },
    enabled: !!weekStart,
    staleTime: 2 * 60 * 1000, // 2 minutes - meal plans change more frequently
  });
}

/**
 * Hook to get or create a meal plan for a week.
 * Used when navigating to a new week.
 */
export function useGetOrCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weekStart: string) => {
      const result = await getOrCreateMealPlan(weekStart);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_data, weekStart) => {
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.week(weekStart) });
    },
  });
}

/**
 * Hook to add a meal assignment (assign recipe to a day/meal slot).
 */
export function useAddMealAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      weekStart,
      recipeId,
      dayOfWeek,
      cook,
      mealType,
      servingSize,
    }: {
      weekStart: string;
      recipeId: string;
      dayOfWeek: DayOfWeek;
      cook?: string;
      mealType?: MealType | null;
      servingSize?: number | null;
    }) => {
      const result = await addMealAssignment(
        weekStart,
        recipeId,
        dayOfWeek,
        cook,
        mealType,
        servingSize
      );
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      // Invalidate the specific week's plan
      queryClient.invalidateQueries({
        queryKey: mealPlanKeys.week(variables.weekStart),
      });
    },
  });
}

/**
 * Hook to remove a meal assignment.
 */
export function useRemoveMealAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const result = await removeMealAssignment(assignmentId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all week plans since we don't know which week the assignment was in
      queryClient.invalidateQueries({ queryKey: mealPlanKeys.weeks() });
    },
  });
}

/**
 * Hook to fetch recipes available for planning.
 * Lightweight list optimized for the recipe picker.
 */
export function useRecipesForPlanning() {
  return useQuery({
    queryKey: mealPlanKeys.recipesForPlanning(),
    queryFn: async () => {
      const result = await getRecipesForPlanning();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data as Recipe[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Prefetch a week's meal plan before navigation.
 * Call this when hovering over week navigation buttons.
 */
export function usePrefetchWeekPlan() {
  const queryClient = useQueryClient();

  return (weekStart: string) => {
    queryClient.prefetchQuery({
      queryKey: mealPlanKeys.week(weekStart),
      queryFn: async () => {
        const result = await getWeekPlan(weekStart);
        if (result.error) {
          throw new Error(result.error);
        }
        return result.data as WeekPlanData;
      },
      staleTime: 2 * 60 * 1000,
    });
  };
}
