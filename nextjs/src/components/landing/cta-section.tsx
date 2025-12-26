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
      {/* Gradient mesh blobs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 blur-[150px]"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 60%)' }}
        />
      </div>

      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Corner decorations - hunter green accents with pulse */}
      <div className="absolute top-4 left-4 text-[#1a4d2e]/30 animate-pulse-slow">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute bottom-4 right-4 text-[#1a4d2e]/30 rotate-180 animate-pulse-slow animation-delay-2000">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute top-4 right-4 text-[#F97316]/20 rotate-90 animate-pulse-slow animation-delay-1000">
        <PixelDecoration variant="corner" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Pixel chef with float animation and glow */}
          <div className="mb-8 flex justify-center">
            <div className="relative animate-float">
              <div className="absolute inset-0 blur-2xl bg-[#F97316]/25 rounded-full scale-150" />
              <div className="relative">
                <ChefPixel size={100} />
              </div>
            </div>
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

          {/* CTA Button with glow */}
          <div className="mb-6">
            <Link href="/signup">
              <button
                type="button"
                className="
                  group relative overflow-hidden mx-auto
                  px-10 py-4 text-lg font-bold
                  bg-[#F97316] text-white
                  border-2 border-[#F97316]
                  shadow-[0_0_40px_rgba(249,115,22,0.4)]
                  hover:shadow-[0_0_60px_rgba(249,115,22,0.6)]
                  hover:scale-105
                  active:scale-[0.98]
                  transition-all duration-300 ease-out
                  flex items-center gap-2
                "
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">Start Planning Free</span>
                <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
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
