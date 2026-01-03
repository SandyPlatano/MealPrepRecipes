'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StarSmall } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// STICKY CTA - Premium Glassmorphism Floating Bar
// Frosted glass, brand name, minimal footprint, smooth slide-up
// ═══════════════════════════════════════════════════════════════════════════

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const showAfter = 600;
      const hideNearBottom = document.documentElement.scrollHeight * 0.75;
      const shouldShow = scrollY > showAfter && scrollY < hideNearBottom;

      if (shouldShow && !hasAnimated) {
        setHasAnimated(true);
      }

      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  return (
    <div
      className={`
        fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 z-50
        transition-all duration-500 ease-out
        ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[120%] opacity-0 pointer-events-none'
        }
      `}
    >
      {/* Glassmorphism Bar */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-premium-xl rounded-2xl overflow-hidden md:max-w-md mx-auto">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Brand and Message */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <StarSmall size={16} className="text-[#84CC16]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1A1A1A] truncate">
                  Babe, What&apos;s for Dinner?
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  No credit card • Free forever plan
                </p>
              </div>
            </div>

            {/* Right side - CTA Button */}
            <Link
              href="/signup"
              className="
                inline-flex items-center gap-2
                bg-[#1A1A1A] text-white
                px-5 py-2.5 rounded-full
                text-sm font-semibold
                hover:bg-gray-800 transition-all duration-200
                group shadow-lg hover:shadow-xl
                flex-shrink-0
              "
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Progress indicator (decorative) */}
        <div className="h-0.5 bg-gradient-to-r from-[#D9F99D] via-[#84CC16] to-[#D9F99D]" />
      </div>
    </div>
  );
}
