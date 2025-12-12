'use client';

import { PricingCards } from '@/components/subscriptions/PricingCards';
import type { SubscriptionTier } from '@/types/subscription';

export function PricingCardsClient() {
  const handleSelectPlan = async (tier: SubscriptionTier) => {
    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  return <PricingCards onSelectPlan={handleSelectPlan} />;
}
