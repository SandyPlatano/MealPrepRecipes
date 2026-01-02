'use client';

import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// PRICING SECTION - Warm & Cozy Design System
// Clean, minimal cards with soft shadows and rounded corners
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

function PricingCard({ tier, delay = 0 }: { tier: PricingTier; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        relative p-8 transition-all duration-500 ease-out rounded-2xl
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${tier.highlighted
          ? 'bg-white border-2 border-[#D9F99D] shadow-lg md:scale-105 z-10'
          : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1'
        }
      `}
    >
      {/* Badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[#D9F99D] text-[#1A1A1A] font-semibold px-4 py-1.5 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
          {tier.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-[#1A1A1A]">
            {tier.price}
          </span>
          <span className="text-sm text-gray-500">/{tier.period}</span>
        </div>
        <p className="text-sm text-gray-500 mt-3">{tier.description}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-6" />

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span
              className={`
                mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                ${tier.highlighted ? 'bg-[#D9F99D]' : 'bg-gray-100'}
              `}
            >
              <Check
                className="w-3 h-3 text-[#1A1A1A]"
                strokeWidth={3}
              />
            </span>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link href="/signup" className="block">
        <button
          type="button"
          className={`
            w-full py-3 px-6 rounded-full font-semibold text-sm transition-all duration-200
            flex items-center justify-center gap-2 group
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2
            active:scale-[0.98]
            ${tier.highlighted
              ? 'bg-[#1A1A1A] text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
              : 'bg-white text-[#1A1A1A] border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }
          `}
        >
          {tier.cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </Link>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 bg-[#FFFCF6] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="bg-[#D9F99D] text-[#1A1A1A] text-sm font-semibold px-4 py-2 rounded-full mb-4 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 mt-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} delay={index * 100} />
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="text-center mt-16 relative">
          <p className="text-gray-500 text-sm">
            Questions?{' '}
            <a href="#faq" className="text-[#1A1A1A] font-medium hover:underline transition-colors">
              Check our FAQ
            </a>{' '}
            or{' '}
            <a href="mailto:hello@babewfd.com" className="text-[#1A1A1A] font-medium hover:underline transition-colors">
              contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
