'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles, TrendingUp } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION - Peek Insights Style (Enhanced)
// Clean design with floating stat cards and decorative elements
// ═══════════════════════════════════════════════════════════════════════════

// Constants for typewriter animation timing
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_TIME = 2500;
const TYPEWRITER_PHRASES = ['for Dinner?', 'to Prep?', 'to Buy?'] as const;

// Typewriter effect for dynamic headline
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
    <span className="text-tertiary">
      {displayText}
      <span className="animate-cursor-blink">|</span>
    </span>
  );
});

// Feature check item with staggered entrance animation
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
      <span className="w-5 h-5 bg-secondary flex items-center justify-center flex-shrink-0 rounded-full">
        <Check className="w-3 h-3 text-foreground" strokeWidth={3} />
      </span>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
});

// Floating stat card component - small tilted cards
function FloatingStat({
  value,
  label,
  position,
  delay = 0,
  color = 'yellow',
  rotation = -2
}: {
  value: string;
  label: string;
  position: string;
  delay?: number;
  color?: 'yellow' | 'purple' | 'green';
  rotation?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    yellow: 'bg-secondary',
    purple: 'bg-tertiary/20',
    green: 'bg-primary/20',
  };

  return (
    <div
      className={`
        absolute ${position}
        ${colorClasses[color]}
        px-3 py-2 rounded-lg border-2 border-black shadow-retro
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        hidden xl:block
        z-20
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-display font-bold text-foreground">{value}</span>
        {color === 'green' && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center pt-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating stat cards - positioned relative to section */}
      <FloatingStat
        value="+47%"
        label="Less food waste"
        position="top-28 left-[8%]"
        delay={0}
        color="green"
        rotation={-3}
      />
      <FloatingStat
        value="5hrs"
        label="Saved weekly"
        position="top-40 right-[10%]"
        delay={200}
        color="yellow"
        rotation={2}
      />
      <FloatingStat
        value="10K+"
        label="Happy cooks"
        position="bottom-48 left-[12%]"
        delay={400}
        color="purple"
        rotation={-2}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10 py-16">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Badge */}
          <div className="mb-8">
            <span className="bg-secondary border-2 border-black text-foreground text-xs font-bold px-3 py-1 rounded inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI-Powered Meal Planning
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 leading-[1.1] tracking-tight">
            What&apos;s <TypewriterText />
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Import any recipe. Plan your week. Generate <span className="underline">shopping lists</span>.
            Cook step-by-step. All in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <button
                type="button"
                className="btn-primary text-lg px-8 py-4 group"
              >
                <span>Start Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="#features">
              <button
                type="button"
                className="btn-secondary text-lg px-8 py-4"
              >
                See How It Works
              </button>
            </Link>
          </div>

          {/* Feature checks with staggered entrance */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <FeatureCheck delay={0}>AI Recipe Import</FeatureCheck>
            <FeatureCheck delay={150}>Smart Shopping Lists</FeatureCheck>
            <FeatureCheck delay={300}>No Credit Card</FeatureCheck>
          </div>
        </div>
      </div>
    </section>
  );
}
