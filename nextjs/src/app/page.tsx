import { HeroSection } from '@/components/landing/hero-section';
import { JourneySection } from '@/components/landing/journey-section';
import { TerminalFeature } from '@/components/landing/terminal-feature';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// Clean, pixel-art themed landing with alternating dark/cream sections
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111]">
      {/* Navigation */}
      <Navigation />

      {/* Hero - Dark */}
      <HeroSection />

      {/* Journey Section - Progressive user flow: Import → Plan → Shop → Cook */}
      <div id="features">
        <JourneySection />
      </div>

      {/* Terminal Feature - Dark (additional detail for developers) */}
      <TerminalFeature />

      {/* Pricing - Dark */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ - Cream */}
      <div id="faq">
        <FAQ />
      </div>

      {/* CTA - Dark */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
