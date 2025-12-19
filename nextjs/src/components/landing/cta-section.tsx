"use client";

import Link from "next/link";
import { ArrowRight, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-br from-primary to-bold-red-dark relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <ChefHat className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Ready to answer &quot;What&apos;s for dinner?&quot;
          </h2>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-white/80 max-w-lg mx-auto">
            Plan your meals, auto-generate shopping lists, and cook with confidence.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-base md:text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                Start planning free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* No credit card note */}
          <p className="text-sm text-white/60">
            No credit card required. Free forever tier available.
          </p>
        </div>
      </div>
    </section>
  );
}
