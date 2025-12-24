import { SectionWrapper, SectionHeader } from "@/components/landing/shared";
import { INTEGRATIONS } from "../_data/landing-data";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

const ringRadii = {
  1: 100,
  2: 160,
  3: 220,
};

export function IntegrationsSection() {
  return (
    <SectionWrapper id="integrations">
      <SectionHeader
        title="Integrates with your stack"
        description="Connect with your existing tools and data sources in minutes."
      />

      {/* Concentric circles container */}
      <div className="relative mx-auto h-[500px] w-full max-w-[500px]">
        {/* Center logo */}
        <div className="absolute left-1/2 top-1/2 z-10 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <Zap className="size-10 text-primary-foreground" />
        </div>

        {/* Concentric circles (SVG) */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 500 500"
        >
          {/* Ring 1 */}
          <circle
            cx="250"
            cy="250"
            r={ringRadii[1]}
            fill="none"
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Ring 2 */}
          <circle
            cx="250"
            cy="250"
            r={ringRadii[2]}
            fill="none"
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Ring 3 */}
          <circle
            cx="250"
            cy="250"
            r={ringRadii[3]}
            fill="none"
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Integration logos */}
        {INTEGRATIONS.map((integration) => {
          const radius = ringRadii[integration.ring];
          const angleRad = (integration.angle * Math.PI) / 180;
          const x = 250 + radius * Math.cos(angleRad);
          const y = 250 + radius * Math.sin(angleRad);

          return (
            <div
              key={integration.name}
              className={cn(
                "absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
                "rounded-xl border border-border bg-card",
                "text-xs font-mono font-bold text-muted-foreground",
                "shadow-sm transition-all duration-200",
                "hover:scale-110 hover:border-primary hover:shadow-md hover:text-foreground"
              )}
              style={{
                left: `${(x / 500) * 100}%`,
                top: `${(y / 500) * 100}%`,
              }}
              title={integration.name}
            >
              {integration.initials}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
