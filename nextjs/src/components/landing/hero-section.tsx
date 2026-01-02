'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles, Calendar, ShoppingCart, ChefHat } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION - Warm & Cozy Design System (Pass 3 Micro Polish)
// Focus states, active states, refined animation timing, accessibility
// ═══════════════════════════════════════════════════════════════════════════

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_TIME = 2500;
const TYPEWRITER_PHRASES = ['for Dinner?', 'to Prep?', 'to Buy?'] as const;

// Decorative star SVG
function StarDecoration({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M20 0L24.49 15.51L40 20L24.49 24.49L20 40L15.51 24.49L0 20L15.51 15.51L20 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Typewriter effect
const TypewriterText = memo(function TypewriterText() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = useMemo(
    () => TYPEWRITER_PHRASES[textIndex % TYPEWRITER_PHRASES.length],
    [textIndex]
  );

  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText !== currentPhrase) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), PAUSE_TIME);
        }
      } else {
        if (displayText !== '') {
          setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => prev + 1);
        }
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhrase]);

  return (
    <span className="text-[#D9F99D] relative">
      {displayText}
      <span className="animate-pulse ml-0.5">|</span>
    </span>
  );
});

// Feature check
const FeatureCheck = memo(function FeatureCheck({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        flex items-center gap-2 text-sm
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <span className="w-5 h-5 bg-[#D9F99D] flex items-center justify-center flex-shrink-0 rounded-full">
        <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={3} />
      </span>
      <span className="text-gray-600">{children}</span>
    </div>
  );
});

// App Mockup Component
function AppMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-full py-1 px-3 text-xs text-gray-400 max-w-[200px] mx-auto border border-gray-200">
            babewfd.com
          </div>
        </div>
      </div>

      {/* App Content */}
      <div className="p-4 bg-[#FFFCF6]">
        {/* Mini Sidebar + Content */}
        <div className="flex gap-3">
          {/* Mini Sidebar */}
          <div className="w-12 bg-[#0D1117] rounded-lg p-2 space-y-2">
            <div className="w-8 h-8 bg-[#D9F99D] rounded-md flex items-center justify-center">
              <span className="text-[#1A1A1A] font-bold text-[10px]">B</span>
            </div>
            <div className="w-8 h-8 bg-gray-800 rounded-md" />
            <div className="w-8 h-8 bg-gray-800 rounded-md" />
            <div className="w-8 h-8 bg-gray-800 rounded-md" />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Week View Header */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-700">This Week</div>
              <div className="flex gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                  <div
                    key={day}
                    className="w-8 h-6 bg-white rounded text-[8px] text-gray-500 flex items-center justify-center border border-gray-100"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Recipe Cards */}
            <div className="grid grid-cols-3 gap-2">
              <MiniRecipeCard color="bg-[#FFF6D8]" icon={Calendar} />
              <MiniRecipeCard color="bg-[#EDE9FE]" icon={ShoppingCart} />
              <MiniRecipeCard color="bg-[#FFF0E6]" icon={ChefHat} />
            </div>

            {/* Stats Row */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg p-2 border border-gray-100">
                <div className="text-[10px] text-gray-400">Recipes</div>
                <div className="text-sm font-bold text-[#1A1A1A]">12</div>
              </div>
              <div className="flex-1 bg-white rounded-lg p-2 border border-gray-100">
                <div className="text-[10px] text-gray-400">Planned</div>
                <div className="text-sm font-bold text-[#1A1A1A]">5</div>
              </div>
              <div className="flex-1 bg-[#D9F99D] rounded-lg p-2">
                <div className="text-[10px] text-gray-600">Shopping</div>
                <div className="text-sm font-bold text-[#1A1A1A]">23 items</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRecipeCard({ color, icon: Icon }: { color: string; icon: React.ElementType }) {
  return (
    <div className={`${color} rounded-lg p-2 space-y-1`}>
      <div className="w-full h-8 bg-white/60 rounded" />
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-gray-500" />
        <div className="h-2 bg-gray-300/50 rounded flex-1" />
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-12 overflow-hidden bg-[#FFFCF6]">
      {/* Decorative stars */}
      <div className="absolute top-32 left-[8%] opacity-10 hidden lg:block">
        <StarDecoration className="text-[#1A1A1A] w-6 h-6" />
      </div>
      <div className="absolute top-48 right-[12%] opacity-10 hidden lg:block">
        <StarDecoration className="text-[#1A1A1A] w-10 h-10" />
      </div>
      <div className="absolute bottom-40 left-[15%] opacity-10 hidden lg:block">
        <StarDecoration className="text-[#1A1A1A] w-8 h-8" />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-6">
            <span className="bg-white border border-gray-200 text-[#1A1A1A] text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D9F99D]" />
              AI-Powered Meal Planning
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1A1A1A] mb-5 leading-[1.1] tracking-tight">
            Babe, What&apos;s <TypewriterText />
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Import any recipe. Plan your week. Generate shopping lists.
            Cook step-by-step. All in one place.
          </p>

          {/* CTA Buttons - Happy Medium Size with micro interactions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/signup">
              <button
                type="button"
                className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all duration-150 flex items-center gap-2 group shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
            </Link>
            <Link href="#features">
              <button
                type="button"
                className="bg-white text-[#1A1A1A] px-5 py-2.5 rounded-full font-medium text-sm hover:bg-gray-50 transition-all duration-150 border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                See how it works
              </button>
            </Link>
          </div>

          {/* Feature checks */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <FeatureCheck delay={0}>AI Recipe Import</FeatureCheck>
            <FeatureCheck delay={150}>Smart Shopping Lists</FeatureCheck>
            <FeatureCheck delay={300}>No Credit Card</FeatureCheck>
          </div>
        </div>

        {/* App Mockup */}
        <div className="mt-12 max-w-3xl mx-auto">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}
