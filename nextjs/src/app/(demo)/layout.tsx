import Link from "next/link";
import { BrandLogoCompact } from "@/components/brand/logo";
import { DemoProvider } from "@/lib/demo/demo-context";
import { DemoBanner } from "@/components/demo/demo-banner";
import { DemoNav } from "@/components/demo/demo-nav";
import { DemoFloatingCTA } from "@/components/demo/demo-floating-cta";
import { ScrollHeader } from "@/components/navigation/scroll-header";

export const metadata = {
  title: "Interactive Demo | Babe, What's for Dinner?",
  description: "Try the full app experience with sample data. No signup required.",
};

// Navigation items for demo
const navItems = [
  { href: "/demo", iconKey: "plan" as const, label: "Plan" },
  { href: "/demo/shop", iconKey: "shop" as const, label: "List" },
  { href: "/demo/recipes", iconKey: "recipes" as const, label: "Recipes" },
  { href: "/demo/nutrition", iconKey: "nutrition" as const, label: "Nutrition" },
];

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Demo Banner */}
        <DemoBanner />

        {/* Header with scroll detection */}
        <ScrollHeader>
          <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <Link href="/demo" className="hover:opacity-80 transition-opacity flex-shrink-0">
              <BrandLogoCompact />
            </Link>

            <div className="flex items-center gap-3">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3">
                <DemoNav items={navItems} variant="desktop" />
              </div>

              {/* Signup CTA */}
              <Link
                href="/signup"
                className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </ScrollHeader>

        {/* Main content with page transition */}
        <main className="flex-1 container mx-auto w-full px-4 py-8 pb-24 md:pb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <DemoNav items={navItems} variant="mobile" />
        </div>

        {/* Floating CTA - appears after 2 minutes */}
        <DemoFloatingCTA delaySeconds={90} />
      </div>
    </DemoProvider>
  );
}
