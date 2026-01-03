'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart, Play } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { StarSmall } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION - Premium & Polished Redesign
// Single clear headline, dual CTA, client logos, glassmorphism mockup
// ═══════════════════════════════════════════════════════════════════════════

// Feature check component
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
        <StarSmall size={10} className="text-[#1A1A1A]" />
      </span>
      <span className="text-gray-600">{children}</span>
    </div>
  );
});

// Meal data for the week mockup
const WEEK_MEALS = [
  { day: 'Mon', meal: 'Pasta', emoji: '🍝', color: 'bg-[#FFF6D8]' },
  { day: 'Tue', meal: 'Salad', emoji: '🥗', color: 'bg-[#DCFCE7]' },
  { day: 'Wed', meal: 'Tacos', emoji: '🌮', color: 'bg-[#FFF0E6]' },
  { day: 'Thu', meal: 'Curry', emoji: '🍛', color: 'bg-[#EDE9FE]' },
  { day: 'Fri', meal: 'Stir Fry', emoji: '🥘', color: 'bg-[#E0F2FE]' },
] as const;


// Premium App Mockup with glassmorphism
function AppMockup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        relative
        transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
    >
      {/* Floating animation wrapper */}
      <div className="animate-float-slow">
        <div
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 overflow-hidden shadow-premium-xl"
        >
          {/* Glassmorphism Browser Chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 mx-8">
              <div className="glass-subtle rounded-full py-1.5 px-4 text-sm text-gray-500 max-w-[260px] mx-auto flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                whatsfordinner.app
              </div>
            </div>
          </div>

          {/* App Content */}
          <div className="p-5 md:p-8 bg-gradient-to-br from-[#FFFCF6] to-[#FEFEF9]">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A]">This Week</h3>
                <p className="text-xs md:text-sm text-gray-500">Jan 6 - Jan 10</p>
              </div>
              <div className="flex items-center gap-2 bg-[#D9F99D]/30 px-3 py-1.5 rounded-full">
                <span className="text-xs md:text-sm font-medium text-[#1A1A1A]">5 mins to plan</span>
              </div>
            </div>

            {/* Week Meal Grid */}
            <div className="grid grid-cols-5 gap-2 md:gap-3 mb-5 md:mb-6">
              {WEEK_MEALS.map((item, i) => (
                <div
                  key={item.day}
                  className={`
                    ${item.color} rounded-xl p-3 md:p-4 text-center
                    transition-all duration-300 hover:scale-[1.02]
                    ${i === 0 ? 'ring-2 ring-[#1A1A1A] ring-offset-2 shadow-lg' : 'hover:shadow-md'}
                  `}
                >
                  <div className={`text-[10px] md:text-xs font-semibold mb-2 ${i === 0 ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>
                    {item.day}
                  </div>
                  <div className="text-2xl md:text-4xl mb-2">
                    {item.emoji}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-[#1A1A1A] truncate">
                    {item.meal}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Stats Row - Money focused */}
            <div className="grid grid-cols-2 gap-3">
              {/* Shopping List */}
              <div className="bg-[#D9F99D] rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-[#1A1A1A]" />
                  <span className="text-xs font-medium text-[#1A1A1A]">Shopping List</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">23</div>
                <div className="text-xs text-[#1A1A1A]/60">items needed</div>
              </div>

              {/* Weekly Savings */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">💰</span>
                  <span className="text-xs font-medium text-gray-600">Est. Savings</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-[#22C55E]">$67</div>
                <div className="text-xs text-gray-500">vs. no plan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative glow behind mockup */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#D9F99D]/20 via-transparent to-[#D9F99D]/20 blur-3xl -z-10 rounded-full" />
    </div>
  );
}

export function HeroSection() {
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 md:pt-32 pb-8 md:pb-12 overflow-hidden bg-[#FFFCF6]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#D9F99D]/5 pointer-events-none" />

      {/* Main content - Two column layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div
            className={`
              text-center lg:text-left
              transition-all duration-700 ease-out
              ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            {/* Badge */}
            <div className="mb-6">
              <span className="bg-white border border-gray-200 text-[#1A1A1A] text-xs font-medium px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm">
                <StarSmall size={14} className="text-[#84CC16]" />
                Americans waste 30-40% of the food they buy
              </span>
            </div>

            {/* Main Headline - Single, Clear Value Prop */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold text-[#1A1A1A] mb-4 leading-[1.05] tracking-tight">
              Groceries are expensive.
              <br />
              <span className="text-[#1A1A1A]">Planning isn&apos;t.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed">
              Spend 5 minutes planning your week. Save money on groceries. Actually eat what you buy.
            </p>

            {/* Differentiator line */}
            <p className="text-base text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8 italic">
              Not batch cooking — just knowing what&apos;s for dinner before you&apos;re starving and staring at the fridge.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-8">
              <Link href="/signup">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Start planning free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>
              <Link href="#features">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-transparent text-[#1A1A1A] px-8 py-4 rounded-full font-medium text-base hover:bg-gray-100 transition-all duration-200 border border-gray-300 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <Play className="w-4 h-4" />
                  See how it works
                </button>
              </Link>
            </div>

            {/* Feature checks */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2">
              <FeatureCheck delay={0}>Free forever plan</FeatureCheck>
              <FeatureCheck delay={150}>No credit card needed</FeatureCheck>
              <FeatureCheck delay={300}>Set up in 2 minutes</FeatureCheck>
            </div>
          </div>

          {/* Right Column - App Mockup */}
          <div className="relative">
            <AppMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
