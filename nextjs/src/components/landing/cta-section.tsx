'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Quote, Shield, X as CloseIcon } from 'lucide-react';
import { StarDecoration, StarSmall } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION - Premium & Polished Redesign
// Refined gradient, urgency copy, trust badges, micro-testimonial
// ═══════════════════════════════════════════════════════════════════════════

export function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-[#FFFCF6] via-[#F0FDF4] to-[#D9F99D]/30"
    >
      {/* Decorative stars */}
      <StarDecoration
        size={32}
        className="absolute top-8 left-8 text-[#D9F99D]/50 hidden sm:block"
      />
      <StarSmall
        size={18}
        className="absolute top-16 left-20 text-[#84CC16]/30 hidden sm:block"
      />
      <StarDecoration
        size={40}
        className="absolute bottom-8 right-16 text-[#D9F99D]/50 hidden sm:block"
      />
      <StarSmall
        size={14}
        className="absolute bottom-20 right-8 text-[#84CC16]/30 hidden sm:block"
      />

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Micro-testimonial */}
        <div className={`
          mb-8 transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2.5 border border-[#D9F99D]/30 shadow-sm">
            <Quote className="w-4 h-4 text-[#84CC16] flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-[#1A1A1A]">&ldquo;Best $0 I ever spent&rdquo;</span>
              <span className="text-gray-400 ml-2">— Sarah M.</span>
            </p>
          </div>
        </div>

        {/* Headline with urgency */}
        <h2 className={`
          font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6
          transition-all duration-700 delay-100
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          Ready to answer
          <br />
          &ldquo;What&apos;s for dinner?&rdquo;
        </h2>

        {/* Subtext with urgency */}
        <p className={`
          text-gray-600 max-w-xl mx-auto mb-8 text-lg
          transition-all duration-700 delay-200
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          Join 10,000+ home cooks who stopped stressing about meals.
          <br className="hidden sm:block" />
          <span className="font-semibold text-[#1A1A1A]">Start planning tonight.</span>
        </p>

        {/* Large CTA Button */}
        <div className={`
          mb-6 transition-all duration-700 delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <Link href="/signup">
            <button
              type="button"
              className="bg-[#1A1A1A] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 group mx-auto shadow-xl hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <StarSmall size={18} className="text-[#D9F99D]" />
              Get started free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className={`
          flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-500
          transition-all duration-700 delay-400
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#84CC16]" />
            <span>No credit card required</span>
          </div>
          <span className="hidden md:inline text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <CloseIcon className="w-4 h-4 text-gray-400" />
            <span>Cancel anytime</span>
          </div>
          <span className="hidden md:inline text-gray-300">•</span>
          <span>Free forever plan</span>
        </div>
      </div>
    </section>
  );
}
