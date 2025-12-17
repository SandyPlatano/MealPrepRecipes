import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Search,
  Youtube,
  Smartphone,
  ChefHat,
  Users,
  Heart,
  Sparkles,
  Play,
  ShoppingCart,
  Flame,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section with Photo */}
      <section className="text-center space-y-8">
        <div className="relative w-96 h-96 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
          <div className="relative w-full h-full rounded-2xl border-4 border-primary/20 overflow-hidden bg-muted shadow-2xl">
            <Image
              src="/images/BabeWFDAboutPic.jpg"
              alt="Me and Morgan"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-mono font-bold">
            About Babe, What&apos;s for Dinner?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A love story about meal prep, scattered recipes, and building
            something to make life a little easier.
          </p>
        </div>
      </section>

      {/* The Sunday Ritual */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold">The Sunday Ritual</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every Sunday, me and my partner Morgan sit down to plan our meal
              prep for the week. It&apos;s become our thing—figuring out
              what we want to eat, who&apos;s cooking what, and making our
              grocery list. There&apos;s something satisfying about having a
              plan that sets us up for a stress-free week ahead.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
            <Search className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold">
              &quot;What was that meal with tofu?&quot;
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              But here&apos;s the thing: every time we&apos;d sit down to plan
              what to cook, we&apos;d have this conversation.{" "}
              <span className="italic">
                &quot;Hey, what was that meal we made with tofu two weeks
                ago?&quot;
              </span>{" "}
              And we&apos;d both sit there, trying to remember. Was it the
              stir-fry? The curry? The one with the peanut sauce?
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We&apos;d forget our favorite recipes, lose track of what worked
              and what didn&apos;t, and end up Googling the same things over and
              over again.
            </p>
          </div>
        </div>
      </section>

      {/* The Scattered Search */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="flex gap-1">
              <Youtube className="w-4 h-4 text-primary" />
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold">
              Recipes Everywhere, Nowhere
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our recipes were scattered across TikTok, YouTube, random blogs,
              screenshots in our camera rolls. There was no central place to
              find them. We&apos;d spend more time searching for recipes than
              actually planning meals.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              And tracking them? Forget about it. We had no idea what we cooked
              last week, let alone last month.
            </p>
          </div>
        </div>
      </section>

      {/* The Daily Question */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
            <div className="flex gap-1">
              <ChefHat className="w-4 h-4 text-accent-foreground" />
              <Users className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold">
              &quot;Babe, what&apos;s for dinner?&quot;
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Then there was the nightly confusion. We&apos;d lose track of who
              was cooking and what we were supposed to make. When it was time to
              cook, I&apos;d ask Morgan the question that became the name of
              this app:{" "}
              <span className="font-semibold text-primary">
                &quot;Babe, what&apos;s for dinner?&quot;
              </span>
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We needed a better system. Meal planning is such a consistent part
              of our lives—it shouldn&apos;t be this hard.
            </p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold">
              Building Something Better
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              So I decided to build something. Not just for us, but for anyone
              who feels this same frustration. A place to save recipes, plan the
              week, assign who&apos;s cooking what, and generate shopping lists
              automatically.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I wanted us to spend less time on the <em>planning</em> side and
              more time on the <em>cooking</em> side. Less confusion, more
              clarity. Less stress, more delicious food.
            </p>
          </div>
        </div>
      </section>

      {/* See It In Action */}
      <section className="max-w-4xl mx-auto space-y-8 py-12 px-6 bg-muted/30 rounded-2xl">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Play className="h-4 w-4" />
            Interactive Demo
          </div>
          <h2 className="text-2xl font-mono font-bold">See It In Action</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Try the full app experience with sample data. No signup required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/demo/recipes/demo-recipe-1/cook" className="group">
            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Cook Mode</h3>
                <p className="text-xs text-muted-foreground">
                  Step-by-step guidance
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/demo" className="group">
            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Meal Planning</h3>
                <p className="text-xs text-muted-foreground">
                  Plan your week
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/demo/shop" className="group">
            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Shopping Lists</h3>
                <p className="text-xs text-muted-foreground">
                  Auto-generated
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/demo/nutrition" className="group">
            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Nutrition</h3>
                <p className="text-xs text-muted-foreground">
                  Track macros
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/demo">
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Explore Full Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* The Vision */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
            <Heart className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-mono font-bold">For You</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I hope this helps you not only eat healthier but live a better
              life. Being organized reduces a lot of stress in relationships—I
              truly believe that. When you both know what&apos;s for dinner,
              who&apos;s cooking it, and what to buy at the store, everything
              just flows better.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I&apos;m hoping you see the benefits in both your relationship and
              your general life. Because at the end of the day, that&apos;s what
              this is about: making life a little easier, one meal at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="max-w-2xl mx-auto text-center space-y-6 pt-8 border-t">
        <p className="text-lg text-muted-foreground italic">
          With love (and plenty of meal prep),
        </p>
        <p className="text-2xl font-mono font-bold text-primary">
          The team behind Babe, What&apos;s for Dinner?
        </p>
      </section>
    </div>
  );
}

