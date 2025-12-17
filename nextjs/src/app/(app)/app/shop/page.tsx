import { getShoppingListWithItems } from "@/app/actions/shopping-list";
import { getPantryItems } from "@/app/actions/pantry";
import { getSettings } from "@/app/actions/settings";
import { getWeekPlanForShoppingList, getWeeksMealCounts } from "@/app/actions/meal-plans";
import { checkAIQuota } from "@/app/actions/ai-meal-suggestions";
import { ShoppingListView } from "@/components/shopping-list/shopping-list-view";
import { WeekSelector } from "@/components/shopping/week-selector";
import { getWeekOptions, getUpcomingWeeks } from "@/components/shopping/week-utils";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getWeekStart } from "@/types/meal-plan";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/stripe/subscription";
import { ContextualHint } from "@/components/hints/contextual-hint";
import { HINT_IDS, HINT_CONTENT } from "@/lib/hints";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentWeekStart = getWeekStart(new Date()).toISOString().split("T")[0];

  // Get upcoming weeks for the multi-week selector
  const upcomingWeeks = getUpcomingWeeks(4);

  // Check subscription status for multi-week feature
  const canSelectMultipleWeeks = user ? await hasActiveSubscription(user.id, 'pro') : false;

  // Use lightweight query for shopping list (fetches only id, title, cook - not full recipe)
  const [listResult, pantryResult, settingsResult, weekPlanResult, aiQuota, weeksMealCountsResult] = await Promise.all([
    getShoppingListWithItems(),
    getPantryItems(),
    getSettings(),
    getWeekPlanForShoppingList(currentWeekStart),
    checkAIQuota(),
    getWeeksMealCounts(upcomingWeeks),
  ]);

  const shoppingList = listResult.data || {
    id: "",
    household_id: "",
    meal_plan_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [],
  };

  const pantryItems = pantryResult.data || [];
  const categoryOrder = settingsResult.data?.category_order || null;
  const weekPlan = weekPlanResult.data || null;
  const cookNames = settingsResult.data?.cook_names || [];
  const cookColors = settingsResult.data?.cook_colors || {};
  const subscriptionTier = aiQuota.data?.tier || 'free';
  const weekOptions = getWeekOptions(currentWeekStart, weeksMealCountsResult.data || []);
  const userUnitSystem = (settingsResult.data?.unit_system as "imperial" | "metric") || "imperial";

  // Extract show recipe sources preference from JSONB preferences column
  const preferences = settingsResult.data?.preferences as { ui?: { showRecipeSources?: boolean } } | null;
  const showRecipeSources = preferences?.ui?.showRecipeSources ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold">Shopping List</h1>
          <p className="text-muted-foreground mt-1">
            No more wandering around like a lost puppy. Organized by aisle.
          </p>
        </div>
        <Link
          href="/app/pantry"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
        >
          <Cookie className="h-4 w-4" />
          <span className="hidden sm:inline">Manage Pantry</span>
          <span className="sm:hidden">Pantry</span>
          {pantryItems.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
              {pantryItems.length}
            </span>
          )}
        </Link>
      </div>

      <ContextualHint
        hintId={HINT_IDS.SHOPPING_LIST_INTRO}
        title={HINT_CONTENT[HINT_IDS.SHOPPING_LIST_INTRO].title}
        description={HINT_CONTENT[HINT_IDS.SHOPPING_LIST_INTRO].description}
      />

      {/* Multi-Week Selector (Pro+ feature) */}
      <WeekSelector
        currentWeekStart={currentWeekStart}
        weekOptions={weekOptions}
        subscriptionTier={subscriptionTier}
        canSelectMultiple={canSelectMultipleWeeks}
      />

      <ShoppingListView
        shoppingList={shoppingList}
        initialPantryItems={pantryItems}
        initialCategoryOrder={categoryOrder}
        weekPlan={weekPlan}
        weekStart={currentWeekStart}
        cookNames={cookNames}
        cookColors={cookColors}
        userUnitSystem={userUnitSystem}
        initialShowRecipeSources={showRecipeSources}
      />
    </div>
  );
}
