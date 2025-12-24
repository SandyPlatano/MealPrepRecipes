import {
  DashboardHeader,
  HeroSection,
  SocialProofLogos,
  FeatureGrid,
  ProcessSection,
  DashboardPreview,
  RetailerGrid,
  IntegrationsSection,
  TestimonialSection,
  RoiDashboard,
  PricingSection,
  CtaBanner,
  DashboardFooter,
} from "./_components";

export const metadata = {
  title: "RetailIQ - Turn Retail Data Into Actionable Intelligence",
  description:
    "The analytics platform trusted by leading CPG brands to track chargebacks, optimize inventory, and maximize retail revenue.",
};

export default function DashboardLandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1">
        <HeroSection />
        <SocialProofLogos />
        <FeatureGrid />
        <ProcessSection />
        <DashboardPreview />
        <RetailerGrid />
        <IntegrationsSection />
        <TestimonialSection />
        <RoiDashboard />
        <PricingSection />
        <CtaBanner />
      </main>
      <DashboardFooter />
    </div>
  );
}
