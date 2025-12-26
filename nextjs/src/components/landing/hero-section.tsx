'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ChefPixel, PixelDecoration } from './pixel-art';
import { memo, useEffect, useMemo, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED GRADIENT MESH BLOBS
// Soft, slowly-moving background accents for depth
// ═══════════════════════════════════════════════════════════════════════════

function GradientMeshBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orange blob - top right */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] animate-blob"
        style={{
          background: 'radial-gradient(circle, #F97316 0%, transparent 70%)',
        }}
      />
      {/* Secondary purple blob - left */}
      <div
        className="absolute top-1/3 -left-48 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] animate-blob animation-delay-2000"
        style={{
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
        }}
      />
      {/* Tertiary warm blob - bottom */}
      <div
        className="absolute -bottom-32 right-1/4 w-[350px] h-[350px] rounded-full opacity-10 blur-[80px] animate-blob animation-delay-4000"
        style={{
          background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// Pixel art chef character with clean, approachable messaging
// ═══════════════════════════════════════════════════════════════════════════

// Constants for typewriter animation timing
const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_TIME = 2500;
const TYPEWRITER_PHRASES = ['for Dinner?', 'to Prep?', 'to Buy?'] as const;

// Typewriter effect for dynamic headline (memoized to prevent parent rerenders)
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
    <span className="text-[#F97316] inline-block min-w-[180px]">
      {displayText}
      <span className="animate-cursor-blink text-[#F97316]">|</span>
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
      <span className="w-5 h-5 bg-[#F97316] flex items-center justify-center flex-shrink-0 rounded-sm shadow-[0_0_10px_rgba(249,115,22,0.3)]">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
      <span className="text-[#FDFBF7]/80">{children}</span>
    </div>
  );
});

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#111111]" />

      {/* Animated gradient mesh blobs for depth */}
      <GradientMeshBlobs />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Corner decorations - orange/hunter green */}
      <div className="absolute top-8 left-8 text-[#F97316]/20 animate-pulse-slow">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute bottom-8 right-8 text-[#1a4d2e]/25 rotate-180 animate-pulse-slow animation-delay-2000">
        <PixelDecoration variant="corner" />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Chef pixel art with float animation and glow */}
          <div className="mb-8 flex justify-center">
            <div className="relative animate-float">
              {/* Glow effect behind chef */}
              <div className="absolute inset-0 blur-2xl bg-[#F97316]/20 rounded-full scale-150" />
              <div className="relative">
                <ChefPixel size={140} />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mb-6">
            <span className="badge-pixel-orange">
              AI-Powered Meal Planning
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FDFBF7] mb-6 leading-tight">
            What&apos;s <TypewriterText />
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#FDFBF7]/70 max-w-2xl mx-auto mb-8 leading-relaxed">
            Import any recipe. Plan your week. Generate shopping lists.
            Cook step-by-step. All in one place.
          </p>

          {/* CTA Buttons with glassmorphism */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <button
                type="button"
                className="
                  group relative overflow-hidden
                  px-8 py-4 text-lg font-bold
                  bg-[#F97316] text-white
                  border-2 border-[#F97316]
                  shadow-[0_0_30px_rgba(249,115,22,0.3)]
                  hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]
                  hover:scale-105
                  active:scale-[0.98]
                  transition-all duration-300 ease-out
                  flex items-center gap-2
                "
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">Start Free</span>
                <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="#features">
              <button
                type="button"
                className="
                  px-8 py-4 text-lg font-bold
                  bg-white/5 backdrop-blur-sm
                  text-[#FDFBF7]
                  border border-[#FDFBF7]/20
                  hover:bg-white/10 hover:border-[#FDFBF7]/40
                  hover:scale-105
                  active:scale-[0.98]
                  transition-all duration-300 ease-out
                "
              >
                See Demo
              </button>
            </Link>
          </div>

          {/* Feature checks with staggered entrance */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <FeatureCheck delay={0}>AI Recipe Import</FeatureCheck>
            <FeatureCheck delay={150}>Smart Shopping Lists</FeatureCheck>
            <FeatureCheck delay={300}>No Credit Card</FeatureCheck>
          </div>
        </div>

        {/* Scroll indicator - hidden on mobile */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[#F97316]/60">
          <span className="text-xs font-mono uppercase tracking-wider">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#F97316]/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
