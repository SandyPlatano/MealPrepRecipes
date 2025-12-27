import { HeroSection } from '@/components/landing/hero-section';
import { JourneySection } from '@/components/landing/journey-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FAQ } from '@/components/landing/faq';
import { CTASection } from '@/components/landing/cta-section';
import { Navigation } from '@/components/landing/navigation';
import { Footer } from '@/components/landing/footer';

// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// Peek Insights inspired design - light, refined, thin-line SaaS aesthetic
// ═══════════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFDF7]">
      {/* Navigation */}
      <Navigation />

      {/* Hero - Cream background */}
      <HeroSection />

      {/* Journey Section - Progressive user flow: Import → Plan → Shop → Cook */}
      <div id="features">
        <JourneySection />
      </div>

      {/* Pricing */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* FAQ */}
      <div id="faq">
        <FAQ />
      </div>

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
