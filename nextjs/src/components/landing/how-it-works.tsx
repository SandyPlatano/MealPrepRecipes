'use client';

import { PixelStep, PixelDataFlow, PixelDecoration } from './pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// HOW IT WORKS SECTION
// 4-step process with pixel art icons showing the meal prep workflow
// ═══════════════════════════════════════════════════════════════════════════

const steps = [
  {
    number: 1,
    icon: 'import' as const,
    title: 'Import',
    description: 'Paste any recipe URL. AI extracts ingredients & steps instantly.',
  },
  {
    number: 2,
    icon: 'calendar' as const,
    title: 'Plan',
    description: 'Drag recipes to your weekly calendar. Build your meal plan.',
  },
  {
    number: 3,
    icon: 'cart' as const,
    title: 'Shop',
    description: 'Auto-generated shopping list. Organized by store aisle.',
  },
  {
    number: 4,
    icon: 'cook' as const,
    title: 'Cook',
    description: 'Step-by-step instructions. Timers and scaling built in.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 bg-[#FDFBF7] border-t-4 border-b-4 border-[#111111] overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-8 left-8 text-[#111111]/5">
        <PixelDecoration variant="dots" />
      </div>
      <div className="absolute bottom-8 right-8 text-[#111111]/5 rotate-180">
        <PixelDecoration variant="dots" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            How It Works
          </div>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#111111] mb-4">
            Dinner, Decoded
          </h2>
          <p className="text-[#666666] max-w-md mx-auto">
            From &ldquo;what should I eat?&rdquo; to &ldquo;dinner&apos;s ready&rdquo; in four simple steps.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 mb-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <PixelStep
                number={step.number}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />

              {/* Arrow connector (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-2 text-[#111111]">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <rect x="4" y="11" width="4" height="2" fill="currentColor" />
                    <rect x="10" y="11" width="4" height="2" fill="currentColor" />
                    <rect x="16" y="11" width="4" height="2" fill="currentColor" />
                    <rect x="18" y="9" width="2" height="2" fill="currentColor" />
                    <rect x="18" y="13" width="2" height="2" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data flow visualization */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-sm font-mono text-[#666666]">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#F97316]"></span>
              Recipe Data
            </span>
            <span>→</span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#111111]"></span>
              AI Processing
            </span>
            <span>→</span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#28a745]"></span>
              Ready to Cook
            </span>
          </div>
          <PixelDataFlow className="mt-4 w-full max-w-md mx-auto" />
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-[#666666] mb-4">
            No credit card required. Free plan includes 10 recipes.
          </p>
          <button type="button" className="btn-primary">
            Start Planning Free
          </button>
        </div>
      </div>
    </section>
  );
}
