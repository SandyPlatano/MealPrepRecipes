'use client';

import { Check, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// PRICING SECTION - Neo-Brutalist/Retro Style
// Bold borders, hard shadows, and vibrant colors
// ═══════════════════════════════════════════════════════════════════════════

// Floating stat for social proof
function FloatingStat({
  value,
  label,
  position,
  delay = 0,
  rotation = -2,
}: {
  value: string;
  label: string;
  position: string;
  delay?: number;
  rotation?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        absolute ${position}
        bg-card border-2 border-black px-3 py-2 rounded-xl shadow-retro
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        hidden xl:block
        z-20
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-lg font-display font-bold text-foreground">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}

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
        'relative p-6 transition-all duration-300 rounded-xl',
        tier.highlighted
          ? 'border-2 border-black shadow-retro bg-secondary md:scale-105 z-10'
          : 'bg-card border-2 border-black shadow-retro hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px]'
      )}
    >
      {/* Badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white border-2 border-black font-bold px-4 py-1 text-xs rounded whitespace-nowrap">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          {tier.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-display text-4xl font-bold text-foreground">
            {tier.price}
          </span>
          <span className="text-sm text-muted-foreground">/{tier.period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-6" />

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span
              className={cn(
                'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black',
                tier.highlighted ? 'bg-primary' : 'bg-secondary'
              )}
            >
              <Check
                className={cn(
                  'w-3 h-3',
                  tier.highlighted ? 'text-white' : 'text-foreground'
                )}
                strokeWidth={3}
              />
            </span>
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link href="/signup">
        <button
          type="button"
          className={cn(
            'w-full',
            tier.highlighted ? 'btn-primary' : 'btn-ghost'
          )}
        >
          {tier.cta}
        </button>
      </Link>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 bg-background overflow-hidden">
      {/* Floating stat */}
      <FloatingStat
        value="93%"
        label="User satisfaction"
        position="top-32 left-16"
        delay={0}
        rotation={-3}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="bg-secondary border-2 border-black text-foreground text-xs font-bold px-3 py-1 rounded mb-4 inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="text-center mt-16 relative">
          <p className="text-muted-foreground text-sm">
            Questions?{' '}
            <a href="#faq" className="text-primary underline hover:text-tertiary transition-colors">
              Check our FAQ
            </a>{' '}
            or{' '}
            <a href="mailto:hello@mealprep.app" className="text-primary underline hover:text-tertiary transition-colors">
              contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
