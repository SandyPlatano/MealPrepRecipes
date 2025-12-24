"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HERO_DATA } from "../_data/landing-data";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-32">
      {/* Subtle texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1 className="text-4xl font-mono font-bold tracking-tight text-white sm:text-5xl md:text-7xl">
            {HERO_DATA.headline}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
            {HERO_DATA.subheadline}
          </p>

          {/* Email form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder={HERO_DATA.inputPlaceholder}
              className="h-12 flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:border-white focus:ring-white"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 bg-white px-8 text-primary hover:bg-white/90"
            >
              {HERO_DATA.ctaText}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </form>

          {/* Trust indicator */}
          <p className="mt-6 text-sm text-white/60">
            No credit card required. Free 14-day trial.
          </p>
        </div>
      </div>
    </section>
  );
}
