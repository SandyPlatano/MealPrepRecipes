import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Menu,
  Calendar,
  ShoppingCart,
  Activity,
  Utensils,
} from "lucide-react";
import { FAQ } from "@/components/landing/faq";
import { BrandLogoCompact } from "@/components/brand/logo";
import { HeroSection } from "@/components/landing/hero-section";
import { TabbedDemo } from "@/components/landing/tabbed-demo";
import { MetricsSection } from "@/components/landing/metrics-section";
import { CTASection } from "@/components/landing/cta-section";
import { InteractiveFeatures } from "@/components/landing/interactive-features";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark text-cream">
      {/* Navigation */}
      <nav className="border-b border-dark-border sticky top-0 bg-dark/95 backdrop-blur supports-[backdrop-filter]:bg-dark/80 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <BrandLogoCompact />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm font-medium text-cream/70 hover:text-cream transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-cream/70 hover:text-cream transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-cream/70 hover:text-cream transition-colors"
            >
              Log in
            </Link>
            <Link href="/signup">
              <Button className="shadow-glow-red hover:shadow-glow-red-strong transition-all">
                Sign up free
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost" className="text-cream/70 hover:text-cream hover:bg-dark-lighter">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-cream/70 hover:text-cream hover:bg-dark-lighter">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-dark-lighter border-dark-border">
                <SheetHeader>
                  <SheetTitle className="font-mono text-left text-cream">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <SheetClose asChild>
                    <Link href="/pricing">
                      <Button variant="ghost" className="w-full justify-start text-base text-cream/70 hover:text-cream hover:bg-dark-accent">
                        Pricing
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/about">
                      <Button variant="ghost" className="w-full justify-start text-base text-cream/70 hover:text-cream hover:bg-dark-accent">
                        About
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Quick Features Strip */}
      <section className="py-12 bg-dark-lighter border-y border-dark-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <QuickFeature icon={<Calendar className="h-5 w-5" />} label="Weekly Planning" />
            <QuickFeature icon={<ShoppingCart className="h-5 w-5" />} label="Smart Shopping" />
            <QuickFeature icon={<Utensils className="h-5 w-5" />} label="Cook Mode" />
            <QuickFeature icon={<Activity className="h-5 w-5" />} label="Nutrition Tracking" />
          </div>
        </div>
      </section>

      {/* Tabbed Demo Section */}
      <TabbedDemo />

      {/* Interactive Features */}
      <InteractiveFeatures />

      {/* Metrics - Compact */}
      <MetricsSection />

      {/* Pricing Section - Tightened */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-3">
              Free to start
            </h2>
            <p className="text-cream/70">No credit card required.</p>
          </div>

          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <Card className="border-dark-border bg-dark-lighter">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-cream">Free</CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-mono font-bold text-cream">$0</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <PricingFeature>Unlimited recipes</PricingFeature>
                  <PricingFeature>Weekly meal planning</PricingFeature>
                  <PricingFeature>Auto shopping lists</PricingFeature>
                  <PricingFeature>Cook Mode with timers</PricingFeature>
                  <PricingFeature>AI recipe import</PricingFeature>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full border-dark-border text-cream hover:bg-dark-accent" variant="outline">
                    Get started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary bg-dark-lighter shadow-glow-red relative">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-bl-lg">
                Popular
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-cream">Pro</CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-mono font-bold text-cream">$5</span>
                  <span className="text-cream/60 text-sm">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <PricingFeature>Everything in Free</PricingFeature>
                  <PricingFeature>Household sharing</PricingFeature>
                  <PricingFeature>Google Calendar sync</PricingFeature>
                  <PricingFeature>Multi-week planning</PricingFeature>
                  <PricingFeature>AI meal suggestions</PricingFeature>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full shadow-glow-red">Start free trial</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ - Compact */}
      <div className="bg-dark-lighter">
        <FAQ />
      </div>

      {/* CTA Section */}
      <CTASection />

      {/* Footer - Simplified */}
      <footer className="border-t border-dark-border py-8 bg-dark">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <BrandLogoCompact />
            <div className="flex items-center gap-6 text-sm text-cream/60">
              <Link href="/about" className="hover:text-cream transition-colors">About</Link>
              <Link href="/pricing" className="hover:text-cream transition-colors">Pricing</Link>
              <Link href="/privacy" className="hover:text-cream transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-cream transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-cream/40">Made with love (and meal plans)</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Compact quick feature for the strip
function QuickFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-cream/80">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

// Pricing feature checkmark
function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-bold-green shrink-0" />
      <span className="text-cream">{children}</span>
    </li>
  );
}
