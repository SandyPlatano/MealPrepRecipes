import { StatsSidebar } from "@/components/stats/stats-sidebar";
import { StatsMobileNav } from "@/components/stats/stats-mobile-nav";

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Desktop sidebar */}
      <StatsSidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <StatsMobileNav />
    </div>
  );
}
