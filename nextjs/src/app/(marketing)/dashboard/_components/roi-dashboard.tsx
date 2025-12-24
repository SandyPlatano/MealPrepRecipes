import { SectionWrapper, SectionHeader } from "@/components/landing/shared";
import { CircularProgress } from "@/components/landing/shared/circular-progress";
import { MiniStatCard } from "@/components/landing/shared/stat-card";
import { ROI_STATS, ROI_HIGHLIGHT_STATS, ROI_STATUS_CARDS } from "../_data/landing-data";

export function RoiDashboard() {
  return (
    <SectionWrapper>
      <SectionHeader
        title="See your ROI in real-time"
        description="Track recovery rates, time savings, and operational improvements."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Circular progress visualizations */}
        <div className="flex flex-col items-center justify-center gap-8 rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {ROI_STATS.map((stat) => (
              <CircularProgress
                key={stat.label}
                value={stat.value}
                max={stat.max}
                size="lg"
                color={stat.color}
                displayValue={stat.displayValue}
                label={stat.label}
              />
            ))}
          </div>
        </div>

        {/* Right: Stats and status cards */}
        <div className="flex flex-col gap-6">
          {/* Highlight stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            {ROI_HIGHLIGHT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="text-4xl font-mono font-bold md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status summary cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {ROI_STATUS_CARDS.map((card) => (
              <MiniStatCard
                key={card.label}
                value={card.value}
                label={card.label}
                color={card.color}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
