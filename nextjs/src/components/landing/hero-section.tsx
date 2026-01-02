'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles, ShoppingCart, Users } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION - Warm & Cozy Design System
// Larger mockup focus with staggered entrance animations
// ═══════════════════════════════════════════════════════════════════════════

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_TIME = 2500;
const TYPEWRITER_PHRASES = ['for Dinner?', 'to Prep?', 'to Buy?'] as const;

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

// Meal data for the week
const WEEK_MEALS = [
  { day: 'Mon', meal: 'Pasta', emoji: '🍝', cook: 'sarah', color: 'bg-[#FFF6D8]' },
  { day: 'Tue', meal: 'Salad', emoji: '🥗', cook: 'mike', color: 'bg-[#DCFCE7]' },
  { day: 'Wed', meal: 'Tacos', emoji: '🌮', cook: 'sarah', color: 'bg-[#FFF0E6]' },
  { day: 'Thu', meal: 'Curry', emoji: '🍛', cook: 'mike', color: 'bg-[#EDE9FE]' },
  { day: 'Fri', meal: 'Pizza', emoji: '🍕', cook: 'out', color: 'bg-gray-100' },
] as const;

// Avatar component for cook assignment
function CookAvatar({ cook, size = 'sm' }: { cook: 'sarah' | 'mike' | 'out'; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';

  if (cook === 'out') {
    return (
      <div className={`${sizeClasses} rounded-full bg-gray-200 flex items-center justify-center`}>
        <span>🍽️</span>
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses} rounded-full flex items-center justify-center font-semibold text-white
        ${cook === 'sarah' ? 'bg-pink-400' : 'bg-blue-400'}
      `}
    >
      {cook === 'sarah' ? 'S' : 'M'}
    </div>
  );
}

// App Mockup Component - "Who's Cooking Tonight?" design
function AppMockup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const sarahMeals = WEEK_MEALS.filter(m => m.cook === 'sarah').length;
  const mikeMeals = WEEK_MEALS.filter(m => m.cook === 'mike').length;

  return (
    <div
      className={`
        bg-white rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'}
      `}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
        </div>
        <div className="flex-1 mx-8">
          <div className="bg-white rounded-full py-1.5 px-4 text-sm text-gray-500 max-w-[260px] mx-auto border border-gray-200 flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            babewfd.com
          </div>
        </div>
      </div>

      {/* App Content */}
      <div className="p-5 md:p-8 bg-[#FFFCF6]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A]">This Week</h3>
            <p className="text-xs md:text-sm text-gray-500">Jan 6 - Jan 10</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <CookAvatar cook="sarah" size="md" />
              <CookAvatar cook="mike" size="md" />
            </div>
            <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">2 cooks</span>
          </div>
        </div>

        {/* Week Meal Grid - Main Focus */}
        <div className="grid grid-cols-5 gap-2 md:gap-3 mb-5 md:mb-6">
          {WEEK_MEALS.map((item, i) => (
            <div
              key={item.day}
              className={`
                ${item.color} rounded-xl p-3 md:p-4 text-center
                transition-all duration-300 hover:scale-[1.02] hover:shadow-md
                ${i === 0 ? 'ring-2 ring-[#1A1A1A] ring-offset-2' : ''}
              `}
            >
              {/* Day */}
              <div className={`text-[10px] md:text-xs font-semibold mb-2 ${i === 0 ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>
                {item.day}
              </div>

              {/* Emoji */}
              <div className="text-2xl md:text-4xl mb-2">
                {item.emoji}
              </div>

              {/* Meal Name */}
              <div className="text-xs md:text-sm font-medium text-[#1A1A1A] mb-2 truncate">
                {item.meal}
              </div>

              {/* Cook Avatar */}
              <div className="flex justify-center">
                <CookAvatar cook={item.cook} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Shopping List */}
          <div className="bg-[#D9F99D] rounded-xl p-4 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-[#1A1A1A]" />
              <span className="text-xs font-medium text-[#1A1A1A]">Shopping List</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">23</div>
            <div className="text-xs text-[#1A1A1A]/60">items · ~$85</div>
          </div>

          {/* Who's Cooking Stats */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Who&apos;s Cooking</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              {/* Sarah */}
              <div className="flex items-center gap-2">
                <CookAvatar cook="sarah" size="md" />
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A]">Sarah</div>
                  <div className="text-xs text-gray-500">{sarahMeals} meals</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 hidden md:block" />

              {/* Mike */}
              <div className="flex items-center gap-2">
                <CookAvatar cook="mike" size="md" />
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A]">Mike</div>
                  <div className="text-xs text-gray-500">{mikeMeals} meals</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 hidden md:block" />

              {/* Dining Out */}
              <div className="flex items-center gap-2 hidden md:flex">
                <CookAvatar cook="out" size="md" />
                <div>
                  <div className="text-sm font-semibold text-[#1A1A1A]">Out</div>
                  <div className="text-xs text-gray-500">1 night</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className={`
            max-w-3xl mx-auto text-center
            transition-all duration-700 ease-out
            ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* Badge */}
          <div className="mb-5 md:mb-6">
            <span className="bg-white border border-gray-200 text-[#1A1A1A] text-xs font-medium px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#84CC16]" />
              AI-Powered Meal Planning
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#1A1A1A] mb-4 md:mb-5 leading-[1.05] tracking-tight">
            Babe, What&apos;s <TypewriterText />
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
            Import any recipe. Plan your week. Generate shopping lists.
            <span className="hidden sm:inline"> Cook step-by-step.</span> All in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/signup">
              <button
                type="button"
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-semibold text-sm md:text-base hover:bg-gray-800 transition-all duration-150 flex items-center gap-2 group shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                Get started free
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
            </Link>
            <Link href="#features">
              <button
                type="button"
                className="bg-white text-[#1A1A1A] px-6 py-3 rounded-full font-medium text-sm md:text-base hover:bg-gray-50 transition-all duration-150 border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                See how it works
              </button>
            </Link>
          </div>

          {/* Feature checks */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 md:gap-x-6 gap-y-2">
            <FeatureCheck delay={0}>AI Recipe Import</FeatureCheck>
            <FeatureCheck delay={150}>Smart Shopping Lists</FeatureCheck>
            <FeatureCheck delay={300}>No Credit Card</FeatureCheck>
          </div>
        </div>

        {/* App Mockup - Larger */}
        <div className="mt-10 md:mt-14 max-w-4xl lg:max-w-5xl mx-auto px-2">
          <AppMockup />
        </div>
      </div>
    </section>
  );
}
