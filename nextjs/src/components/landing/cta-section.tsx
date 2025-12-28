'use client';

import Link from 'next/link';
import { ArrowRight, Utensils, Heart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION - Neo-Brutalist/Retro Style
// Bold, centered call-to-action with retro floating badges
// ═══════════════════════════════════════════════════════════════════════════

// Floating decorative badge
function FloatingBadge({
  children,
  position,
  delay = 0,
  rotation = -2,
  color = 'yellow'
}: {
  children: React.ReactNode;
  position: string;
  delay?: number;
  rotation?: number;
  color?: 'yellow' | 'purple';
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    yellow: 'bg-secondary border-2 border-black shadow-retro',
    purple: 'bg-primary/10 border-2 border-black shadow-retro',
  };

  return (
    <div
      className={`
        absolute ${position}
        ${colorClasses[color]} px-3 py-2 rounded-lg
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        hidden lg:flex items-center gap-2
        z-20
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </div>
  );
}

export function CTASection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating badges */}
      <FloatingBadge position="top-32 left-[15%]" delay={0} rotation={-3} color="purple">
        <Heart className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground">Made with love</span>
      </FloatingBadge>

      <FloatingBadge position="top-40 right-[12%]" delay={200} rotation={2} color="yellow">
        <Star className="w-4 h-4 text-foreground" />
        <span className="text-sm font-bold text-foreground">4.9 stars</span>
      </FloatingBadge>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon with sparkle animation */}
          <div className="mb-8 flex justify-center relative">
            <div className="w-20 h-20 rounded-full bg-secondary border-2 border-black flex items-center justify-center relative shadow-retro">
              <Utensils className="w-10 h-10 text-foreground" />
              {/* Sparkle decorations */}
              <span className="absolute -top-1 -right-1 text-primary animate-sparkle">✦</span>
              <span className="absolute -bottom-1 -left-1 text-tertiary animate-sparkle" style={{ animationDelay: '0.5s' }}>✦</span>
            </div>
          </div>

          {/* Headline with highlight */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Ready to answer
            <br />
            <span className="text-primary">&ldquo;What&apos;s for dinner?&rdquo;</span>
          </h2>

          {/* Subheadline */}
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Join thousands of home cooks who plan <span className="underline">smarter</span>, shop <span className="underline">faster</span>, and cook <span className="underline">better</span>.
          </p>

          {/* CTA Button with arrow */}
          <div className="mb-6 relative inline-block">
            {/* Hand-drawn arrow pointing to button */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden md:block">
              <svg width="50" height="35" viewBox="0 0 50 35" fill="none" className="animate-bounce">
                <path d="M25 3C25 3 15 15 25 27M25 27L18 20M25 27L32 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
              </svg>
            </div>

            <Link href="/signup">
              <button
                type="button"
                className="btn-primary flex items-center gap-2 text-lg group"
              >
                <span>Start Planning Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* No credit card note */}
          <p className="text-sm text-muted-foreground">
            No credit card required. Free forever plan available.
          </p>
        </div>
      </div>
    </section>
  );
}
