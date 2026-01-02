'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function PricingCardsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: 'pro' | 'premium') => {
    try {
      setLoading(tier);

      const priceId = SUBSCRIPTION_TIERS[tier].priceId;

      if (!priceId) {
        toast.error("Configuration error", {
          description: "Price ID not configured. Please contact support.",
        });
        return;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          tier
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          router.push('/login?redirect=/pricing');
          return;
        }
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to start checkout",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      {/* Free Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative">
        <div className="pb-8">
          <h3 className="text-2xl font-bold text-[#1A1A1A]">{SUBSCRIPTION_TIERS.free.name}</h3>
          <p className="text-gray-500 mt-2">
            Everything you need to start meal planning
          </p>
          <div className="pt-6">
            <span className="text-5xl font-bold text-[#1A1A1A]">${SUBSCRIPTION_TIERS.free.price}</span>
            <span className="text-gray-500 ml-2">forever</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Link href="/signup" className="block">
            <Button className="w-full rounded-full" size="lg">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Includes:
            </p>
            <ul className="flex flex-col gap-3">
              {SUBSCRIPTION_TIERS.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pro Plan */}
      <div className="bg-white rounded-2xl border-2 border-[#D9F99D] shadow-lg p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#D9F99D] text-[#1A1A1A] text-xs font-semibold px-3 py-1.5 rounded-bl-xl flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Popular
        </div>
        <div className="pb-8">
          <h3 className="text-2xl font-bold text-[#1A1A1A]">{SUBSCRIPTION_TIERS.pro.name}</h3>
          <p className="text-gray-500 mt-2">
            Perfect for growing families
          </p>
          <div className="pt-6">
            <span className="text-5xl font-bold text-[#1A1A1A]">${SUBSCRIPTION_TIERS.pro.price}</span>
            <span className="text-gray-500 ml-2">per month</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Button
            className="w-full rounded-full bg-[#1A1A1A] hover:bg-gray-800"
            size="lg"
            onClick={() => handleUpgrade('pro')}
            disabled={loading !== null}
          >
            {loading === 'pro' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Upgrade to Pro
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Everything in Free, plus:
            </p>
            <ul className="flex flex-col gap-3">
              {SUBSCRIPTION_TIERS.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Premium Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 relative">
        <div className="pb-8">
          <h3 className="text-2xl font-bold text-[#1A1A1A]">{SUBSCRIPTION_TIERS.premium.name}</h3>
          <p className="text-gray-500 mt-2">
            For serious meal planners
          </p>
          <div className="pt-6">
            <span className="text-5xl font-bold text-[#1A1A1A]">${SUBSCRIPTION_TIERS.premium.price}</span>
            <span className="text-gray-500 ml-2">per month</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Button
            className="w-full rounded-full"
            size="lg"
            variant="outline"
            onClick={() => handleUpgrade('premium')}
            disabled={loading !== null}
          >
            {loading === 'premium' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Everything in Pro, plus:
            </p>
            <ul className="flex flex-col gap-3">
              {SUBSCRIPTION_TIERS.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
