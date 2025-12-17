"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  ShoppingCart,
  Package,
  Activity,
  ChefHat,
  Utensils,
  Flame,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  Users,
  Zap,
  BookOpen,
  Heart,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - PostHog-Inspired Demo
// Dark, bold, playful, personality-driven
// ═══════════════════════════════════════════════════════════════════════════════

export default function MealPrepOSDemo() {
  const [tootsieExpression, setTootsieExpression] = useState<"neutral" | "excited" | "waving">("neutral");

  // Tootsie waves on load
  useEffect(() => {
    const timer = setTimeout(() => setTootsieExpression("waving"), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-cream">
      {/* ═══════════════════════════════════════════════════════════════════════
          Hero Section
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Gradient glow background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark-lighter" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bold-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-bold-orange/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-lighter rounded-full border border-dark-border">
                <Sparkles className="w-4 h-4 text-bold-yellow" />
                <span className="text-sm text-cream/80">Your kitchen, turbocharged</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Meal prep that{" "}
                <span className="relative">
                  <span className="text-bold-red">doesn't suck</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 8 C50 2, 150 2, 198 8" stroke="#F54E00" strokeWidth="3" strokeLinecap="round" className="animate-wiggle" />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-cream/70 max-w-lg">
                Plan your meals, wrangle your recipes, and generate shopping lists.
                All without wanting to throw your phone across the room.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-bold-red to-bold-red-dark text-white font-semibold rounded-lg shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all"
                >
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-cream/30 text-cream rounded-lg hover:border-cream/60 hover:bg-cream/5 transition-all"
                >
                  See pricing
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-cream/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>2 min setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>For couples & families</span>
                </div>
              </div>
            </div>

            {/* Right: Tootsie + Preview */}
            <div className="relative">
              {/* Tootsie the Owl */}
              <div
                className="absolute -top-8 -right-4 z-10 cursor-pointer"
                onClick={() => setTootsieExpression(e => e === "excited" ? "neutral" : "excited")}
              >
                <TootsieOwl expression={tootsieExpression} />
              </div>

              {/* App Preview Card */}
              <div className="bg-dark-lighter rounded-2xl border border-dark-border p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Today's Meals</h3>
                  <span className="text-sm text-cream/50">Tuesday, Dec 17</span>
                </div>
                <div className="space-y-3">
                  <MealPreviewCard
                    time="8:00 AM"
                    meal="Breakfast"
                    recipe="Overnight Oats with Berries"
                    emoji="🥣"
                    calories={320}
                  />
                  <MealPreviewCard
                    time="12:30 PM"
                    meal="Lunch"
                    recipe="Mediterranean Quinoa Bowl"
                    emoji="🥗"
                    calories={520}
                  />
                  <MealPreviewCard
                    time="7:00 PM"
                    meal="Dinner"
                    recipe="Lemon Herb Chicken"
                    emoji="🍗"
                    calories={680}
                    highlight
                  />
                </div>
                <div className="mt-6 pt-4 border-t border-dark-border flex justify-between items-center">
                  <span className="text-cream/50 text-sm">Daily total</span>
                  <span className="font-semibold text-bold-green">1,520 kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          Features Section
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-dark-lighter">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-bold-orange">actually cook</span>
            </h2>
            <p className="text-cream/60 text-lg max-w-2xl mx-auto">
              Not another recipe graveyard. A system that helps you plan, prep, and execute.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Drag & drop meal planning"
              description="Plan your week in seconds. Drag recipes onto days. Done."
              color="bold-red"
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Recipe management"
              description="Import from anywhere, organize how you want, find what you need."
              color="bold-blue"
            />
            <FeatureCard
              icon={<ShoppingCart className="w-6 h-6" />}
              title="Smart shopping lists"
              description="Auto-generated from your meal plan. Grouped by aisle. Genius."
              color="bold-green"
            />
            <FeatureCard
              icon={<Activity className="w-6 h-6" />}
              title="Macro tracking"
              description="Know exactly what you're eating without the spreadsheet nightmare."
              color="bold-purple"
            />
            <FeatureCard
              icon={<Package className="w-6 h-6" />}
              title="Pantry management"
              description="Track what you have. Get alerts before things expire. Save money."
              color="bold-orange"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="AI suggestions"
              description="Stuck? Get recipe ideas based on what's in your fridge."
              color="bold-pink"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          Stats Section
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bold-red/5 via-transparent to-bold-orange/5" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="10,000+" label="Recipes saved" />
            <StatCard number="50,000+" label="Meals planned" />
            <StatCard number="$2,400" label="Avg yearly savings" subtext="per household" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA Section
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-dark-lighter">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex mb-8">
            <TootsieOwl expression="excited" size="lg" />
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to stop asking{" "}
            <span className="text-bold-red">"what's for dinner?"</span>
          </h2>

          <p className="text-xl text-cream/60 mb-8 max-w-2xl mx-auto">
            Join thousands of households who've figured out the dinner question.
            Free to start, no credit card required.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-bold-red to-bold-red-dark text-white text-lg font-semibold rounded-lg shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all animate-pulse-glow"
          >
            Get started free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          Footer
          ═══════════════════════════════════════════════════════════════════════ */}
      <footer className="py-12 border-t border-dark-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-bold-red" />
              <span className="font-bold text-lg">Meal Prep OS</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-cream/60">
              <Link href="/about" className="hover:text-cream transition-colors">About</Link>
              <Link href="/pricing" className="hover:text-cream transition-colors">Pricing</Link>
              <Link href="/privacy" className="hover:text-cream transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-cream transition-colors">Terms</Link>
            </div>

            <p className="text-sm text-cream/40">
              Made with <Heart className="w-4 h-4 inline text-bold-pink" /> and mild chaos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════════════════════

interface MealPreviewCardProps {
  time: string;
  meal: string;
  recipe: string;
  emoji: string;
  calories: number;
  highlight?: boolean;
}

function MealPreviewCard({ time, meal, recipe, emoji, calories, highlight }: MealPreviewCardProps) {
  return (
    <div
      className={`
        flex items-center gap-4 p-3 rounded-lg transition-all
        ${highlight
          ? "bg-bold-red/10 border border-bold-red/30"
          : "bg-dark/50 hover:bg-dark/80"
        }
      `}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{meal}</span>
          <span className="text-xs text-cream/40">{time}</span>
        </div>
        <p className="text-sm text-cream/60 truncate">{recipe}</p>
      </div>
      <div className="text-sm text-cream/50">{calories} kcal</div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="group p-6 bg-dark rounded-xl border border-dark-border hover:border-dark-accent transition-all hover:shadow-card hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-lg bg-${color}/10 flex items-center justify-center text-${color} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-cream/60 text-sm">{description}</p>
    </div>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  subtext?: string;
}

function StatCard({ number, label, subtext }: StatCardProps) {
  return (
    <div>
      <div className="text-5xl font-bold text-bold-red mb-2">{number}</div>
      <div className="text-cream/80">{label}</div>
      {subtext && <div className="text-sm text-cream/40">{subtext}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tootsie the Owl - Hand-drawn PostHog style
// ═══════════════════════════════════════════════════════════════════════════════

interface TootsieOwlProps {
  expression?: "neutral" | "excited" | "waving";
  size?: "sm" | "md" | "lg";
}

function TootsieOwl({ expression = "neutral", size = "md" }: TootsieOwlProps) {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div className={`${sizes[size]} relative ${expression === "waving" ? "animate-wave" : ""}`}>
      <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {/* Body */}
        <ellipse cx="50" cy="60" rx="28" ry="32" fill="#D4A574" stroke="#1D1F27" strokeWidth="3" />

        {/* Belly */}
        <ellipse cx="50" cy="68" rx="18" ry="20" fill="#F5E6D3" stroke="#1D1F27" strokeWidth="2" />

        {/* Chef Hat */}
        <ellipse cx="50" cy="18" rx="20" ry="12" fill="white" stroke="#1D1F27" strokeWidth="3" />
        <rect x="35" y="18" width="30" height="10" fill="white" stroke="#1D1F27" strokeWidth="3" />

        {/* Eyes */}
        {expression === "excited" ? (
          <>
            <circle cx="38" cy="45" r="10" fill="white" stroke="#1D1F27" strokeWidth="3" />
            <circle cx="62" cy="45" r="10" fill="white" stroke="#1D1F27" strokeWidth="3" />
            <circle cx="40" cy="44" r="5" fill="#1D1F27" />
            <circle cx="64" cy="44" r="5" fill="#1D1F27" />
            {/* Sparkles */}
            <circle cx="35" cy="38" r="2" fill="#F7A501" />
            <circle cx="69" cy="38" r="2" fill="#F7A501" />
          </>
        ) : (
          <>
            <circle cx="38" cy="45" r="8" fill="white" stroke="#1D1F27" strokeWidth="3" />
            <circle cx="62" cy="45" r="8" fill="white" stroke="#1D1F27" strokeWidth="3" />
            <circle cx="39" cy="46" r="4" fill="#1D1F27" />
            <circle cx="63" cy="46" r="4" fill="#1D1F27" />
          </>
        )}

        {/* Beak */}
        <path d="M45 55 L50 63 L55 55 Z" fill="#F54E00" stroke="#1D1F27" strokeWidth="2" />

        {/* Wings */}
        {expression === "waving" ? (
          <>
            <ellipse cx="20" cy="50" rx="10" ry="18" fill="#D4A574" stroke="#1D1F27" strokeWidth="3" transform="rotate(-30 20 50)" />
            <ellipse cx="80" cy="55" rx="10" ry="18" fill="#D4A574" stroke="#1D1F27" strokeWidth="3" />
          </>
        ) : (
          <>
            <ellipse cx="22" cy="60" rx="10" ry="18" fill="#D4A574" stroke="#1D1F27" strokeWidth="3" />
            <ellipse cx="78" cy="60" rx="10" ry="18" fill="#D4A574" stroke="#1D1F27" strokeWidth="3" />
          </>
        )}

        {/* Feet */}
        <ellipse cx="40" cy="92" rx="8" ry="4" fill="#F54E00" stroke="#1D1F27" strokeWidth="2" />
        <ellipse cx="60" cy="92" rx="8" ry="4" fill="#F54E00" stroke="#1D1F27" strokeWidth="2" />

        {/* Eyebrows */}
        {expression === "excited" && (
          <>
            <path d="M30 35 Q38 30 46 35" stroke="#1D1F27" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M54 35 Q62 30 70 35" stroke="#1D1F27" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}
      </svg>

      {/* Speech bubble */}
      {expression === "waving" && (
        <div className="absolute -top-2 -right-2 bg-bold-yellow text-dark text-xs font-bold px-2 py-1 rounded-lg animate-bounce-in">
          Hey! 👋
        </div>
      )}
      {expression === "excited" && (
        <div className="absolute -top-2 -right-4 bg-bold-red text-white text-xs font-bold px-2 py-1 rounded-lg animate-bounce-in">
          Let's cook!
        </div>
      )}
    </div>
  );
}
