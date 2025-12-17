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
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Check,
  Sparkles,
  Menu,
  ChefHat,
  Calendar,
  ShoppingCart,
  Activity,
  Timer,
  Users,
  BookOpen,
  Package,
  Utensils,
  Star,
  TrendingUp,
} from "lucide-react";
import { FAQ } from "@/components/landing/faq";
import { BrandLogoCompact } from "@/components/brand/logo";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCard, QuickFeatureCard } from "@/components/landing/feature-card";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { MetricsSection } from "@/components/landing/metrics-section";
import { CTASection } from "@/components/landing/cta-section";

// Lazy load animated demos for better initial page load
const RecipeCardDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.RecipeCardDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-clay-bg rounded-2xl animate-pulse" />
    ),
  }
);

const MealPlanDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.MealPlanDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-clay-bg rounded-2xl animate-pulse" />
    ),
  }
);

const ShoppingListDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.ShoppingListDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-clay-bg rounded-2xl animate-pulse" />
    ),
  }
);

const RecipeImportDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.RecipeImportDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-clay-bg rounded-2xl animate-pulse" />
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-clay-surface">
      {/* Navigation - Clean & Minimal */}
      <nav className="border-b border-clay-border sticky top-0 bg-clay-surface/95 backdrop-blur supports-[backdrop-filter]:bg-clay-surface/80 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <BrandLogoCompact />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm font-medium text-clay-muted hover:text-clay-text transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-clay-muted hover:text-clay-text transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-clay-muted hover:text-clay-text transition-colors"
            >
              Log in
            </Link>
            <Link href="/signup">
              <Button className="shadow-clay-sm hover:shadow-clay-md transition-all">
                Sign up free
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="font-mono text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <SheetClose asChild>
                    <Link href="/pricing">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-coral-tint-50"
                      >
                        Pricing
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/about">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-coral-tint-50"
                      >
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

      {/* Quick Features Grid */}
      <section className="py-16 bg-clay-bg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <QuickFeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Weekly Planning"
              description="7-day meal grid with customizable meal types"
            />
            <QuickFeatureCard
              icon={<ShoppingCart className="h-6 w-6" />}
              title="Smart Shopping"
              description="Auto-generated lists organized by category"
            />
            <QuickFeatureCard
              icon={<Utensils className="h-6 w-6" />}
              title="Cook Mode"
              description="Step-by-step guidance with built-in timers"
            />
            <QuickFeatureCard
              icon={<Activity className="h-6 w-6" />}
              title="Nutrition Tracking"
              description="Macros, calories, and weekly trends"
            />
          </div>
        </div>
      </section>

      {/* Feature Demo 1: Recipe Cards */}
      <section id="demo" className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-clay-text mb-6">
              Build your recipe collection
            </h2>
            <p className="text-lg md:text-xl text-clay-muted">
              Save your favorites. Track how often you cook each one. See
              nutrition info at a glance.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RecipeCardDemo />
          </div>
        </div>
      </section>

      {/* Feature Demo 2: Meal Planning */}
      <section className="py-24 md:py-32 bg-clay-bg overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-clay-text mb-6">
              Plan the whole week
            </h2>
            <p className="text-lg md:text-xl text-clay-muted">
              Pick meals for each day. Assign cooks from your household.
              Everyone knows what&apos;s for dinner.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <MealPlanDemo />
          </div>
        </div>
      </section>

      {/* Feature Demo 3: Shopping List */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-clay-text mb-6">
              Shopping lists that write themselves
            </h2>
            <p className="text-lg md:text-xl text-clay-muted">
              Automatically generated from your meal plan. Organized by
              category. Check off items as you shop.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ShoppingListDemo />
          </div>
        </div>
      </section>

      {/* Cook Mode Feature */}
      <section className="py-24 md:py-32 bg-clay-bg overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-tint-50 text-primary text-sm font-medium">
                  <Timer className="h-4 w-4" />
                  Interactive cooking
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-clay-text">
                  Cook Mode that actually helps
                </h2>
                <p className="text-lg text-clay-muted leading-relaxed">
                  Full-screen recipe view with step-by-step instructions.
                  Built-in timers detected from your recipe. Check off
                  ingredients as you go.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Adjustable font sizes for easy reading
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Unit conversion (imperial/metric)
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Rate and add notes when you&apos;re done
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Track your cooking history
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-clay-surface rounded-2xl border border-clay-border p-6 md:p-8 shadow-clay-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-clay-border pb-4">
                    <span className="font-bold text-lg text-clay-text">
                      Pasta Carbonara
                    </span>
                    <span className="text-sm text-clay-muted">Step 3 of 6</span>
                  </div>
                  <div className="py-6">
                    <p className="text-lg text-clay-text leading-relaxed">
                      Cook the spaghetti in salted boiling water until al dente,
                      about{" "}
                      <span className="font-mono bg-coral-tint-50 text-primary px-2 py-1 rounded">
                        8-10 minutes
                      </span>
                      .
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-clay-border">
                    <Button variant="outline" size="sm">
                      Previous
                    </Button>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="font-mono text-primary font-semibold">
                        09:34
                      </span>
                    </div>
                    <Button size="sm">Next Step</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Demo 4: AI Import */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-powered
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-clay-text mb-6">
              Import any recipe instantly
            </h2>
            <p className="text-lg md:text-xl text-clay-muted">
              Paste a URL from any recipe website, or paste raw text. Our AI
              extracts ingredients, instructions, and cook times automatically.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RecipeImportDemo />
          </div>
        </div>
      </section>

      {/* More Features Grid */}
      <section className="py-24 bg-clay-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-clay-text mb-4">
              Everything you need to run your kitchen
            </h2>
            <p className="text-lg text-clay-muted max-w-2xl mx-auto">
              From planning to cooking to cleanup. Meal Prep OS handles it all.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Activity className="h-6 w-6" />}
              title="Nutrition Tracking"
              description="Track calories, protein, carbs, and fat. See daily progress and weekly trends. Set custom macro goals."
            />
            <FeatureCard
              icon={<Package className="h-6 w-6" />}
              title="Pantry Management"
              description="Track what you have at home. AI-powered scanning from photos. Auto-deduct from shopping lists."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Household Sharing"
              description="Multiple cooks with custom names and colors. Everyone sees the plan. Shared shopping lists."
            />
            <FeatureCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Smart Folders"
              description="Organize recipes your way. Auto-folders for favorites, quick meals, and recently cooked."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Cooking History"
              description="Track what you've made and when. Star ratings and personal notes. Never forget a winner."
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="AI Suggestions"
              description="Stuck on what to make? Get personalized meal suggestions based on your history."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Metrics Section */}
      <MetricsSection />

      {/* Pricing Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-clay-text mb-4">
              Free to start
            </h2>
            <p className="text-clay-muted text-lg">
              No credit card required. Upgrade when you need more.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="border-clay-border bg-clay-surface shadow-clay-card hover:shadow-clay-card-hover transition-all duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-clay-text">Free</CardTitle>
                <CardDescription>
                  Everything you need to get started
                </CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-mono font-bold text-clay-text">
                    $0
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Unlimited recipes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Weekly meal planning</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Auto shopping lists</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Cook Mode with timers
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">AI recipe import</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Basic nutrition tracking
                    </span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                  >
                    Get started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary bg-clay-surface shadow-clay-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-clay-text">Pro</CardTitle>
                <CardDescription>For serious meal preppers</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-mono font-bold text-clay-text">
                    $5
                  </span>
                  <span className="text-clay-muted">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">
                      Household sharing (multiple cooks)
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Google Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Multi-week planning</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">AI meal suggestions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-sage-500 shrink-0" />
                    <span className="text-clay-text">Pantry AI scanning</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full shadow-clay-md" size="lg">
                    Start free trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <div className="bg-clay-bg">
        <FAQ />
      </div>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-clay-border py-12 bg-clay-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-semibold text-clay-text mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/pricing"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#demo"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-clay-text mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/blog"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-clay-text mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-clay-text mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-clay-muted hover:text-clay-text transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-clay-border">
            <BrandLogoCompact />
            <p className="text-sm text-clay-muted">
              Made with love (and meal plans)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
