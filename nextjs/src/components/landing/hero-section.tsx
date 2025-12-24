'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ChefPixel, PixelDecoration } from './pixel-art';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION
// Pixel art chef character with clean, approachable messaging
// ═══════════════════════════════════════════════════════════════════════════

// Typewriter effect for dynamic headline
function TypewriterText() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const phrases = ['for Dinner?', 'to Prep?', 'to Buy?'];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2500;

  useEffect(() => {
    const currentPhrase = phrases[textIndex % phrases.length];

    const handleTyping = () => {
      if (!isDeleting) {
        if (displayText !== currentPhrase) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
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

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, phrases]);

  return (
    <span className="text-[#FF4400] inline-block min-w-[180px]">
      {displayText}
      <span className="animate-cursor-blink text-[#ff66c4]">|</span>
    </span>
  );
}

// Feature check item
function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 h-4 bg-[#FF4400] flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
      <span className="text-[#FDFBF7]/80">{children}</span>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#111111]" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle gradient overlay with pink accent */}
      <div className="absolute inset-0 hero-gradient-dark pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(255, 102, 196, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* Corner decorations - alternating orange/pink */}
      <div className="absolute top-8 left-8 text-[#FF4400]/20">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute bottom-8 right-8 text-[#ff66c4]/25 rotate-180">
        <PixelDecoration variant="corner" />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Chef pixel art */}
          <div className="mb-8 flex justify-center">
            <ChefPixel size={140} />
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <button type="button" className="btn-pixel btn-pixel-primary flex items-center gap-2">
                Start Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="#demo">
              <button type="button" className="btn-pixel btn-pixel-outline border-[#FDFBF7]">
                See Demo
              </button>
            </Link>
          </div>

          {/* Feature checks */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <FeatureCheck>AI Recipe Import</FeatureCheck>
            <FeatureCheck>Smart Shopping Lists</FeatureCheck>
            <FeatureCheck>No Credit Card</FeatureCheck>
          </div>
        </div>

        {/* Scroll indicator - hidden on mobile, pink accent */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[#ff66c4]/60">
          <span className="text-xs font-mono uppercase tracking-wider">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#ff66c4]/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
