'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';
import { checkAISuggestionQuota } from '@/lib/stripe/subscription';
import type { AISuggestionRecipe, AISuggestionResponse } from '@/types/ai-suggestion';

/**
 * Generate AI meal suggestions for a week
 */
export async function generateAIMealSuggestions(
  weekStart: string,
  lockedDays: string[] = [],
  preferences?: { max_complex_recipes?: number }
) {
  try {
    const { user, household } = await getCachedUserWithHousehold();

    if (!user || !household) {
      return { error: 'You must be logged in' };
    }

    // Make API request
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/suggest-meals`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: '', // Will be set by server
        },
        body: JSON.stringify({
          week_start: weekStart,
          locked_days: lockedDays,
          preferences,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to generate suggestions' };
    }

    const data: AISuggestionResponse = await response.json();
    return { data };
  } catch (error) {
    console.error('Error generating AI meal suggestions:', error);
    return { error: 'Failed to generate suggestions' };
  }
}

/**
 * Accept all AI suggestions and add them to the meal plan
 */
export async function acceptAllSuggestions(
  suggestions: AISuggestionRecipe[],
  weekStart: string
) {
  try {
    const { user, household } = await getCachedUserWithHousehold();

    if (!user || !household) {
      return { error: 'You must be logged in' };
    }

    const supabase = await createClient();

    // First, save any new (AI-generated) recipes to the library
    const newRecipes: Record<string, string> = {}; // Map temp title to real recipe_id

    for (const suggestion of suggestions) {
      if (suggestion.recipe_id === null) {
        // This is a new AI-generated recipe, save it
        const { data: newRecipe, error } = await supabase
          .from('recipes')
          .insert({
            title: suggestion.title,
            recipe_type: 'Dinner',
            category: suggestion.cuisine || 'Other',
            protein_type: suggestion.protein_type || 'Other',
            prep_time: suggestion.prep_time,
            cook_time: suggestion.cook_time || 30,
            servings: suggestion.servings,
            base_servings: suggestion.servings,
            ingredients: suggestion.ingredients,
            instructions: suggestion.instructions,
            tags: [...(suggestion.tags || []), 'AI Generated'],
            allergen_tags: suggestion.allergen_tags || [],
            household_id: household.household_id,
            user_id: user.id,
            is_shared_with_household: true,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error saving new recipe:', error);
          continue;
        }

        if (newRecipe) {
          newRecipes[suggestion.title] = newRecipe.id;
        }
      }
    }

    // Get or create meal plan for the week
    const { data: existingPlan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('household_id', household.household_id)
      .eq('week_start', weekStart)
      .single();

    let mealPlanId: string;

    if (existingPlan) {
      mealPlanId = existingPlan.id;
    } else {
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          household_id: household.household_id,
          week_start: weekStart,
        })
        .select('id')
        .single();

      if (planError || !newPlan) {
        return { error: 'Failed to create meal plan' };
      }

      mealPlanId = newPlan.id;
    }

    // Delete existing assignments for suggested days
    const suggestedDays = suggestions.map((s) => s.day);
    await supabase
      .from('meal_assignments')
      .delete()
      .eq('meal_plan_id', mealPlanId)
      .in('day_of_week', suggestedDays);

    // Add new meal assignments
    const assignments = suggestions.map((suggestion) => ({
      meal_plan_id: mealPlanId,
      recipe_id: suggestion.recipe_id || newRecipes[suggestion.title],
      day_of_week: suggestion.day,
      cook: null, // User can assign later
    }));

    const { error: assignError } = await supabase
      .from('meal_assignments')
      .insert(assignments);

    if (assignError) {
      return { error: 'Failed to add meals to plan' };
    }

    // Update suggestion log with accepted count
    await supabase
      .from('ai_suggestion_logs')
      .update({ accepted_count: suggestions.length })
      .eq('household_id', household.household_id)
      .eq('week_start', weekStart)
      .order('created_at', { ascending: false })
      .limit(1);

    revalidatePath('/app/plan');
    return { data: { success: true, meal_plan_id: mealPlanId } };
  } catch (error) {
    console.error('Error accepting suggestions:', error);
    return { error: 'Failed to accept suggestions' };
  }
}

/**
 * Swap a single day's suggestion
 */
export async function swapSingleSuggestion(
  day: string,
  weekStart: string,
  currentSuggestions: AISuggestionRecipe[]
) {
  try {
    const { user } = await getCachedUserWithHousehold();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    // For now, just call the full API with only this day unlocked
    const lockedDays = currentSuggestions
      .filter((s) => s.day !== day)
      .map((s) => s.day);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/suggest-meals`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_start: weekStart,
          locked_days: lockedDays,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to swap suggestion' };
    }

    const data: AISuggestionResponse = await response.json();

    // Return just the new suggestion for this day
    const newSuggestion = data.suggestions.find((s) => s.day === day);
    return { data: newSuggestion };
  } catch (error) {
    console.error('Error swapping suggestion:', error);
    return { error: 'Failed to swap suggestion' };
  }
}

/**
 * Check AI suggestion quota
 */
export async function checkAIQuota() {
  try {
    const { user } = await getCachedUserWithHousehold();

    if (!user) {
      return { error: 'You must be logged in' };
    }

    const quota = await checkAISuggestionQuota(user.id);
    return { data: quota };
  } catch (error) {
    console.error('Error checking quota:', error);
    return { error: 'Failed to check quota' };
  }
}
