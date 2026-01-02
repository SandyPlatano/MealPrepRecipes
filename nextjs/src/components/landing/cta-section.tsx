'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION - Warm & Cozy Design System (Pass 3 Micro Polish)
// Lime green background, focus states, active states, animations
// ═══════════════════════════════════════════════════════════════════════════

// Decorative star SVG
function StarDecoration({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
    >
      <path
        d="M20 0L24.49 15.51L40 20L24.49 24.49L20 40L15.51 24.49L0 20L15.51 15.51L20 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CTASection() {
  return (
    <section className="bg-[#E4F8C9] py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-8 left-8 opacity-15 hidden sm:block">
        <StarDecoration className="text-[#1A1A1A] w-8 h-8" />
      </div>
      <div className="absolute bottom-8 right-16 opacity-15 hidden sm:block">
        <StarDecoration className="text-[#1A1A1A] w-10 h-10" />
      </div>
      <div className="absolute top-1/2 left-[5%] opacity-10 hidden lg:block">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[#1A1A1A] rotate-12"
        >
          <path d="M50 10 C 20 10, 10 30, 10 50 C 10 80, 30 90, 50 90 C 80 90, 90 70, 90 50 C 90 20, 70 10, 50 10 Z M 50 30 C 60 30, 65 40, 65 50 C 65 60, 60 70, 50 70 C 40 70, 35 60, 35 50 C 35 40, 40 30, 50 30 Z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Headline */}
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
          Ready to answer
          <br />
          &ldquo;What&apos;s for dinner?&rdquo;
        </h2>

        {/* Subtext */}
        <p className="text-gray-700 max-w-xl mx-auto mb-8 text-sm sm:text-base">
          Join thousands of home cooks who plan smarter, shop faster, and cook better.
          Start your free account today.
        </p>

        {/* CTA Button - with focus and active states */}
        <Link href="/signup">
          <button
            type="button"
            className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all duration-150 flex items-center gap-2 group mx-auto shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E4F8C9] active:scale-[0.98]"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>
        </Link>

        {/* No credit card note */}
        <p className="text-xs text-gray-600 mt-4">
          No credit card required. Free forever plan available.
        </p>
      </div>
    </section>
  );
}
