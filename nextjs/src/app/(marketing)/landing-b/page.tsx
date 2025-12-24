"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Calendar,
  Search,
  ShoppingCart,
  Users,
  Clock,
  Sparkles,
  ChefHat,
  Heart,
  ArrowRight,
  Star,
  Flame,
  UtensilsCrossed
} from "lucide-react";

// Feature card component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  iconBg = "bg-amber-100"
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg?: string;
}) => (
  <Card className="group relative overflow-hidden bg-white p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-orange-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  </Card>
);

// Recipe preview card
const RecipePreviewCard = ({
  emoji,
  title,
  time,
  servings,
  rating
}: {
  emoji: string;
  title: string;
  time: string;
  servings: number;
  rating: number;
}) => (
  <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 items-center hover:bg-amber-100 transition-colors cursor-pointer">
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-300 to-amber-400 flex items-center justify-center text-2xl shadow-md">
      {emoji}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500">Based on ingredients you have</p>
      <div className="flex gap-3 mt-1 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {time}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {servings}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
        </span>
      </div>
    </div>
  </div>
);

// Quick action chip
const QuickAction = ({ emoji, label }: { emoji: string; label: string }) => (
  <button type="button" className="flex items-center gap-2 bg-slate-100 hover:bg-amber-100 px-4 py-2 rounded-full text-sm text-slate-600 transition-colors">
    <span>{emoji}</span>
    <span>{label}</span>
  </button>
);

export default function LandingBPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Custom styles for this page */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');

        .landing-b * {
          font-family: 'Inter', sans-serif;
        }

        .landing-b h1, .landing-b h2, .landing-b .serif {
          font-family: 'Playfair Display', serif;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.3; }
        }

        .mascot-wiggle {
          animation: wiggle 3s ease-in-out infinite;
        }

        .blob-pulse {
          animation: pulse-soft 8s ease-in-out infinite;
        }
      `}</style>

      <div className="landing-b bg-[#faf7f2]">
        {/* Decorative blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="blob-pulse absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-red-200/60 to-orange-200/60 blur-3xl" />
          <div className="blob-pulse absolute bottom-[10%] -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-200/50 to-sky-200/50 blur-3xl" style={{ animationDelay: '2s' }} />
          <div className="blob-pulse absolute top-1/2 right-[5%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-amber-200/50 to-yellow-200/50 blur-2xl" style={{ animationDelay: '4s' }} />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          <div className="container mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="relative z-10">
                <Badge
                  variant="secondary"
                  className="mb-6 px-4 py-2 bg-white shadow-md border-0 text-orange-700"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Your personal kitchen companion
                </Badge>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 leading-[1.1]">
                  Babe,{" "}
                  <span className="text-orange-500 italic">
                    what&apos;s for dinner?
                  </span>
                </h1>

                <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                  Stop staring at the fridge wondering what to make. Discover recipes,
                  plan your week, and make dinner decisions <em>effortless</em>.
                  Your personal kitchen companion awaits.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 border-0 rounded-xl"
                    >
                      Start Planning Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg bg-white border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl"
                  >
                    Browse Recipes
                  </Button>
                </div>

                {/* Social proof */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {["👩‍🍳", "👨‍🍳", "👩", "👨"].map((emoji, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-sm border-2 border-white"
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <span>
                    Trusted by <strong className="text-slate-700">50,000+</strong> home cooks
                  </span>
                </div>
              </div>

              {/* Right: App Preview Card */}
              <div className="relative z-10">
                <Card className="bg-white rounded-3xl p-6 shadow-2xl border-0 relative">
                  {/* Card header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-2xl shadow-lg">
                      👩‍🍳
                    </div>
                    <div>
                      <p className="text-slate-500">Good evening!</p>
                      <p className="text-xl font-semibold text-slate-800">
                        What should we cook tonight?
                      </p>
                    </div>
                  </div>

                  {/* Recipe suggestions */}
                  <div className="space-y-3 mb-6">
                    <RecipePreviewCard
                      emoji="🍝"
                      title="Creamy Tuscan Chicken"
                      time="30 min"
                      servings={4}
                      rating={4.8}
                    />
                    <RecipePreviewCard
                      emoji="🥗"
                      title="Mediterranean Bowl"
                      time="15 min"
                      servings={2}
                      rating={4.9}
                    />
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2">
                    <QuickAction emoji="🥗" label="Quick & Healthy" />
                    <QuickAction emoji="👨‍👩‍👧" label="Family Dinner" />
                    <QuickAction emoji="💰" label="Budget" />
                  </div>

                  {/* Mascot bubble */}
                  <div className="mascot-wiggle absolute -top-6 -right-6 bg-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                    <span className="text-3xl">🥄</span>
                    <div className="text-sm">
                      <p className="font-semibold text-slate-700">I found 12 recipes</p>
                      <p className="text-slate-500">you can make!</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-orange-200 text-orange-700">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Why you&apos;ll love Babe
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Everything you need to take the stress out of{" "}
                <span className="text-orange-500 italic">&quot;what&apos;s for dinner?&quot;</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <FeatureCard
                icon={Sparkles}
                title="Smart Suggestions"
                description="Tell us what's in your fridge, and we'll suggest recipes you can actually make tonight. No more wasted ingredients."
                iconBg="bg-amber-100"
              />
              <FeatureCard
                icon={Calendar}
                title="Weekly Meal Plans"
                description="Plan your whole week in minutes. Drag, drop, done. Shopping list auto-generated and organized by aisle."
                iconBg="bg-sky-100"
              />
              <FeatureCard
                icon={Heart}
                title="Eat What You Love"
                description="Filter by diet, allergies, cook time, or mood. Always find something you're actually excited to make."
                iconBg="bg-rose-100"
              />
              <FeatureCard
                icon={Users}
                title="Family Approved"
                description="Save favorites, track what the kids actually eat, and scale any recipe to feed your crew."
                iconBg="bg-emerald-100"
              />
              <FeatureCard
                icon={ShoppingCart}
                title="Smart Shopping"
                description="One tap to add ingredients to your list. Check off items as you shop. Never forget the garlic again."
                iconBg="bg-violet-100"
              />
              <FeatureCard
                icon={ChefHat}
                title="Cook Mode"
                description="Step-by-step instructions that keep your screen awake. Hands-free voice control while you cook."
                iconBg="bg-orange-100"
              />
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 text-9xl">&ldquo;</div>
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-2xl md:text-3xl text-white font-light italic leading-relaxed mb-8">
                &ldquo;Babe has completely transformed our weeknight dinners. No more 5pm panic
                about what to make. We actually look forward to cooking now!&rdquo;
              </blockquote>
              <cite className="text-slate-400 text-lg not-italic">
                — Sarah & Mike, parents of two
              </cite>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-amber-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Ready to answer{" "}
              <span className="text-orange-500 italic">&quot;what&apos;s for dinner?&quot;</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Join thousands of home cooks who&apos;ve taken the stress out of meal planning.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-16 px-10 text-xl bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/30 border-0 rounded-xl"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Start Planning Free
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-slate-800 text-white">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-2xl shadow-lg">
                  🥄
                </div>
                <span className="text-2xl font-bold">Babe</span>
              </div>
              <p className="text-slate-400 text-center">
                Made for home cooks who are tired of &quot;I don&apos;t know, what do you want?&quot;
              </p>
              <div className="flex gap-6 text-sm text-slate-400">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/help" className="hover:text-white transition-colors">Help</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
