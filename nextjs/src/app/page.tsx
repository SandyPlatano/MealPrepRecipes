import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesTimeline } from '@/components/landing/features-timeline';
import { WeeklyStruggle } from '@/components/landing/weekly-struggle';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';
import { Navigation } from '@/components/landing/navigation';
import { StickyCTA } from '@/components/landing/sticky-cta';
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

      {/* Features Timeline - Alternating colored cards */}
      <div id="features">
        <FeaturesTimeline />
      </div>

      {/* Weekly Struggle - Story narrative */}
      <WeeklyStruggle />

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

      {/* Sticky CTA - Floating bar on scroll */}
      <StickyCTA />
    </main>
  );
}
