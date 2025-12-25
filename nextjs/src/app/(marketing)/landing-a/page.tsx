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
  Utensils,
  Heart,
  ArrowRight,
  Play
} from "lucide-react";

// Floating food element component
const FloatingFood = ({
  emoji,
  className,
  delay = 0
}: {
  emoji: string;
  className: string;
  delay?: number;
}) => (
  <div
    className={`absolute text-4xl md:text-5xl select-none pointer-events-none ${className}`}
    style={{
      animation: `float 6s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    {emoji}
  </div>
);

// Feature card component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => (
  <Card
    className="group relative overflow-hidden bg-[#1a1a1a] p-6 border-3 border-[#333] shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#F97316]"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-[#F97316]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="w-14 h-14 bg-[#F97316] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#FDFBF7] mb-2 font-sans">{title}</h3>
      <p className="text-[#888888] leading-relaxed">{description}</p>
    </div>
  </Card>
);

// Stat component
const Stat = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-black text-[#F97316] mb-1">{number}</div>
    <div className="text-[#FDFBF7]/70 text-sm uppercase tracking-wider">{label}</div>
  </div>
);

export default function LandingAPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Custom styles for this page */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@400;500;600;700&display=swap');

        .landing-a * {
          font-family: 'Nunito', sans-serif;
        }

        .landing-a h1, .landing-a h2, .landing-a h3 {
          font-family: 'Quicksand', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(3deg); }
          75% { transform: translateY(-8px) rotate(-3deg); }
        }

        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }

        .mascot-container {
          animation: bounce-gentle 3s ease-in-out infinite;
        }

        .mascot-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .speech-bubble {
          animation: wiggle 3s ease-in-out infinite;
        }
      `}</style>

      <div className="landing-a">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Solid Dark Background */}
          <div className="absolute inset-0 bg-[#111111]" />

          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Ember glow accents */}
          <div className="absolute top-20 left-10 w-32 h-16 bg-[#F97316]/10 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-48 h-20 bg-[#F97316]/5 rounded-full blur-2xl" />
          <div className="absolute bottom-40 left-1/4 w-40 h-16 bg-[#F97316]/10 rounded-full blur-xl" />

          {/* Floating food elements */}
          <FloatingFood emoji="🥑" className="top-[15%] left-[8%]" delay={0} />
          <FloatingFood emoji="🍳" className="top-[25%] right-[10%]" delay={1} />
          <FloatingFood emoji="🥕" className="top-[60%] left-[5%]" delay={2} />
          <FloatingFood emoji="🍲" className="top-[45%] right-[8%]" delay={0.5} />
          <FloatingFood emoji="🥗" className="top-[75%] right-[15%]" delay={1.5} />
          <FloatingFood emoji="🧅" className="top-[80%] left-[12%]" delay={3} />
          <FloatingFood emoji="🍅" className="top-[30%] left-[15%]" delay={2.5} />
          <FloatingFood emoji="🥦" className="top-[55%] right-[20%]" delay={1.8} />

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 bg-[#1a1a1a] border-2 border-[#F97316] text-[#FDFBF7]"
            >
              <Utensils className="w-4 h-4 mr-2" />
              Your personal meal planning companion
            </Badge>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#FDFBF7] mb-6 leading-tight">
              Babe,{" "}
              <span className="text-[#F97316]">
                what&apos;s for dinner?
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-[#FDFBF7]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Plan your meals, discover recipes, and never wonder what to cook again.
              Your kitchen companion that makes meal prep feel <em className="text-[#F97316]">effortless</em>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-[#F97316] hover:bg-[#F97316]/90 text-white border-3 border-[#111111] shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Planning Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg bg-transparent border-3 border-[#FDFBF7] text-[#FDFBF7] hover:bg-[#FDFBF7]/10"
              >
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Mascot */}
            <div className="mascot-container relative w-40 h-40 mx-auto">
              <div className="mascot-ring absolute inset-0 rounded-full bg-[#F97316]/30" />
              <div className="absolute inset-2 rounded-full bg-[#1a1a1a] shadow-2xl flex items-center justify-center border-3 border-[#F97316]">
                <span className="text-7xl">🥄</span>
              </div>
              {/* Speech bubble */}
              <div className="speech-bubble absolute -top-4 -right-16 bg-[#1a1a1a] px-4 py-2 rounded-2xl shadow-lg border-2 border-[#F97316]">
                <span className="text-sm font-bold text-[#F97316]">Let&apos;s cook!</span>
                <div className="absolute bottom-0 left-4 w-3 h-3 bg-[#1a1a1a] border-l-2 border-b-2 border-[#F97316] transform rotate-45 -translate-y-1" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[#111111] relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-[#F97316] text-[#F97316]">
                <ChefHat className="w-4 h-4 mr-2" />
                Everything you need
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-[#FDFBF7] mb-4">
                Meal prep like a{" "}
                <span className="text-[#F97316]">
                  pro
                </span>
              </h2>
              <p className="text-xl text-[#888888] max-w-2xl mx-auto">
                From recipe discovery to shopping list, we&apos;ve got your back.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <FeatureCard
                icon={Calendar}
                title="Smart Meal Planning"
                description="Drag and drop recipes into your weekly plan. We'll generate your shopping list automatically."
                delay={0}
              />
              <FeatureCard
                icon={Search}
                title="Recipe Discovery"
                description="Find recipes by ingredients you have, dietary needs, or cuisine. Never get bored with dinner."
                delay={100}
              />
              <FeatureCard
                icon={ShoppingCart}
                title="Smart Shopping Lists"
                description="Auto-generated lists organized by store aisle. Check off items as you shop."
                delay={200}
              />
              <FeatureCard
                icon={Users}
                title="Family Friendly"
                description="Scale recipes for any family size. Track everyone's preferences and allergies."
                delay={300}
              />
              <FeatureCard
                icon={Clock}
                title="Quick & Easy"
                description="Filter by cook time. Find 15-minute meals for busy weeknights."
                delay={400}
              />
              <FeatureCard
                icon={Heart}
                title="Save Favorites"
                description="Build your personal cookbook. Rate recipes and remember what worked."
                delay={500}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-[#1a1a1a] relative overflow-hidden border-y-4 border-[#F97316]">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 text-8xl">🍳</div>
            <div className="absolute bottom-10 right-10 text-8xl">🥗</div>
            <div className="absolute top-1/2 left-1/4 text-6xl">🥕</div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-[#FDFBF7] text-center mb-12">
              Trusted by home cooks everywhere
            </h2>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20">
              <Stat number="10K+" label="Recipes" />
              <Stat number="50K+" label="Happy Cooks" />
              <Stat number="2M+" label="Meals Planned" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#111111] relative">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-[#FDFBF7] mb-6">
              Ready to answer{" "}
              <span className="text-[#F97316]">
                &quot;what&apos;s for dinner?&quot;
              </span>
            </h2>
            <p className="text-xl text-[#888888] max-w-2xl mx-auto mb-10">
              Join thousands of home cooks who&apos;ve taken the stress out of meal planning.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-16 px-10 text-xl bg-[#F97316] hover:bg-[#F97316]/90 text-white border-3 border-[#111111] shadow-[6px_6px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#000] transition-all"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Start Planning Free
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-[#1a1a1a] border-t-4 border-[#F97316]">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">🥄</span>
              <span className="text-2xl font-bold text-[#FDFBF7]">Babe</span>
            </div>
            <p className="text-[#888888]">
              Made with <span className="text-[#F97316]">❤️</span> for home cooks everywhere
            </p>
            <div className="flex justify-center gap-6 mt-6 text-sm text-[#888888]">
              <Link href="/privacy" className="hover:text-[#F97316] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#F97316] transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-[#F97316] transition-colors">About</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
