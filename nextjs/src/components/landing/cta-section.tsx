'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ChefPixel, PixelDecoration } from './pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// CTA SECTION
// Final call-to-action with pixel chef and simple message
// ═══════════════════════════════════════════════════════════════════════════

export function CTASection() {
  return (
    <section className="py-24 bg-[#111111] relative overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Corner decorations - hunter green accents */}
      <div className="absolute top-4 left-4 text-[#1a4d2e]/30">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute bottom-4 right-4 text-[#1a4d2e]/30 rotate-180">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute top-4 right-4 text-[#F97316]/20 rotate-90">
        <PixelDecoration variant="corner" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Pixel chef (smaller) */}
          <div className="mb-8 flex justify-center">
            <ChefPixel size={100} />
          </div>

          {/* Headline */}
          <h2 className="font-mono text-3xl md:text-4xl lg:text-5xl font-bold text-[#FDFBF7] mb-6">
            Ready to answer
            <br />
            <span className="text-[#F97316]">&ldquo;What&apos;s for dinner?&rdquo;</span>
          </h2>

          {/* Subheadline */}
          <p className="text-[#FDFBF7]/60 text-lg mb-8">
            Join thousands of home cooks who plan smarter, shop faster, and cook better.
          </p>

          {/* CTA Button */}
          <div className="mb-6">
            <Link href="/signup">
              <button type="button" className="btn-pixel btn-pixel-primary text-lg px-10 py-4 flex items-center gap-2 mx-auto">
                Start Planning Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* No credit card note */}
          <p className="text-sm text-[#FDFBF7]/40">
            No credit card required. Free forever plan available.
          </p>

          {/* Pixel divider */}
          <div className="divider-brutal max-w-xs mx-auto mt-12" />
        </div>
      </div>
    </section>
  );
}
