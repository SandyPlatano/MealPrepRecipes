'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import Link from 'next/link';
import { StarSmall } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY STRUGGLE - Side-by-Side Comparison
// Without us vs With us, stress meter, strong CTA
// ═══════════════════════════════════════════════════════════════════════════

interface DayComparison {
  day: string;
  without: { emoji: string; text: string };
  withApp: { emoji: string; text: string };
}

const WEEK_COMPARISON: DayComparison[] = [
  {
    day: 'Mon',
    without: { emoji: '😩', text: '"What\'s for dinner?"' },
    withApp: { emoji: '😊', text: 'Plan already set' },
  },
  {
    day: 'Tue',
    without: { emoji: '😤', text: 'Forgot to thaw meat' },
    withApp: { emoji: '✓', text: 'Ingredients ready' },
  },
  {
    day: 'Wed',
    without: { emoji: '😫', text: 'Third takeout this week' },
    withApp: { emoji: '✓', text: 'Quick 20-min meal' },
  },
  {
    day: 'Thu',
    without: { emoji: '😠', text: '"We had this yesterday"' },
    withApp: { emoji: '✓', text: 'Variety built in' },
  },
  {
    day: 'Fri',
    without: { emoji: '😵', text: 'Kitchen is chaos' },
    withApp: { emoji: '🎉', text: 'Enjoying dinner!' },
  },
];

function StressMeter({ percentage, isVisible }: { percentage: number; isVisible: boolean }) {
  return (
    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`
          absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out
          ${percentage > 70 ? 'bg-red-400' : percentage > 40 ? 'bg-orange-400' : 'bg-[#84CC16]'}
        `}
        style={{ width: isVisible ? `${percentage}%` : '0%' }}
      />
    </div>
  );
}

export function WeeklyStruggle() {
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
    <section ref={sectionRef} className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className={`
            inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200
            bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
            transition-all duration-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Sound Familiar?
          </span>
          <h2 className={`
            text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4
            transition-all duration-700 delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            The weekly dinner struggle
          </h2>
          <p className={`
            text-gray-600 text-lg max-w-xl mx-auto
            transition-all duration-700 delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Every week, the same story plays out. Here&apos;s how it changes.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className={`
          max-w-4xl mx-auto
          transition-all duration-700 delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Without Us */}
            <div className="bg-gradient-to-br from-red-50/50 to-orange-50/50 rounded-2xl p-6 md:p-8 border border-red-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Without Us</h3>
                  <p className="text-sm text-gray-500">The nightly struggle</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {WEEK_COMPARISON.map((day, index) => (
                  <div
                    key={`without-${day.day}`}
                    className={`
                      flex items-center gap-3 p-3 bg-white/60 rounded-xl
                      transition-all duration-500
                      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                    `}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <span className="text-xs font-semibold text-gray-400 w-8">{day.day}</span>
                    <span className="text-xl">{day.without.emoji}</span>
                    <span className="text-sm text-gray-600 flex-1">{day.without.text}</span>
                  </div>
                ))}
              </div>

              {/* Stress Meter */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Stress level</span>
                  <span className="font-medium text-red-500">High 😵</span>
                </div>
                <StressMeter percentage={85} isVisible={isVisible} />
              </div>
            </div>

            {/* With Us */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-[#ECFCCB]/30 rounded-2xl p-6 md:p-8 border border-[#D9F99D]/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#D9F99D] flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#1A1A1A]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">With Us</h3>
                  <p className="text-sm text-gray-500">Peace of mind</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {WEEK_COMPARISON.map((day, index) => (
                  <div
                    key={`with-${day.day}`}
                    className={`
                      flex items-center gap-3 p-3 bg-white/60 rounded-xl
                      transition-all duration-500
                      ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                    `}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <span className="text-xs font-semibold text-gray-400 w-8">{day.day}</span>
                    <span className="text-xl">{day.withApp.emoji}</span>
                    <span className="text-sm text-gray-700 flex-1 font-medium">{day.withApp.text}</span>
                  </div>
                ))}
              </div>

              {/* Stress Meter */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Stress level</span>
                  <span className="font-medium text-[#84CC16]">Low 😌</span>
                </div>
                <StressMeter percentage={15} isVisible={isVisible} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className={`
            mt-10 text-center
            transition-all duration-700 delay-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-gray-800 transition-all duration-200 group shadow-lg hover:shadow-xl active:scale-[0.98]">
                <StarSmall size={16} className="text-[#D9F99D]" />
                End the chaos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
