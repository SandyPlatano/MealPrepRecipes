'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Calendar, ShoppingCart, ChefHat, ArrowRight, Check, GripVertical, Clock } from 'lucide-react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES TIMELINE - Warm & Cozy Design System (Pass 3 Micro Polish)
// Alternating layout with numbered timeline, focus states, smooth animations
// ═══════════════════════════════════════════════════════════════════════════

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
    <section id="features" className="py-24 bg-[#FFFCF6]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="bg-white border border-gray-200 text-[#1A1A1A] text-xs font-semibold px-4 py-2 rounded-full inline-block mb-4 shadow-sm">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4">
            From URL to table in 4 steps
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-lg">
            See exactly how easy meal planning becomes. No signup required to explore.
          </p>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto space-y-24">
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
        grid lg:grid-cols-2 gap-10 lg:gap-14 items-center
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Accent Card Side */}
      <div className={`${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
        <div
          className={`
            ${ACCENT_COLORS[feature.accentColor]}
            rounded-2xl p-6 relative overflow-hidden
            transition-transform duration-300 hover:-translate-y-1
          `}
        >
          <FeatureDemoCard featureNumber={feature.number} />
        </div>
      </div>

      {/* Content Side */}
      <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
        {/* Timeline number */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-400">{feature.number}</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Title */}
        <h3 className="font-display text-xl md:text-2xl font-bold text-[#1A1A1A] mb-3">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-5 leading-relaxed text-sm">
          {feature.description}
        </p>

        {/* Details list */}
        <ul className="space-y-2.5 mb-6">
          {feature.details.map((detail) => (
            <li key={detail} className="flex items-center gap-2.5 text-gray-600 text-sm">
              <span className="w-4 h-4 bg-[#D9F99D] rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-[#1A1A1A]" strokeWidth={3} />
              </span>
              {detail}
            </li>
          ))}
        </ul>

        {/* CTA - text link style with focus state */}
        <Link
          href="/signup"
          className="text-[#1A1A1A] font-medium text-sm inline-flex items-center gap-1.5 group hover:gap-2.5 transition-all duration-150 rounded-md px-1 -ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2"
        >
          Try it free
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
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

// Feature 01: Import Demo
function ImportDemo() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <Download className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">Paste any URL</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="text-[10px] text-gray-400 mb-1">Recipe URL</div>
        <div className="text-xs text-gray-600 truncate">https://seriouseats.com/perfect-beef-stew...</div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D9F99D] rounded-full flex items-center justify-center">
            <Check className="w-2 h-2 text-[#1A1A1A]" />
          </div>
          <span className="text-[10px] text-gray-500">Ingredients extracted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D9F99D] rounded-full flex items-center justify-center">
            <Check className="w-2 h-2 text-[#1A1A1A]" />
          </div>
          <span className="text-[10px] text-gray-500">Steps formatted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D9F99D] rounded-full flex items-center justify-center">
            <Check className="w-2 h-2 text-[#1A1A1A]" />
          </div>
          <span className="text-[10px] text-gray-500">Nutrition added</span>
        </div>
      </div>
    </div>
  );
}

// Feature 02: Planner Demo
function PlannerDemo() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">This Week</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {days.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-[9px] text-gray-400 mb-1">{day}</div>
            <div className={`h-12 rounded-md flex items-center justify-center ${i === 2 ? 'bg-[#EDE9FE]' : 'bg-gray-50'}`}>
              {i === 2 && <GripVertical className="w-3 h-3 text-gray-400" />}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-gray-400">Drag recipes to plan</span>
        <span className="text-[#1A1A1A] font-medium">3/5 planned</span>
      </div>
    </div>
  );
}

// Feature 03: Shopping Demo
function ShoppingDemo() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">Shopping List</span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'Chicken breast', qty: '2 lbs', checked: true },
          { name: 'Olive oil', qty: '1 bottle', checked: true },
          { name: 'Garlic', qty: '1 head', checked: false },
          { name: 'Lemon', qty: '3', checked: false },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded border ${item.checked ? 'bg-[#D9F99D] border-[#D9F99D]' : 'border-gray-300'} flex items-center justify-center`}>
              {item.checked && <Check className="w-2 h-2 text-[#1A1A1A]" />}
            </div>
            <span className={`text-[10px] flex-1 ${item.checked ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{item.name}</span>
            <span className="text-[10px] text-gray-400">{item.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature 04: Cooking Demo
function CookingDemo() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Step 2 of 6</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="w-3 h-3" />
          <span>5:00</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          Heat oil in a large pan over medium-high heat. Season chicken with salt and pepper.
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button type="button" className="text-[10px] text-gray-400">Previous</button>
        <button type="button" className="text-[10px] bg-[#1A1A1A] text-white px-3 py-1 rounded-full">Next Step</button>
      </div>
    </div>
  );
}
