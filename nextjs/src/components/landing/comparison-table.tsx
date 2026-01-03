'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, X, Minus, Crown, Info } from 'lucide-react';
import { StarSmall, StarDecoration } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON TABLE - Premium Feature Matrix
// Crown header, double-checks for unique features, price comparison row
// ═══════════════════════════════════════════════════════════════════════════

type FeatureSupport = 'yes' | 'no' | 'partial' | 'double'; // double = unique feature

interface Feature {
  name: string;
  tooltip?: string;
  babewfd: FeatureSupport;
  spreadsheets: FeatureSupport;
  otherApps: FeatureSupport;
  highlight?: boolean;
}

const FEATURES: Feature[] = [
  {
    name: 'AI recipe import from any URL',
    tooltip: 'Paste any recipe link and our AI extracts everything automatically',
    babewfd: 'double',
    spreadsheets: 'no',
    otherApps: 'partial',
    highlight: true,
  },
  {
    name: 'Auto-generated shopping lists',
    tooltip: 'Ingredients combine intelligently - no duplicates',
    babewfd: 'yes',
    spreadsheets: 'no',
    otherApps: 'yes',
  },
  {
    name: 'Scale any recipe (1 to 10+ servings)',
    tooltip: 'One click to adjust portions for any size group',
    babewfd: 'double',
    spreadsheets: 'no',
    otherApps: 'partial',
    highlight: true,
  },
  {
    name: 'Batch cooking mode',
    tooltip: 'Cook once on Sunday, eat homemade all week',
    babewfd: 'double',
    spreadsheets: 'no',
    otherApps: 'no',
    highlight: true,
  },
  {
    name: 'Drag & drop meal planning',
    babewfd: 'yes',
    spreadsheets: 'partial',
    otherApps: 'yes',
  },
  {
    name: 'Nutrition tracking',
    tooltip: 'See calories, macros, and nutrients for every meal',
    babewfd: 'yes',
    spreadsheets: 'no',
    otherApps: 'partial',
  },
  {
    name: 'Food waste reduction',
    tooltip: 'Smart tools to use what you buy before it spoils',
    babewfd: 'double',
    spreadsheets: 'no',
    otherApps: 'partial',
    highlight: true,
  },
  {
    name: 'Pantry management',
    babewfd: 'yes',
    spreadsheets: 'partial',
    otherApps: 'partial',
  },
  {
    name: 'Household sharing',
    babewfd: 'yes',
    spreadsheets: 'yes',
    otherApps: 'partial',
  },
  {
    name: 'Works offline',
    tooltip: 'Use your shopping list in the store without wifi',
    babewfd: 'yes',
    spreadsheets: 'partial',
    otherApps: 'partial',
  },
  {
    name: 'No ads or distractions',
    babewfd: 'yes',
    spreadsheets: 'yes',
    otherApps: 'no',
  },
];

// Price comparison row
const PRICING = {
  babewfd: 'Free to start',
  spreadsheets: 'Free',
  otherApps: '$5-15/mo',
};

function FeatureIcon({ support }: { support: FeatureSupport }) {
  switch (support) {
    case 'double':
      // Double checkmark for unique features
      return (
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-6 rounded-full bg-[#84CC16] flex items-center justify-center shadow-sm">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <div className="w-5 h-5 rounded-full bg-[#D9F99D] flex items-center justify-center -ml-2 shadow-sm">
            <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={3} />
          </div>
        </div>
      );
    case 'yes':
      return (
        <div className="w-6 h-6 rounded-full bg-[#D9F99D] flex items-center justify-center">
          <Check className="w-4 h-4 text-[#1A1A1A]" />
        </div>
      );
    case 'no':
      return (
        <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
          <X className="w-4 h-4 text-red-400" />
        </div>
      );
    case 'partial':
      return (
        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
          <Minus className="w-4 h-4 text-amber-500" />
        </div>
      );
  }
}

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1A1A1A] text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1A1A]" />
      </div>
    </div>
  );
}

export function ComparisonTable() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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
    <section ref={sectionRef} className="py-20 md:py-24 bg-[#FFFCF6] relative overflow-hidden">
      {/* Decorative stars */}
      <StarDecoration
        size={20}
        className="absolute top-16 left-[5%] text-[#D9F99D]/30"
      />
      <StarSmall
        size={14}
        className="absolute bottom-20 right-[10%] text-[#1A1A1A]/10"
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className={`
            inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200
            bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
            transition-all duration-500
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <StarSmall size={12} className="text-[#84CC16]" />
            Why We&apos;re Different
          </span>
          <h2 className={`
            text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4
            transition-all duration-500 delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Built to save you money
          </h2>
          <p className={`
            text-gray-600 text-lg max-w-2xl mx-auto
            transition-all duration-500 delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Stop wrestling with spreadsheets or apps that don&apos;t actually help you save.
          </p>
        </div>

        {/* Comparison Table */}
        <div className={`
          max-w-4xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden
          transition-all duration-700 delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          {/* Table Header with Crown */}
          <div className="grid grid-cols-4 gap-4 p-5 md:p-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
            <div className="text-sm font-medium text-gray-500">Feature</div>
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-1">
                <Crown className="w-5 h-5 text-[#84CC16]" />
                <div className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                  <StarSmall size={12} className="text-[#D9F99D]" />
                  babewfd
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 pt-6">Spreadsheets</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 pt-6">Other Apps</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-50">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.name}
                className={`
                  grid grid-cols-4 gap-4 p-4 md:px-6 md:py-4 items-center
                  transition-all duration-500 hover:bg-gray-50/50
                  ${feature.highlight ? 'bg-gradient-to-r from-[#F0FDF4] via-[#FAFFF8] to-white' : 'bg-white'}
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
                style={{ transitionDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${feature.highlight ? 'font-semibold text-[#1A1A1A]' : 'text-gray-700'}`}>
                    {feature.name}
                  </span>
                  {feature.tooltip && (
                    <Tooltip text={feature.tooltip}>
                      <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  )}
                </div>
                <div className="flex justify-center">
                  <FeatureIcon support={feature.babewfd} />
                </div>
                <div className="flex justify-center">
                  <FeatureIcon support={feature.spreadsheets} />
                </div>
                <div className="flex justify-center">
                  <FeatureIcon support={feature.otherApps} />
                </div>
              </div>
            ))}

            {/* Price Comparison Row */}
            <div className="grid grid-cols-4 gap-4 p-4 md:px-6 md:py-5 items-center bg-gradient-to-r from-[#D9F99D]/20 to-[#D9F99D]/5 border-t border-[#D9F99D]/30">
              <div className="text-sm font-bold text-[#1A1A1A]">Price</div>
              <div className="text-center">
                <span className="text-sm font-bold text-[#1A1A1A] bg-[#D9F99D] px-3 py-1 rounded-full">
                  {PRICING.babewfd}
                </span>
              </div>
              <div className="text-center text-sm text-gray-600">{PRICING.spreadsheets}</div>
              <div className="text-center text-sm text-gray-600">{PRICING.otherApps}</div>
            </div>
          </div>

          {/* Table Footer Legend */}
          <div className="p-4 md:p-5 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <div className="w-4 h-4 rounded-full bg-[#84CC16] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-[#D9F99D] flex items-center justify-center -ml-1.5">
                    <Check className="w-2 h-2 text-[#1A1A1A]" strokeWidth={3} />
                  </div>
                </div>
                <span>Unique to us</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#D9F99D] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[#1A1A1A]" />
                </div>
                <span>Full support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center">
                  <Minus className="w-2.5 h-2.5 text-amber-500" />
                </div>
                <span>Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-red-400" />
                </div>
                <span>Not available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
