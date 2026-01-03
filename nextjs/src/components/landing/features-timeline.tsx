'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Calendar, ShoppingCart, ChefHat, ArrowRight, Check, GripVertical, Clock, Link2, Upload, Copy } from 'lucide-react';
import Link from 'next/link';
import { StarSmall, StarDecoration } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES TIMELINE - Premium & Polished Redesign
// Large step numbers, method pills, connecting flow, premium animations
// ═══════════════════════════════════════════════════════════════════════════

// Hook to detect prefers-reduced-motion
function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

interface Feature {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
  accentColor: 'yellow' | 'purple' | 'orange' | 'lime';
}

const FEATURES: Feature[] = [
  {
    number: '01',
    icon: Download,
    title: 'Plan your week',
    description: 'Pick meals in 5 minutes. Know exactly what you\'re making each night — no more staring at the fridge wondering what to cook.',
    details: [
      '5 minutes of planning saves hours',
      'Drag and drop recipes to any day',
      'Repeat weeks that worked great',
    ],
    accentColor: 'yellow',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Get your shopping list',
    description: 'Only what you need. No wandering the aisles. No impulse buys. Every ingredient combined and organized by store section.',
    details: [
      'Buy exactly what you\'ll cook',
      'Auto-combines duplicate items',
      'No more "forgot the garlic" runs',
    ],
    accentColor: 'purple',
  },
  {
    number: '03',
    icon: ShoppingCart,
    title: 'Actually eat what you bought',
    description: 'No more wilted lettuce. No more "I forgot we had that." When you have a plan, every dollar you spend on groceries gets used.',
    details: [
      'Nothing rots in the back of the fridge',
      'Save $100+ per month on wasted food',
      'Feel good about every grocery trip',
    ],
    accentColor: 'orange',
  },
  {
    number: '04',
    icon: ChefHat,
    title: 'Cook with confidence',
    description: 'Step-by-step instructions with built-in timers. Scale any recipe from 1 serving to 10+. No more recipe tab chaos.',
    details: [
      'Scale recipes for any household',
      'Built-in timers keep you on track',
      'All your recipes in one place',
    ],
    accentColor: 'lime',
  },
];

const ACCENT_COLORS = {
  yellow: 'bg-[#FFF6D8]',
  purple: 'bg-[#EDE9FE]',
  orange: 'bg-[#FFF0E6]',
  lime: 'bg-[#E4F8C9]',
};

export function FeaturesTimeline() {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  // Header visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.2 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Feature visibility
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = featureRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1 && entry.isIntersecting) {
          setVisibleFeatures((prev) => new Set(prev).add(index));
        }
      });
    }, observerOptions);

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="bg-[#FFFCF6] py-24 md:py-32 relative overflow-hidden"
    >
      {/* Decorative stars */}
      <StarDecoration
        size={24}
        className="absolute top-20 right-[8%] text-[#D9F99D]/30"
      />
      <StarSmall
        size={16}
        className="absolute bottom-32 left-[5%] text-[#1A1A1A]/10"
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-20 md:mb-24 text-center">
          <span className={`
            inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200 bg-white px-4
            py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
            transition-all duration-700
            ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <StarSmall size={12} className="text-[#84CC16]" />
            How Planning Saves You Money
          </span>
          <h2 className={`
            mb-4 font-display text-3xl font-bold text-[#1A1A1A]
            md:text-4xl lg:text-5xl
            transition-all duration-700 delay-100
            ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            5 minutes now. Savings all week.
          </h2>
          <p className={`
            mx-auto max-w-xl text-lg text-gray-600
            transition-all duration-700 delay-200
            ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            The average household throws away 338 lbs of food per year. A simple plan changes that.
          </p>
        </div>

        {/* Features with Connecting Line */}
        <div className="mx-auto max-w-6xl relative">
          {/* Vertical connecting line - hidden on mobile */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div
              className={`
                w-full h-full bg-gradient-to-b from-transparent via-[#D9F99D]/40 to-transparent
                transition-all duration-1000
                ${visibleFeatures.size > 0 ? 'opacity-100' : 'opacity-0'}
              `}
            />
          </div>

          <div className="space-y-20 md:space-y-28">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.number}
                ref={(el) => { featureRefs.current[index] = el; }}
                className="relative"
              >
                {/* Center step indicator - hidden on mobile */}
                <div className={`
                  hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10
                  w-14 h-14 rounded-full bg-white border-2 border-[#D9F99D]
                  items-center justify-center shadow-lg
                  transition-all duration-700
                  ${visibleFeatures.has(index)
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75'
                  }
                `}>
                  <span className="text-lg font-bold text-[#1A1A1A]">{feature.number}</span>
                </div>

                <FeatureRow
                  feature={feature}
                  isReversed={index % 2 === 1}
                  isVisible={visibleFeatures.has(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Method pills for Import feature
const IMPORT_METHODS = [
  { icon: Link2, label: 'Paste URL' },
  { icon: Upload, label: 'Upload Photo' },
  { icon: Copy, label: 'Copy Text' },
];

function FeatureRow({
  feature,
  isReversed,
  isVisible,
}: {
  feature: Feature;
  isReversed: boolean;
  isVisible: boolean;
}) {
  const isImportFeature = feature.number === '01';

  return (
    <div
      className={`
        grid items-center gap-10 transition-all duration-700 ease-out
        lg:grid-cols-2 lg:gap-20
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
    >
      {/* Accent Card Side */}
      <div className={`
        ${isReversed ? 'lg:order-2' : 'lg:order-1'}
      `}>
        <div
          className={`
            ${ACCENT_COLORS[feature.accentColor]}
            relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all
            duration-300 shadow-sm
            hover:-translate-y-1 hover:shadow-md
          `}
        >
          <FeatureDemoCard featureNumber={feature.number} />
        </div>
      </div>

      {/* Content Side */}
      <div className={`
        ${isReversed ? 'lg:order-1 lg:text-right' : 'lg:order-2'}
      `}>
        {/* Large Step Number - Mobile only (desktop shows center indicator) */}
        <div className={`
          lg:hidden mb-6 flex items-center gap-4
          ${isReversed ? 'flex-row-reverse' : ''}
        `}>
          <div className="w-12 h-12 rounded-full bg-white border-2 border-[#D9F99D] flex items-center justify-center shadow-md">
            <span className="text-lg font-bold text-[#1A1A1A]">{feature.number}</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-[#D9F99D]/50 to-transparent" />
        </div>

        {/* Title */}
        <h3 className="mb-3 font-display text-2xl md:text-3xl font-bold text-[#1A1A1A]">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="mb-5 text-base leading-relaxed text-gray-600">
          {feature.description}
        </p>

        {/* Method Pills - Only for Import feature */}
        {isImportFeature && (
          <div className={`
            flex flex-wrap gap-2 mb-6
            ${isReversed ? 'lg:justify-end' : ''}
          `}>
            {IMPORT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.label}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200 shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">{method.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Details list */}
        <ul className={`
          mb-6 space-y-3
          ${isReversed ? 'lg:space-y-3' : ''}
        `}>
          {feature.details.map((detail, index) => (
            <li
              key={detail}
              className={`
                flex items-center gap-3 text-sm text-gray-600
                ${isReversed ? 'lg:flex-row-reverse' : ''}
              `}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D9F99D]/50">
                <Check className="h-3 w-3 text-[#1A1A1A]" strokeWidth={3} />
              </span>
              {detail}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link href="/signup">
          <button className={`
            inline-flex items-center gap-2 bg-[#1A1A1A] text-white
            px-6 py-3 rounded-full font-semibold text-sm
            hover:bg-gray-800 transition-all duration-200 group
            shadow-md hover:shadow-lg active:scale-[0.98]
          `}>
            <StarSmall size={14} className="text-[#D9F99D]" />
            Try it free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
}

// Demo card content for each feature
function FeatureDemoCard({ featureNumber }: { featureNumber: string }) {
  switch (featureNumber) {
    case '01':
      return <ImportDemo />;
    case '02':
      return <PlannerDemo />;
    case '03':
      return <ShoppingDemo />;
    case '04':
      return <CookingDemo />;
    default:
      return null;
  }
}

// Feature 01: Import Demo - Animated typewriter + staggered checkmarks
function ImportDemo() {
  const reducedMotion = useReducedMotion();
  const fullUrl = 'https://seriouseats.com/perfect-beef-stew';
  const [typedLength, setTypedLength] = useState(0);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [phase, setPhase] = useState<'typing' | 'checking' | 'holding' | 'reset'>('typing');

  const checkItems = [
    'Ingredients extracted',
    'Steps formatted',
    'Nutrition added',
  ];

  // Track checked items count separately to avoid array reference in deps
  const checkedCountRef = useRef(0);
  checkedCountRef.current = checkedItems.length;

  useEffect(() => {
    if (reducedMotion) {
      // Show completed state for reduced motion
      setTypedLength(fullUrl.length);
      setCheckedItems([0, 1, 2]);
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'typing') {
      if (typedLength < fullUrl.length) {
        timeout = setTimeout(() => setTypedLength(prev => prev + 1), 50);
      } else {
        timeout = setTimeout(() => setPhase('checking'), 300);
      }
    } else if (phase === 'checking') {
      if (checkedCountRef.current < 3) {
        timeout = setTimeout(() => {
          setCheckedItems(prev => [...prev, prev.length]);
        }, 400);
      } else {
        timeout = setTimeout(() => setPhase('holding'), 1500);
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('reset'), 100);
    } else if (phase === 'reset') {
      setTypedLength(0);
      setCheckedItems([]);
      timeout = setTimeout(() => setPhase('typing'), 500);
    }

    return () => clearTimeout(timeout);
  }, [phase, typedLength, reducedMotion, fullUrl.length]);

  const displayUrl = fullUrl.slice(0, typedLength);
  const showCursor = phase === 'typing' && !reducedMotion;

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <Download className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">Paste any URL</span>
      </div>
      <div className="mb-3 rounded-lg bg-gray-50 p-3">
        <div className="mb-1 text-[10px] text-gray-400">Recipe URL</div>
        <div className="flex h-4 items-center truncate text-xs text-gray-600">
          {displayUrl}
          {showCursor && (
            <span className={`
              ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-gray-400
            `} />
          )}
        </div>
      </div>
      <div className="space-y-2">
        {checkItems.map((item, i) => {
          const isChecked = checkedItems.includes(i);
          return (
            <div key={item} className="flex items-center gap-2">
              <div
                className={`
                  flex h-3 w-3 items-center justify-center rounded-full
                  transition-all duration-200
                  ${isChecked ? 'scale-100 bg-[#D9F99D]' : `
                    scale-90 bg-gray-200
                  `}
                `}
              >
                {isChecked && (
                  <Check className={`
                    h-2 w-2 animate-in text-[#1A1A1A] duration-200 fade-in
                    zoom-in
                  `} />
                )}
              </div>
              <span className={`
                text-[10px] transition-colors duration-200
                ${isChecked ? `text-gray-600` : `text-gray-400`}
              `}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Feature 02: Planner Demo - Animated recipe card drop
function PlannerDemo() {
  const reducedMotion = useReducedMotion();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const [phase, setPhase] = useState<'waiting' | 'floating' | 'dropping' | 'landed' | 'reset'>('waiting');
  const [plannedCount, setPlannedCount] = useState(3);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('landed');
      setPlannedCount(4);
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'waiting') {
      timeout = setTimeout(() => setPhase('floating'), 800);
    } else if (phase === 'floating') {
      timeout = setTimeout(() => setPhase('dropping'), 1200);
    } else if (phase === 'dropping') {
      timeout = setTimeout(() => {
        setPhase('landed');
        setPlannedCount(4);
      }, 400);
    } else if (phase === 'landed') {
      timeout = setTimeout(() => setPhase('reset'), 2000);
    } else if (phase === 'reset') {
      setPlannedCount(3);
      timeout = setTimeout(() => setPhase('waiting'), 300);
    }

    return () => clearTimeout(timeout);
  }, [phase, reducedMotion]);

  const getFloatingCardStyle = () => {
    if (phase === 'waiting') return 'opacity-0 -translate-y-8 translate-x-0';
    if (phase === 'floating') return 'opacity-100 -translate-y-4 translate-x-0';
    if (phase === 'dropping') return 'opacity-100 translate-y-0 translate-x-0';
    return 'opacity-0 translate-y-0';
  };

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">This Week</span>
      </div>
      <div className="relative grid grid-cols-5 gap-1.5">
        {days.map((day, i) => {
          const isWednesday = i === 2;
          const showRecipeInSlot = isWednesday && (phase === 'landed' || (reducedMotion && plannedCount === 4));

          return (
            <div key={day} className="relative text-center">
              <div className="mb-1 text-[9px] text-gray-400">{day}</div>
              <div className={`
                flex h-12 items-center justify-center rounded-md
                transition-colors duration-200
                ${
                isWednesday ? 'bg-[#EDE9FE]' : 'bg-gray-50'
              }
              `}>
                {isWednesday && !showRecipeInSlot && (
                  <GripVertical className="h-3 w-3 text-gray-400" />
                )}
                {showRecipeInSlot && (
                  <div className={`
                    h-full w-full animate-in p-1 duration-200 fade-in zoom-in
                  `}>
                    <div className={`
                      flex h-full w-full items-center justify-center rounded
                      bg-[#D9F99D]
                    `}>
                      <span className="text-[7px] font-medium text-[#1A1A1A]">Stew</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating recipe card - only show during animation */}
              {isWednesday && !reducedMotion && phase !== 'landed' && phase !== 'reset' && (
                <div
                  className={`
                    pointer-events-none absolute top-0 right-0 left-0
                    transition-all duration-500 ease-out
                    ${getFloatingCardStyle()}
                  `}
                >
                  <div className={`
                    mx-auto mt-4 flex h-8 w-10 items-center justify-center
                    rounded border border-[#C5E888] bg-[#D9F99D] shadow-md
                  `}>
                    <span className="text-[7px] font-medium text-[#1A1A1A]">Stew</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-gray-400">Drag recipes to plan</span>
        <span className={`
          font-medium transition-all duration-200
          ${plannedCount === 4 ? `text-[#1A1A1A]` : `text-gray-600`}
        `}>
          {plannedCount}/5 planned
        </span>
      </div>
    </div>
  );
}

// Feature 03: Shopping Demo - Animated checkbox toggles
function ShoppingDemo() {
  const reducedMotion = useReducedMotion();
  const items = [
    { name: 'Chicken breast', qty: '2 lbs' },
    { name: 'Olive oil', qty: '1 bottle' },
    { name: 'Garlic', qty: '1 head' },
    { name: 'Lemon', qty: '3' },
  ];

  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set([0, 1]));
  const [phase, setPhase] = useState<'idle' | 'checking' | 'holding' | 'reset'>('idle');
  const [currentCheckIndex, setCurrentCheckIndex] = useState(2);

  useEffect(() => {
    if (reducedMotion) {
      setCheckedItems(new Set([0, 1, 2, 3]));
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'idle') {
      timeout = setTimeout(() => setPhase('checking'), 1000);
    } else if (phase === 'checking') {
      if (currentCheckIndex < items.length) {
        timeout = setTimeout(() => {
          setCheckedItems(prev => new Set([...prev, currentCheckIndex]));
          setCurrentCheckIndex(currentCheckIndex + 1);
        }, 600);
      } else {
        timeout = setTimeout(() => setPhase('holding'), 1500);
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('reset'), 100);
    } else if (phase === 'reset') {
      setCheckedItems(new Set([0, 1]));
      setCurrentCheckIndex(2);
      timeout = setTimeout(() => setPhase('idle'), 400);
    }

    return () => clearTimeout(timeout);
  }, [phase, currentCheckIndex, reducedMotion, items.length]);

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">Shopping List</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isChecked = checkedItems.has(i);
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className={`
                  flex h-3.5 w-3.5 items-center justify-center rounded border
                  transition-all duration-200
                  ${isChecked ? 'scale-100 border-[#D9F99D] bg-[#D9F99D]' : `
                    scale-95 border-gray-300
                  `}
                `}
              >
                {isChecked && (
                  <Check className="h-2 w-2 text-[#1A1A1A]" />
                )}
              </div>
              <span
                className={`
                  flex-1 text-[10px] transition-all duration-300
                  ${isChecked ? 'text-gray-400 line-through' : 'text-gray-600'}
                `}
              >
                {item.name}
              </span>
              <span className="text-[10px] text-gray-400">{item.qty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Feature 04: Cooking Demo - Animated timer + step transitions
function CookingDemo() {
  const reducedMotion = useReducedMotion();
  const steps = [
    'Heat oil in a large pan over medium-high heat. Season chicken with salt and pepper.',
    'Sear chicken for 3-4 minutes per side until golden brown. Remove and set aside.',
    'Add garlic and onions to the pan. Sauté until softened and fragrant.',
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(300); // 5:00 in seconds
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) return 300;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    // Step transitions
    const stepInterval = setInterval(() => {
      setButtonPulse(true);
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep(prev => (prev + 1) % steps.length);
          setTimer(300);
          setIsTransitioning(false);
          setButtonPulse(false);
        }, 300);
      }, 500);
    }, 4000);

    return () => clearInterval(stepInterval);
  }, [reducedMotion, steps.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className={`
          flex items-center gap-1 text-[10px] transition-colors duration-200
          ${
          timer < 60 ? 'text-orange-500' : 'text-gray-400'
        }
        `}>
          <Clock className="h-3 w-3" />
          <span className="tabular-nums">{formatTime(timer)}</span>
        </div>
      </div>
      <div className="mb-3 min-h-[50px] rounded-lg bg-gray-50 p-3">
        <p className={`
          text-xs leading-relaxed text-gray-600 transition-opacity duration-300
          ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }
        `}>
          {steps[currentStep]}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button type="button" className="text-[10px] text-gray-400">Previous</button>
        <button
          type="button"
          className={`
            rounded-full bg-[#1A1A1A] px-3 py-1 text-[10px] text-white
            transition-all duration-200
            ${
            buttonPulse ? 'scale-105 shadow-md' : 'scale-100'
          }
          `}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
