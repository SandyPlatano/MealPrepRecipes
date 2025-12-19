'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Card className="border-2 relative">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl">{SUBSCRIPTION_TIERS.free.name}</CardTitle>
          <CardDescription>
            Everything you need to start meal planning
          </CardDescription>
          <div className="pt-6">
            <span className="text-5xl font-mono font-bold">${SUBSCRIPTION_TIERS.free.price}</span>
            <span className="text-muted-foreground ml-2">forever</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Link href="/signup" className="block">
            <Button className="w-full" size="lg">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Includes:
            </p>
            <ul className="flex flex-col gap-3">
              {SUBSCRIPTION_TIERS.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pro Plan */}
      <Card className="border-2 border-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Popular
        </div>
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl">{SUBSCRIPTION_TIERS.pro.name}</CardTitle>
          <CardDescription>
            Perfect for growing families
          </CardDescription>
          <div className="pt-6">
            <span className="text-5xl font-mono font-bold">${SUBSCRIPTION_TIERS.pro.price}</span>
            <span className="text-muted-foreground ml-2">per month</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Button
            className="w-full"
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
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Everything in Free, plus:
            </p>
            <ul className="flex flex-col gap-3">
              {SUBSCRIPTION_TIERS.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Premium Plan */}
      <Card className="border-2 relative">
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl">{SUBSCRIPTION_TIERS.premium.name}</CardTitle>
          <CardDescription>
            For serious meal planners
          </CardDescription>
          <div className="pt-6">
            <span className="text-5xl font-mono font-bold">${SUBSCRIPTION_TIERS.premium.price}</span>
            <span className="text-muted-foreground ml-2">per month</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Button
            className="w-full"
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
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Everything in Pro, plus:
            </p>
            <ul className="flex flex-col gap-3">
              {SUBSCRIPTION_TIERS.premium.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
