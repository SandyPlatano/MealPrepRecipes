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
} from "lucide-react";
import { FAQ } from "@/components/landing/faq";
import { BrandLogo, BrandLogoCompact } from "@/components/brand/logo";

// Lazy load animated demos for better initial page load
const RecipeCardDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => {
    // #region agent log
    if (typeof window !== "undefined") {
      fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:30',message:'RecipeCardDemo dynamic import loaded',data:{component:'RecipeCardDemo'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    return { default: mod.RecipeCardDemo };
  }),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

const MealPlanDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => {
    // #region agent log
    if (typeof window !== "undefined") {
      fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:35',message:'MealPlanDemo dynamic import loaded',data:{component:'MealPlanDemo'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    return { default: mod.MealPlanDemo };
  }),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

const ShoppingListDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => {
    // #region agent log
    if (typeof window !== "undefined") {
      fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:40',message:'ShoppingListDemo dynamic import loaded',data:{component:'ShoppingListDemo'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    return { default: mod.ShoppingListDemo };
  }),
  { ssr: false, loading: () => <div className="h-96 bg-muted/30 rounded-xl animate-pulse" /> }
);

const RecipeImportDemo = dynamic(
  () => import("@/components/landing/animated-demo").then((mod) => {
    // #region agent log
    if (typeof window !== "undefined") {
      fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:45',message:'RecipeImportDemo dynamic import loaded',data:{component:'RecipeImportDemo'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    return { default: mod.RecipeImportDemo };
  }),
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
                  <div className="border-t my-3" />
                  <SheetClose asChild>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base hover:bg-primary/5"
                      >
                        Log in
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/signup">
                      <Button className="w-full">
                        Sign Up Free
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

      {/* Pricing Section */}
      <section className="py-20">
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
