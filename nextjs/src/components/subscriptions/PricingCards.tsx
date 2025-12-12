'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import type { SubscriptionTier } from '@/types/subscription';

interface PricingCardsProps {
  currentTier?: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => Promise<void>;
}

export function PricingCards({ currentTier = 'free', onSelectPlan }: PricingCardsProps) {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === currentTier || tier === 'free') return;

    setLoading(tier);
    try {
      await onSelectPlan(tier);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const isCurrent = plan.tier === currentTier;
        const isDowngrade = tierValue(plan.tier) < tierValue(currentTier);

        return (
          <Card
            key={plan.tier}
            className={`relative flex flex-col ${
              plan.popular ? 'border-coral-500 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-coral-500 text-white">Most Popular</Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.name}
                {plan.tier !== 'free' && <Sparkles className="h-5 w-5 text-coral-500" />}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Features:</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 shrink-0 text-sage-600 dark:text-sage-400" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.tier !== 'free' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold">AI Meal Suggestions:</p>
                    <p className="text-2xl font-bold text-coral-500">
                      {plan.aiSuggestionsPerWeek === 'unlimited'
                        ? '∞ Unlimited'
                        : `${plan.aiSuggestionsPerWeek} per week`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter>
              {isCurrent ? (
                <Button disabled className="w-full" variant="outline">
                  Current Plan
                </Button>
              ) : isDowngrade ? (
                <Button disabled className="w-full" variant="ghost">
                  Contact Support to Downgrade
                </Button>
              ) : plan.tier === 'free' ? (
                <Button disabled className="w-full" variant="outline">
                  Free Forever
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={loading !== null}
                >
                  {loading === plan.tier ? 'Loading...' : 'Upgrade Now'}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function tierValue(tier: SubscriptionTier): number {
  const values: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    premium: 2,
  };
  return values[tier];
}
