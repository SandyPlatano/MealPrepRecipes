import { getPantryItems } from "@/app/actions/pantry";
import { EnhancedPantryView } from "@/components/pantry/enhanced-pantry-view";
import { createClient } from "@/lib/supabase/server";

export default async function PantryPage() {
  const supabase = await createClient();

  // Get pantry items
  const pantryResult = await getPantryItems();
  const pantryItems = pantryResult.data || [];

  // Get user's subscription tier
  let subscriptionTier: 'free' | 'pro' | 'premium' = 'free';
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier) {
      subscriptionTier = profile.subscription_tier as 'free' | 'pro' | 'premium';
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Pantry</h1>
        <p className="text-muted-foreground mt-1">
          Track what you already have. Scan your fridge or pantry with AI to automatically detect ingredients.
        </p>
      </div>

      <EnhancedPantryView
        initialItems={pantryItems}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}