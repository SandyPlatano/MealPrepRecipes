'use client';

import { cn } from '@/lib/utils';
import { PixelDecoration } from './pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION
// Simple 3-card testimonial layout with pixel art styling
// ═══════════════════════════════════════════════════════════════════════════

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  highlighted?: boolean;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'We used to spend 30 minutes every night figuring out dinner. Now we plan Sunday, shop once, and just... cook.',
    author: 'Marcus & Elena T.',
    role: 'Working couple, Austin TX',
  },
  {
    quote:
      'The AI import is magic. I screenshot a TikTok recipe and it\'s in my collection in seconds. Game changer.',
    author: 'Priya S.',
    role: 'Home cook & content creator',
    highlighted: true,
  },
  {
    quote:
      'Finally convinced my husband to meal prep. The shopping list feature alone saved our marriage. (Kidding. Mostly.)',
    author: 'Rachel M.',
    role: 'Mom of 2, Denver CO',
  },
];

function TestimonialCard({
  quote,
  author,
  role,
  highlighted,
  className,
}: Testimonial & { className?: string }) {
  return (
    <div
      className={cn(
        'relative p-6 md:p-8 transition-all duration-200',
        highlighted
          ? 'card-pixel card-pixel-highlight'
          : 'card-pixel',
        className
      )}
    >
      {/* Quote icon */}
      <div className="absolute -top-3 -left-2 text-3xl font-mono text-[#F97316]">&ldquo;</div>

      {/* Quote text */}
      <blockquote className="text-[#111111] text-base md:text-lg leading-relaxed mb-6 pt-4">
        {quote}
      </blockquote>

      {/* Divider */}
      <div className="divider-pixel mb-4" />

      {/* Attribution */}
      <div>
        <p className="font-mono font-bold text-[#111111]">
          {author}
        </p>
        <p className="text-sm text-[#666666] mt-1">{role}</p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-[#FDFBF7] border-t-4 border-b-4 border-[#111111] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-4 right-4 text-[#111111]/5">
        <PixelDecoration variant="dots" />
      </div>
      <div className="absolute bottom-4 left-4 text-[#111111]/5 rotate-180">
        <PixelDecoration variant="dots" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block badge-pixel-orange mb-4">
            Testimonials
          </div>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#111111] mb-4">
            Real Kitchens, Real Results
          </h2>
          <p className="text-[#666666] max-w-md mx-auto">
            Join thousands of home cooks who simplified their meal planning.
          </p>
        </div>

        {/* Testimonial cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
              className={cn(
                index === 1 && 'md:-translate-y-4' // Stagger middle card
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
