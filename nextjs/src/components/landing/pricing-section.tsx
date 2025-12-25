'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// PRICING SECTION
// 3-tier pricing with pixel art brutalist styling
// ═══════════════════════════════════════════════════════════════════════════

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out meal planning',
    features: [
      'Up to 10 saved recipes',
      'Basic meal calendar',
      'Shopping list generation',
      'Recipe import from URLs',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$7',
    period: 'per month',
    description: 'For serious home cooks',
    features: [
      'Unlimited recipes',
      'Advanced meal planning',
      'Smart shopping lists',
      'Nutrition tracking',
      'Recipe scaling',
      'Priority support',
      'Export & backup',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Premium',
    price: '$12',
    period: 'per month',
    description: 'For meal prep enthusiasts',
    features: [
      'Everything in Pro',
      'Family sharing (5 users)',
      'Advanced analytics',
      'Custom categories',
      'API access',
      'White-glove onboarding',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
  },
];

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={cn(
        'relative p-6 transition-all duration-200 rounded-lg border-3 hover:-translate-y-1',
        tier.highlighted
          ? 'bg-[#1a1a1a] border-[#F97316] shadow-[8px_8px_0_#F97316] md:scale-105 z-10'
          : 'bg-[#1a1a1a] border-[#333] shadow-[8px_8px_0_#000]'
      )}
    >
      {/* Badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#F97316] text-white font-mono font-bold px-3 py-1 text-xs whitespace-nowrap border-2 border-[#111]">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="font-mono text-xl font-bold text-white mb-2">
          {tier.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-mono text-4xl font-bold text-white">
            {tier.price}
          </span>
          <span className="text-sm text-[#888]">/{tier.period}</span>
        </div>
        <p className="text-sm text-[#888] mt-2">{tier.description}</p>
      </div>

      {/* Divider */}
      <div className="h-[2px] bg-[#333] mb-6" />

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span
              className={cn(
                'mt-0.5 w-4 h-4 flex items-center justify-center flex-shrink-0',
                tier.highlighted ? 'bg-[#F97316]' : 'bg-[#444]'
              )}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </span>
            <span className="text-[#ccc]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        type="button"
        className={cn(
          'w-full font-mono font-bold py-3 px-4 border-3 transition-all',
          tier.highlighted
            ? 'bg-[#F97316] text-white border-[#111] shadow-[4px_4px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#111]'
            : 'bg-[#222] text-white border-[#444] shadow-[4px_4px_0_#000] hover:bg-[#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]'
        )}
      >
        {tier.cta}
      </button>
    </div>
  );
}

export function PricingSection() {
  return (
    <section className="relative py-24 bg-[#111111] overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block badge-pixel border-[#F97316] text-[#F97316] mb-4">
            Pricing
          </div>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#FDFBF7] mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-[#888888] max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="text-center mt-16">
          <p className="text-[#888888] text-sm">
            Questions?{' '}
            <a href="#faq" className="text-[#F97316] hover:underline transition-colors">
              Check our FAQ
            </a>{' '}
            or{' '}
            <a href="mailto:hello@mealprep.app" className="text-[#F97316] hover:underline transition-colors">
              contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
