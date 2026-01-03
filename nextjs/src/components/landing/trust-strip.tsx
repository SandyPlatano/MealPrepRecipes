'use client';

import { useEffect, useState, useRef } from 'react';
import { Star, Quote } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TRUST STRIP - Premium Social Proof Bar
// Star rating, press logos, micro-testimonial, refined design
// ═══════════════════════════════════════════════════════════════════════════

interface TrustStat {
  value: string;
  numericValue: number;
  suffix: string;
  prefix?: string;
  label: string;
}

const TRUST_STATS: TrustStat[] = [
  { value: '10K+', numericValue: 10, suffix: 'K+', label: 'Home Cooks' },
  { value: '$320', numericValue: 320, suffix: '', prefix: '$', label: 'Avg. saved/month' },
  { value: '2hrs', numericValue: 2, suffix: 'hrs', label: 'Sunday prep time' },
];

const PRESS_LOGOS = [
  'ProductHunt',
  'TechCrunch',
  'Lifehacker',
];

// Eased count-up animation hook
function useCountUp(target: number, duration: number = 2000): [number, React.RefObject<HTMLDivElement | null>] {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smoother deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * easeOut;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, hasStarted]);

  return [count, ref];
}

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : star - 0.5 <= rating
              ? 'text-amber-400 fill-amber-400/50'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

// Animated Stat Component
function AnimatedStat({ stat }: { stat: TrustStat }) {
  const [count, ref] = useCountUp(stat.numericValue, 1800);

  const formatValue = () => {
    const hasDecimal = stat.numericValue % 1 !== 0;
    const formatted = hasDecimal ? count.toFixed(1) : Math.floor(count).toString();
    return `${stat.prefix || ''}${formatted}${stat.suffix}`;
  };

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tabular-nums">
        {formatValue()}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
    </div>
  );
}

// Press Logo Placeholder
function PressLogo({ name }: { name: string }) {
  return (
    <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
      {name}
    </span>
  );
}

export function TrustStrip() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-r from-[#F0FDF4] via-[#EFFFE3] to-[#F0FDF4] py-8 md:py-10 border-y border-[#D9F99D]/30 overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div
          className={`
            transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* Main Stats Row */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
            {/* App Store Rating */}
            <div className="flex items-center gap-4 lg:pr-10 lg:border-r border-[#D9F99D]/50">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">4.9</span>
                  <StarRating rating={4.9} />
                </div>
                <div className="text-xs text-gray-500">App Store Rating</div>
              </div>
            </div>

            {/* Separator - hidden on mobile */}
            <div className="hidden lg:block w-px h-12 bg-[#D9F99D]/50 mx-10" />

            {/* Core Stats */}
            <div className="flex items-center gap-8 md:gap-12">
              {TRUST_STATS.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-8 md:gap-12">
                  <AnimatedStat stat={stat} />
                  {index < TRUST_STATS.length - 1 && (
                    <div className="hidden md:block w-px h-10 bg-[#D9F99D]/50" />
                  )}
                </div>
              ))}
            </div>

            {/* Separator - hidden on mobile */}
            <div className="hidden lg:block w-px h-12 bg-[#D9F99D]/50 mx-10" />

            {/* Featured In */}
            <div className="flex items-center gap-4 lg:pl-10 lg:border-l border-[#D9F99D]/50">
              <div className="text-center lg:text-left">
                <div className="text-xs text-gray-500 mb-2">Featured in</div>
                <div className="flex items-center gap-4">
                  {PRESS_LOGOS.map((logo) => (
                    <PressLogo key={logo} name={logo} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Micro-testimonial */}
          <div className="mt-6 md:mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2.5 border border-[#D9F99D]/30 shadow-sm">
              <Quote className="w-4 h-4 text-[#84CC16] flex-shrink-0" />
              <p className="text-sm text-gray-600">
                <span className="font-medium text-[#1A1A1A]">&ldquo;Finally, no more dinner debates!&rdquo;</span>
                <span className="hidden sm:inline text-gray-400 ml-2">— Sarah M., San Francisco</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
