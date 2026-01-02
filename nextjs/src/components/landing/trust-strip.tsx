'use client';

import { Users, Clock, Leaf, Star } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TRUST STRIP - Warm & Cozy Design System (Pass 2 Polish)
// Compact, clean trust indicators
// ═══════════════════════════════════════════════════════════════════════════

const TRUST_STATS = [
  { icon: Users, value: '10K+', label: 'Home cooks' },
  { icon: Clock, value: '5hrs', label: 'Saved weekly' },
  { icon: Leaf, value: '47%', label: 'Less waste' },
  { icon: Star, value: '4.9', label: 'Rating' },
];

export function TrustStrip() {
  return (
    <section className="bg-[#EFFFE3] py-5 border-y border-[#D9F99D]/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Trusted by families
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {TRUST_STATS.map((stat) => (
              <TrustStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-600" />
      <span className="font-bold text-[#1A1A1A] text-sm">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
