import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { StarSmall } from '../shared/star-decoration';
import type { Feature } from '../features-data';

interface FeatureContentProps {
  feature: Feature;
  isReversed: boolean;
}

export function FeatureContent({ feature, isReversed }: FeatureContentProps) {
  return (
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
  );
}
