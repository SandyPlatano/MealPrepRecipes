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
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { FAQ } from "@/components/landing/faq";
import { BrandLogo, BrandLogoCompact } from "@/components/brand/logo";

// Lazy load animated demos for better initial page load
const RecipeCardDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => ({ default: mod.RecipeCardDemo })),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

const MealPlanDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => ({ default: mod.MealPlanDemo })),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

const ShoppingListDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => ({ default: mod.ShoppingListDemo })),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

const RecipeImportDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => ({ default: mod.RecipeImportDemo })),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <BrandLogoCompact />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link href="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" variant="ghost">Log in</Button>
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
                    <Link href="/about">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-primary/5"
                      >
                        About
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/pricing">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-primary/5"
                      >
                        Pricing
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
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Your complete kitchen command center
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <BrandLogo size="xl" showIcon={false} />
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-light">
              Finally, an answer to &quot;what&apos;s for dinner?&quot;
            </p>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Plan meals, track nutrition, generate shopping lists, and cook like a pro.
              All in one place. For you and your household.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Quick Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <FeatureQuickCard
              icon={<Calendar className="h-6 w-6" />}
              title="Weekly Planning"
              description="7-day meal grid with customizable meal types"
            />
            <FeatureQuickCard
              icon={<ShoppingCart className="h-6 w-6" />}
              title="Smart Shopping"
              description="Auto-generated lists organized by category"
            />
            <FeatureQuickCard
              icon={<Utensils className="h-6 w-6" />}
              title="Cook Mode"
              description="Step-by-step guidance with built-in timers"
            />
            <FeatureQuickCard
              icon={<Activity className="h-6 w-6" />}
              title="Nutrition Tracking"
              description="Macros, calories, and weekly trends"
            />
          </div>
        </div>
      </section>

      {/* Feature Demo 1: Recipe Cards */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Build your recipe collection
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Save your favorites. Track how often you cook each one.
              See nutrition info at a glance. One tap to add to your weekly plan.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RecipeCardDemo />
          </div>
        </div>
      </section>

      {/* Feature Demo 2: Meal Planning */}
      <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Plan the whole week
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Pick meals for each day. Assign cooks from your household.
              Everyone knows what&apos;s for dinner and who&apos;s making it.
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
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Shopping lists that write themselves
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Automatically generated from your meal plan. Organized by category.
              Items from your pantry are excluded. Check things off as you shop.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ShoppingListDemo />
          </div>
        </div>
      </section>

      {/* Cook Mode Feature */}
      <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Timer className="h-4 w-4" />
                  Interactive cooking
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Cook Mode that actually helps
                </h2>
                <p className="text-lg text-muted-foreground">
                  Full-screen recipe view with step-by-step instructions.
                  Built-in timers detected from your recipe. Check off ingredients as you go.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Adjustable font sizes for easy reading</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unit conversion (imperial/metric)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Rate and add notes when you&apos;re done</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Track your cooking history</span>
                  </li>
                </ul>
              </div>
              <div className="bg-background rounded-xl border p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="font-bold text-lg">Pasta Carbonara</span>
                    <span className="text-sm text-muted-foreground">Step 3 of 6</span>
                  </div>
                  <div className="py-4">
                    <p className="text-lg leading-relaxed">
                      Cook the spaghetti in salted boiling water until al dente,
                      about <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded">8-10 minutes</span>.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" size="sm">Previous</Button>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-primary" />
                      <span className="font-mono text-primary">09:34</span>
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
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-powered
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Import any recipe instantly
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Paste a URL from any recipe website, or paste raw text.
              Our AI extracts ingredients, instructions, and cook times automatically.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RecipeImportDemo />
          </div>
        </div>
      </section>

      {/* More Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to run your kitchen
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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

      {/* Social Proof / Value Props */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for real kitchens
              </h2>
              <p className="text-lg text-muted-foreground">
                For couples, families, roommates — anyone tired of the
                &quot;what do you want?&quot; &quot;I don&apos;t know, what do you want?&quot; loop.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="text-4xl font-mono font-bold text-primary">∞</div>
                <p className="font-medium">Unlimited recipes</p>
                <p className="text-sm text-muted-foreground">
                  Save as many as you want
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl font-mono font-bold text-primary">7</div>
                <p className="font-medium">Days planned at once</p>
                <p className="text-sm text-muted-foreground">
                  One weekly planning session
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl font-mono font-bold text-primary">0</div>
                <p className="font-medium">Dinner debates</p>
                <p className="text-sm text-muted-foreground">
                  Finally, peace at 5pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Free to start
            </h2>
            <p className="text-muted-foreground">
              No credit card required. Upgrade when you need more.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Everything you need to get started</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-mono font-bold">$0</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Unlimited recipes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Weekly meal planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Auto shopping lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Cook Mode with timers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>AI recipe import</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Basic nutrition tracking</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    Popular
                  </span>
                </div>
                <CardDescription>For serious meal preppers</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-mono font-bold">$5</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Household sharing (multiple cooks)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Google Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Multi-week planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>AI meal suggestions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span>Pantry AI scanning</span>
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ChefHat className="h-12 w-12 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Take control of your kitchen.
            </h2>
            <p className="text-primary-foreground/80">
              Join households who&apos;ve ended the nightly dinner debate.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                Start Planning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <BrandLogoCompact />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with love (and meal plans)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Quick feature card for the overview section
function FeatureQuickCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background border">
      <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Feature card for the detailed features section
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border bg-background">
      <CardContent className="p-6">
        <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
