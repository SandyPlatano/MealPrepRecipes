'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Calendar, ShoppingCart, ChefHat, ArrowRight, Check, GripVertical, Clock } from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES TIMELINE - Warm & Cozy Design System (Pass 4 Animated Demos)
// Alternating layout with looping animated demo cards
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
    title: 'Import recipes from anywhere',
    description: 'Paste any URL from your favorite food blog. Our AI extracts everything — ingredients, quantities, steps, and even nutrition info.',
    details: [
      'Works with any recipe website',
      'AI cleans up formatting automatically',
      'Extracts ingredients & quantities',
    ],
    accentColor: 'yellow',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Plan your week easily',
    description: 'Drag recipes onto your calendar. Assign who\'s cooking each night. Build a meal plan that actually works for your household.',
    details: [
      'Visual weekly calendar',
      'Assign cooks to each meal',
      'Repeat your favorite weeks',
    ],
    accentColor: 'purple',
  },
  {
    number: '03',
    icon: ShoppingCart,
    title: 'Shop smarter, not harder',
    description: 'Every ingredient from your planned meals, combined and organized by store aisle. Check items off as you shop.',
    details: [
      'Auto-combines duplicate items',
      'Organized by store section',
      'Works offline in the store',
    ],
    accentColor: 'orange',
  },
  {
    number: '04',
    icon: ChefHat,
    title: 'Cook with confidence',
    description: 'Follow along step-by-step with large, easy-to-read instructions. Timers built right in. Scale servings on the fly.',
    details: [
      'Step-by-step instructions',
      'Built-in timers',
      'Scale servings anytime',
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
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    <section id="features" className="bg-[#FFFCF6] py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <span className={`
            mb-4 inline-block rounded-full border border-gray-200 bg-white px-4
            py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
          `}>
            How It Works
          </span>
          <h2 className={`
            mb-4 font-display text-3xl font-bold text-[#1A1A1A]
            md:text-4xl
            lg:text-5xl
          `}>
            From URL to table in 4 steps
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-600">
            See exactly how easy meal planning becomes. No signup required to explore.
          </p>
        </div>

        {/* Features */}
        <div className="mx-auto max-w-6xl space-y-24">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.number}
              ref={(el) => { featureRefs.current[index] = el; }}
            >
              <FeatureRow
                feature={feature}
                isReversed={index % 2 === 1}
                isVisible={visibleFeatures.has(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  feature,
  isReversed,
  isVisible,
}: {
  feature: Feature;
  isReversed: boolean;
  isVisible: boolean;
}) {
  return (
    <div
      className={`
        grid items-center gap-10 transition-all duration-700 ease-out
        lg:grid-cols-2 lg:gap-14
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}
    >
      {/* Accent Card Side */}
      <div className={`
        ${isReversed ? 'lg:order-2' : 'lg:order-1'}
      `}>
        <div
          className={`
            ${ACCENT_COLORS[feature.accentColor]}
            relative overflow-hidden rounded-2xl p-6 transition-transform
            duration-300
            hover:-translate-y-1
          `}
        >
          <FeatureDemoCard featureNumber={feature.number} />
        </div>
      </div>

      {/* Content Side */}
      <div className={`
        ${isReversed ? 'lg:order-1' : 'lg:order-2'}
      `}>
        {/* Timeline number */}
        <div className="mb-5 flex items-center gap-4">
          <div className={`
            flex h-10 w-10 items-center justify-center rounded-full border
            border-gray-200 bg-white shadow-sm
          `}>
            <span className="text-xs font-bold text-gray-400">{feature.number}</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Title */}
        <h3 className={`
          mb-3 font-display text-xl font-bold text-[#1A1A1A]
          md:text-2xl
        `}>
          {feature.title}
        </h3>

        {/* Description */}
        <p className="mb-5 text-sm leading-relaxed text-gray-600">
          {feature.description}
        </p>

        {/* Details list */}
        <ul className="mb-6 space-y-2.5">
          {feature.details.map((detail) => (
            <li key={detail} className={`
              flex items-center gap-2.5 text-sm text-gray-600
            `}>
              <span className={`
                flex h-4 w-4 flex-shrink-0 items-center justify-center
                rounded-full bg-[#D9F99D]
              `}>
                <Check className="h-2.5 w-2.5 text-[#1A1A1A]" strokeWidth={3} />
              </span>
              {detail}
            </li>
          ))}
        </ul>

        {/* CTA - text link style with focus state */}
        <Link
          href="/signup"
          className={`
            group -ml-1 inline-flex items-center gap-1.5 rounded-md px-1 text-sm
            font-medium text-[#1A1A1A] transition-all duration-150
            hover:gap-2.5
            focus:outline-none
            focus-visible:ring-2 focus-visible:ring-[#D9F99D]
            focus-visible:ring-offset-2
          `}
        >
          Try it free
          <ArrowRight className={`
            h-3.5 w-3.5 transition-transform duration-150
            group-hover:translate-x-0.5
          `} />
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
