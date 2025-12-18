"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SettingsHeader } from "@/components/settings/layout/settings-header";
import { SettingRow, SettingSection } from "@/components/settings/shared/setting-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSubscriptionData,
  createCustomerPortalSession,
  type SubscriptionData,
} from "@/app/actions/subscription";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";
import { toast } from "sonner";
import {
  CreditCard,
  Crown,
  Sparkles,
  ExternalLink,
  Check,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function BillingSettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  // Fetch subscription data on mount
  useEffect(() => {
    async function fetchData() {
      const result = await getSubscriptionData();
      if (result.data) {
        setSubscriptionData(result.data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleManageBilling = () => {
    startTransition(async () => {
      const result = await createCustomerPortalSession();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  const handleUpgrade = async (tier: "pro" | "premium") => {
    setUpgradeLoading(tier);
    try {
      const priceId = SUBSCRIPTION_TIERS[tier].priceId;

      if (!priceId) {
        toast.error("Configuration error", {
          description: "Price ID not configured. Please contact support.",
        });
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          tier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to start checkout",
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "premium":
        return "default";
      case "pro":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "active":
      case "trialing":
        return "default";
      case "past_due":
        return "destructive";
      case "canceled":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SettingsHeader
          title="Billing & Subscription"
          description="Manage your subscription and billing"
        />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const currentTier = subscriptionData?.tier || "free";
  const isActive = subscriptionData?.status === "active" || subscriptionData?.status === "trialing";

  return (
    <div className="space-y-8">
      <SettingsHeader
        title="Billing & Subscription"
        description="Manage your subscription and billing"
      />

      {/* Current Plan */}
      <SettingSection title="Current Plan">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentTier === "premium" ? (
                  <Crown className="h-6 w-6 text-yellow-500" />
                ) : currentTier === "pro" ? (
                  <Sparkles className="h-6 w-6 text-primary" />
                ) : (
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                )}
                <div>
                  <CardTitle className="text-xl capitalize">{currentTier}</CardTitle>
                  <CardDescription>
                    {SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS]?.features[0]}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getTierBadgeVariant(currentTier)} className="capitalize">
                  {currentTier}
                </Badge>
                {subscriptionData?.status && (
                  <Badge variant={getStatusBadgeVariant(subscriptionData.status)} className="capitalize">
                    {subscriptionData.status === "trialing" ? "Trial" : subscriptionData.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionData?.currentPeriodEnd && isActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {subscriptionData.cancelAtPeriodEnd
                    ? `Cancels on ${formatDate(subscriptionData.currentPeriodEnd)}`
                    : `Renews on ${formatDate(subscriptionData.currentPeriodEnd)}`}
                </span>
              </div>
            )}

            {subscriptionData?.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>Your subscription will end at the billing period</span>
              </div>
            )}

            {subscriptionData?.stripeCustomerId && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            )}
          </CardContent>
        </Card>
      </SettingSection>

      {/* Upgrade Options */}
      {currentTier !== "premium" && (
        <SettingSection title="Upgrade Your Plan">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pro Plan */}
            {currentTier === "free" && (
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                  Recommended
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Pro
                  </CardTitle>
                  <CardDescription>Perfect for growing families</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-mono font-bold">${SUBSCRIPTION_TIERS.pro.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {SUBSCRIPTION_TIERS.pro.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade("pro")}
                    disabled={upgradeLoading !== null}
                  >
                    {upgradeLoading === "pro" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Premium Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Premium
                </CardTitle>
                <CardDescription>For serious meal planners</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-mono font-bold">${SUBSCRIPTION_TIERS.premium.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {SUBSCRIPTION_TIERS.premium.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={currentTier === "free" ? "outline" : "default"}
                  onClick={() => handleUpgrade("premium")}
                  disabled={upgradeLoading !== null}
                >
                  {upgradeLoading === "premium" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </SettingSection>
      )}

      {/* Free tier info */}
      {currentTier === "free" && (
        <SettingSection title="Your Current Features">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {SUBSCRIPTION_TIERS.free.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </SettingSection>
      )}
    </div>
  );
}
