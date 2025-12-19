import { getPantryItems } from "@/app/actions/pantry";
import { getSettings } from "@/app/actions/settings";
import { EnhancedPantryView } from "@/components/pantry/enhanced-pantry-view";
import { createClient } from "@/lib/supabase/server";
import { getUserTier } from "@/lib/stripe/subscription";
import { ContextualHint } from "@/components/hints/contextual-hint";
import { HINT_IDS, HINT_CONTENT } from "@/lib/hints";

export default async function PantryPage() {
  const supabase = await createClient();

  // Get pantry items and settings in parallel
  const [pantryResult, settingsResult] = await Promise.all([
    getPantryItems(),
    getSettings(),
  ]);

  const pantryItems = pantryResult.data || [];

  // Get user's subscription tier (respects localhost for development)
  let subscriptionTier: 'free' | 'pro' | 'premium' = 'free';
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    subscriptionTier = await getUserTier(user.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Pantry</h1>
        <p className="text-muted-foreground mt-1">
          Track what you already have. Scan your fridge or pantry with AI to automatically detect ingredients.
        </p>
      </div>

      <ContextualHint
        hintId={HINT_IDS.PANTRY_INTRO}
        title={HINT_CONTENT[HINT_IDS.PANTRY_INTRO].title}
        description={HINT_CONTENT[HINT_IDS.PANTRY_INTRO].description}
      />

      <EnhancedPantryView
        initialItems={pantryItems}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}