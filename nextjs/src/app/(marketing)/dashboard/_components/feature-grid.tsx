import { SectionWrapper, SectionHeader } from "@/components/landing/shared";
import { FEATURES } from "../_data/landing-data";
import { cn } from "@/lib/utils";

export function FeatureGrid() {
  return (
    <SectionWrapper id="features" bgClassName="bg-muted/30">
      <SectionHeader
        title="Everything you need to win at retail"
        description="Powerful tools to track, analyze, and recover revenue from your retail operations."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={cn(
                "group relative rounded-2xl border border-border bg-card p-6 md:p-8",
                "transition-all duration-200",
                "hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              )}
            >
              {/* Icon container */}
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                <Icon className="size-6" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-lg font-mono font-semibold">{feature.title}</h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover accent */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
