'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Users, Home, Check } from 'lucide-react';
import { StarSmall } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// WHO IT'S FOR - Premium Audience Cards
// Lucide icons, pain point taglines, feature bullets, premium hover
// ═══════════════════════════════════════════════════════════════════════════

interface AudienceCard {
  icon: React.ElementType;
  title: string;
  painPoint: string;
  quote: string;
  features: string[];
  gradient: string;
  iconBg: string;
}

const AUDIENCES: AudienceCard[] = [
  {
    icon: Heart,
    title: 'Couples',
    painPoint: '"Who\'s cooking tonight?"',
    quote: 'End the nightly dinner debate forever.',
    features: [
      'Assign who cooks each night',
      'Sync shopping lists together',
      'See what\'s planned at a glance',
    ],
    gradient: 'from-pink-50 via-white to-white',
    iconBg: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Users,
    title: 'Families',
    painPoint: '"What do the kids want?"',
    quote: 'Plan kid-friendly meals they\'ll actually eat.',
    features: [
      'Scale recipes for any family size',
      'Track favorites everyone loves',
      'Prep once, eat all week',
    ],
    gradient: 'from-blue-50 via-white to-white',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Home,
    title: 'Roommates',
    painPoint: '"Split the cooking fairly"',
    quote: 'Coordinate meals without the drama.',
    features: [
      'Fair rotation schedule',
      'Separate or shared lists',
      'No more wasted food',
    ],
    gradient: 'from-purple-50 via-white to-white',
    iconBg: 'bg-purple-100 text-purple-600',
  },
];

function AudienceCardComponent({
  card,
  index,
  isVisible
}: {
  card: AudienceCard;
  index: number;
  isVisible: boolean;
}) {
  const Icon = card.icon;

  return (
    <div
      className={`
        group relative bg-gradient-to-br ${card.gradient}
        rounded-2xl border border-gray-200/60 p-6 md:p-8
        transition-all duration-500 ease-out
        hover:shadow-lg hover:-translate-y-2 hover:border-[#D9F99D]/50
        hover:shadow-[0_8px_30px_rgba(217,249,157,0.15)]
        ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
        }
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Icon */}
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center mb-5
        ${card.iconBg}
        transition-transform duration-300 group-hover:scale-110
      `}>
        <Icon className="w-7 h-7" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
        {card.title}
      </h3>

      {/* Pain Point */}
      <p className="text-gray-500 italic mb-4 text-sm">
        {card.painPoint}
      </p>

      {/* Quote/Value Prop */}
      <p className="text-gray-700 font-medium mb-6">
        {card.quote}
      </p>

      {/* Features */}
      <ul className="space-y-3">
        {card.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-[#D9F99D]/50 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-[#1A1A1A]" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D9F99D]/0 to-[#D9F99D]/0 group-hover:from-[#D9F99D]/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
    </div>
  );
}

export function WhoItsFor() {
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
    <section ref={sectionRef} className="py-20 md:py-28 bg-[#FFFCF6]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-16">
          <span className={`
            inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200
            bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
            transition-all duration-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <StarSmall size={12} className="text-[#84CC16]" />
            Perfect For Your Household
          </span>
          <h2 className={`
            text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4
            transition-all duration-700 delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Built for how you actually live
          </h2>
          <p className={`
            text-gray-600 text-lg max-w-2xl mx-auto
            transition-all duration-700 delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Whether you&apos;re cooking for two or feeding a crowd —
            save money and eat better every week.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {AUDIENCES.map((card, index) => (
            <AudienceCardComponent
              key={card.title}
              card={card}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
