import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { FAQ } from "@/components/landing/faq";
import { PricingCardsClient } from "./pricing-cards-client";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-0 bg-[#111111] min-h-screen">
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-6">
            <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-tight text-[#FDFBF7]">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-[#888888]">
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
      <section className="py-20 bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-12 text-[#FDFBF7]">
              Compare plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#333]">
                    <th className="text-left py-4 pr-4 font-medium text-[#FDFBF7]">Feature</th>
                    <th className="text-center py-4 px-4 font-medium text-[#FDFBF7]">
                      {SUBSCRIPTION_TIERS.free.name}
                    </th>
                    <th className="text-center py-4 px-4 font-medium text-[#FDFBF7]">
                      {SUBSCRIPTION_TIERS.pro.name}
                    </th>
                    <th className="text-center py-4 pl-4 font-medium text-[#FDFBF7]">
                      {SUBSCRIPTION_TIERS.premium.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">AI meal suggestions</td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      {SUBSCRIPTION_TIERS.free.limits.aiSuggestions}/month
                    </td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      {SUBSCRIPTION_TIERS.pro.limits.aiSuggestions}/month
                    </td>
                    <td className="text-center py-4 pl-4 text-[#888888]">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Recipes</td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      Up to {SUBSCRIPTION_TIERS.free.limits.recipes}
                    </td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      Up to {SUBSCRIPTION_TIERS.pro.limits.recipes}
                    </td>
                    <td className="text-center py-4 pl-4 text-[#888888]">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Household members</td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      {SUBSCRIPTION_TIERS.free.limits.householdMembers}
                    </td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      {SUBSCRIPTION_TIERS.pro.limits.householdMembers}
                    </td>
                    <td className="text-center py-4 pl-4 text-[#888888]">
                      {SUBSCRIPTION_TIERS.premium.limits.householdMembers}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Pantry scanning</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-[#888888]">
                      {SUBSCRIPTION_TIERS.pro.limits.pantryScans}/month
                    </td>
                    <td className="text-center py-4 pl-4 text-[#888888]">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Meal planning</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Shopping lists</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Google Calendar sync</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Advanced nutrition tracking</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Priority support</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 text-[#FDFBF7]">Early access to new features</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-[#444] mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-[#1a4d2e] mx-auto" />
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
      <section className="py-20 bg-[#F97316]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-white">
              Ready to start planning?
            </h2>
            <p className="text-white/80">
              Join for free. No credit card required.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-[#111111] text-[#FDFBF7] hover:bg-[#1a1a1a] border-3 border-white"
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