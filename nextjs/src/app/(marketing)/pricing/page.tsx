import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { FAQ } from "@/components/landing/faq";
import { PricingCardsClient } from "./pricing-cards-client";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-6">
            <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <PricingCardsClient />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-12">
              Compare plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 pr-4 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 font-medium">
                      {SUBSCRIPTION_TIERS.free.name}
                    </th>
                    <th className="text-center py-4 px-4 font-medium">
                      {SUBSCRIPTION_TIERS.pro.name}
                    </th>
                    <th className="text-center py-4 pl-4 font-medium">
                      {SUBSCRIPTION_TIERS.premium.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-4 pr-4">AI meal suggestions</td>
                    <td className="text-center py-4 px-4">
                      {SUBSCRIPTION_TIERS.free.limits.aiSuggestions}/month
                    </td>
                    <td className="text-center py-4 px-4">
                      {SUBSCRIPTION_TIERS.pro.limits.aiSuggestions}/month
                    </td>
                    <td className="text-center py-4 pl-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Recipes</td>
                    <td className="text-center py-4 px-4">
                      Up to {SUBSCRIPTION_TIERS.free.limits.recipes}
                    </td>
                    <td className="text-center py-4 px-4">
                      Up to {SUBSCRIPTION_TIERS.pro.limits.recipes}
                    </td>
                    <td className="text-center py-4 pl-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Household members</td>
                    <td className="text-center py-4 px-4">
                      {SUBSCRIPTION_TIERS.free.limits.householdMembers}
                    </td>
                    <td className="text-center py-4 px-4">
                      {SUBSCRIPTION_TIERS.pro.limits.householdMembers}
                    </td>
                    <td className="text-center py-4 pl-4">
                      {SUBSCRIPTION_TIERS.premium.limits.householdMembers}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Pantry scanning</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      {SUBSCRIPTION_TIERS.pro.limits.pantryScans}/month
                    </td>
                    <td className="text-center py-4 pl-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Meal planning</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Shopping lists</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Google Calendar sync</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Advanced nutrition tracking</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Priority support</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Early access to new features</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-mono font-bold">
              Ready to start planning?
            </h2>
            <p className="text-primary-foreground/80">
              Join for free. No credit card required.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}