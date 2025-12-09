import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { FAQ } from "@/components/landing/faq";

export default function PricingPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
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
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="border-2 relative">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>
                  Everything you need to start meal planning
                </CardDescription>
                <div className="pt-6">
                  <span className="text-5xl font-mono font-bold">$0</span>
                  <span className="text-muted-foreground ml-2">forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href="/signup" className="block">
                  <Button className="w-full" size="lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Includes:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Unlimited recipes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>AI recipe import from any website</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Weekly meal planning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Auto-generated shopping lists</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Export as PDF or Markdown</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Cooking history tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Share lists via text/email</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Coming Soon
              </div>
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>
                  For households who want to plan together
                </CardDescription>
                <div className="pt-6">
                  <span className="text-5xl font-mono font-bold">$5</span>
                  <span className="text-muted-foreground ml-2">per month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button className="w-full" size="lg" disabled>
                  Coming Soon
                </Button>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Everything in Free, plus:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Household sharing</strong> — Sync recipes and
                        plans with your partner
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Google Calendar sync</strong> — See meals on
                        your calendar
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Email shopping lists</strong> — Send directly to
                        any email
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Recipe scaling</strong> — Adjust servings
                        automatically
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Meal suggestions</strong> — AI-powered
                        recommendations
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Priority support</strong> — Get help when you
                        need it
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <th className="text-center py-4 px-4 font-medium">Free</th>
                    <th className="text-center py-4 pl-4 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-4 pr-4">Recipes</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                    <td className="text-center py-4 pl-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">AI recipe import</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Meal planning</td>
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
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Export recipes</td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Household sharing</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
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
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Email shopping lists</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Recipe scaling</td>
                    <td className="text-center py-4 px-4">
                      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                    </td>
                    <td className="text-center py-4 pl-4">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">AI meal suggestions</td>
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
          <div className="max-w-2xl mx-auto text-center space-y-6">
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

