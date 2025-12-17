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
  Play,
  ChefHat,
  Calendar,
  ShoppingCart,
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
              href="/demo"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Demo
            </Link>
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
                    <Link href="/demo">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-primary/5"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Interactive Demo
                      </Button>
                    </Link>
                  </SheetClose>
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
              AI-powered recipe import
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <BrandLogo size="xl" />
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground font-light">
              Finally, an answer.
            </p>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Plan meals together. Generate shopping lists. Stop the daily debate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Play className="mr-2 h-5 w-5" />
                  Try Interactive Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Demo 1: Recipe Cards */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-mono font-bold mb-6">
              Build your recipe collection
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Save your favorites. Heart the ones you love. One click to add any recipe to your weekly meal plan.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RecipeCardDemo />
          </div>
          <div className="text-center mt-8">
            <Link href="/demo/recipes" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Try it yourself <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Demo 2: Meal Planning */}
      <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-mono font-bold mb-6">
              Plan the week together
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Pick meals, assign days, assign cooks. Everyone knows what&apos;s for dinner and whose turn it is.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <MealPlanDemo />
          </div>
          <div className="text-center mt-8">
            <Link href="/demo" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Try it yourself <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Demo 3: Shopping List */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-mono font-bold mb-6">
              Shopping lists, sorted
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Automatically generated from your meal plan. Organized by aisle. Send it to whoever&apos;s doing the grocery run.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <ShoppingListDemo />
          </div>
          <div className="text-center mt-8">
            <Link href="/demo/shop" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Try it yourself <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Demo 4: AI Import */}
      <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-powered
            </div>
            <h2 className="text-3xl md:text-5xl font-mono font-bold mb-6">
              Import any recipe with AI
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Paste a URL from any recipe website. Our AI extracts ingredients, instructions, and cook times automatically.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <RecipeImportDemo />
          </div>
        </div>
      </section>

      {/* Social Proof / Value Props */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">
                Built for couples
              </h2>
              <p className="text-lg text-muted-foreground">
                Because &quot;what do you want?&quot; &quot;I don&apos;t know, what do you want?&quot;
                gets old real fast.
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
                <div className="text-4xl font-mono font-bold text-primary">2+</div>
                <p className="font-medium">Multiple cooks</p>
                <p className="text-sm text-muted-foreground">
                  Assign meals fairly
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="text-4xl font-mono font-bold text-primary">1</div>
                <p className="font-medium">Shared list</p>
                <p className="text-sm text-muted-foreground">
                  Everyone sees what to buy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Interactive Demo
            </div>
            <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">
              See it in action
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Try the full app with sample data. No signup required.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
            <Link href="/demo/recipes/demo-recipe-1/cook" className="group">
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ChefHat className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Cook Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step guidance with voice and timers
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/demo" className="group">
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Meal Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your week with assigned cooks
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/demo/shop" className="group">
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Shopping Lists</h3>
                  <p className="text-sm text-muted-foreground">
                    Auto-generated and organized by aisle
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/demo">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-5 w-5" />
                Explore Full Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">
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
                <CardDescription>Everything you need</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-mono font-bold">$0</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited recipes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Weekly meal planning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Shopping lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>AI recipe import</span>
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
                    Coming Soon
                  </span>
                </div>
                <CardDescription>For power couples</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-mono font-bold">$5</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Household sharing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Google Calendar sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Email shopping lists</span>
                  </li>
                </ul>
                <Button className="w-full" disabled>
                  Coming Soon
                </Button>
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
            <h2 className="text-3xl md:text-4xl font-mono font-bold">
              Know what&apos;s for dinner.
            </h2>
            <p className="text-primary-foreground/80">
              Join couples who&apos;ve ended the nightly debate.
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
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with love (and mild guilt)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
