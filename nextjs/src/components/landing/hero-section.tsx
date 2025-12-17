"use client";

import Link from "next/link";
import { ArrowRight, Star, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrustIndicator {
  icon: React.ReactNode;
  label: string;
}

const trustIndicators: TrustIndicator[] = [
  { icon: <Trophy className="h-4 w-4" />, label: "4.9 on App Store" },
  { icon: <Users className="h-4 w-4" />, label: "2,400+ households" },
  { icon: <Star className="h-4 w-4" />, label: "Free forever tier" },
];

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-coral-tint-50/50 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-clay-text animate-fade-in">
            Your kitchen,{" "}
            <span className="text-primary">finally organized.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl lg:text-2xl text-clay-muted max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
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
                className="text-base md:text-lg px-8 py-6 shadow-clay-lg hover:shadow-clay-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                variant="outline"
                size="lg"
                className="text-base md:text-lg px-8 py-6 border-clay-border hover:border-clay-border-hover hover:bg-clay-bg transition-all duration-200"
              >
                See how it works
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className="pt-8 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {trustIndicators.map((indicator, index) => (
                <TrustBadge key={index} {...indicator} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, label }: TrustIndicator) {
  return (
    <div className="flex items-center gap-2 text-clay-muted">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
