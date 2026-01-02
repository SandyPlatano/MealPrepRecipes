import { HeroSection } from '@/components/landing/hero-section';
import { TrustStrip } from '@/components/landing/trust-strip';
import { FeaturesTimeline } from '@/components/landing/features-timeline';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// Warm & Cozy design system - clean, inviting, family-friendly
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFCF6]">
      {/* Navigation */}
      <Navigation />

      {/* Hero - Warm off-white background */}
      <HeroSection />

      {/* Trust Strip - Lime green background */}
      <TrustStrip />

      {/* Features Timeline - Alternating colored cards */}
      <div id="features">
        <FeaturesTimeline />
      </div>

      {/* Pricing */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ */}
      <div id="faq">
        <FAQ />
      </div>

      {/* CTA - Lime green background */}
      <CTASection />

      {/* Footer - Dark background */}
      <Footer />
    </main>
  );
}
