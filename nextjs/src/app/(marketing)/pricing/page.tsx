import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { Footer } from "@/components/landing/footer";
import { PricingCardsClient } from "./pricing-cards-client";
import { SUBSCRIPTION_TIERS } from "@/lib/stripe/client-config";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-[#1A1A1A]">
              Compare plans
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-[#1A1A1A]">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-[#1A1A1A]">
                      {SUBSCRIPTION_TIERS.free.name}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-[#1A1A1A]">
                      {SUBSCRIPTION_TIERS.pro.name}
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-[#1A1A1A]">
                      {SUBSCRIPTION_TIERS.premium.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-white">
                    <td className="py-4 px-6 text-[#1A1A1A]">AI meal suggestions</td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      {SUBSCRIPTION_TIERS.free.limits.aiSuggestions}/month
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      {SUBSCRIPTION_TIERS.pro.limits.aiSuggestions}/month
                    </td>
                    <td className="text-center py-4 px-6 text-gray-600">Unlimited</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-6 text-[#1A1A1A]">Recipes</td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      Up to {SUBSCRIPTION_TIERS.free.limits.recipes}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      Up to {SUBSCRIPTION_TIERS.pro.limits.recipes}
                    </td>
                    <td className="text-center py-4 px-6 text-gray-600">Unlimited</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-4 px-6 text-[#1A1A1A]">Household members</td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      {SUBSCRIPTION_TIERS.free.limits.householdMembers}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      {SUBSCRIPTION_TIERS.pro.limits.householdMembers}
                    </td>
                    <td className="text-center py-4 px-6 text-gray-600">
                      {SUBSCRIPTION_TIERS.premium.limits.householdMembers}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-6 text-[#1A1A1A]">Pantry scanning</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4 text-gray-600">
                      {SUBSCRIPTION_TIERS.pro.limits.pantryScans}/month
                    </td>
                    <td className="text-center py-4 px-6 text-gray-600">Unlimited</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-4 px-6 text-[#1A1A1A]">Meal planning</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-6 text-[#1A1A1A]">Shopping lists</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-4 px-6 text-[#1A1A1A]">Google Calendar sync</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-6 text-[#1A1A1A]">Advanced nutrition tracking</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-4 px-6 text-[#1A1A1A]">Priority support</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-4 px-6 text-[#1A1A1A]">Early access to new features</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="text-center py-4 px-6">
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#E4F8C9]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">
              Ready to start planning?
            </h2>
            <p className="text-gray-700">
              Join for free. No credit card required.
            </p>
            <Link href="/signup" className="inline-block">
              <button
                type="button"
                className="bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-200 inline-flex items-center gap-2 group shadow-md hover:shadow-lg"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
