"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/logo";

interface ValueProp {
  icon: React.ReactNode;
  label: string;
}

const valueProps: ValueProp[] = [
  { icon: <Sparkles className="h-4 w-4" />, label: "AI-powered recipe import" },
  { icon: <Zap className="h-4 w-4" />, label: "Auto shopping lists" },
  { icon: <CreditCard className="h-4 w-4" />, label: "No credit card required" },
];

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Main brand headline */}
          <div className="animate-fade-in">
            <BrandLogo size="xl" showIcon={false} showTagline={true} className="justify-center" />
          </div>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl lg:text-2xl text-cream/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            Plan meals, generate shopping lists, and cook with confidence
            — all in one place.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base md:text-lg px-8 py-6 shadow-glow-red hover:shadow-glow-red-strong transition-all duration-200 hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-8 py-6 border-dark-border text-cream hover:bg-dark-lighter transition-all duration-200"
              >
                See how it works
              </Button>
            </Link>
          </div>

          {/* Value propositions - real features, not fake stats */}
          <div
            className="pt-8 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {valueProps.map((prop, index) => (
                <ValueBadge key={index} {...prop} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueBadge({ icon, label }: ValueProp) {
  return (
    <div className="flex items-center gap-2 text-cream/60">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
