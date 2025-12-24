import { SectionWrapper, SectionHeader } from "@/components/landing/shared";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS } from "../_data/landing-data";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" bgClassName="bg-muted/30">
      <SectionHeader
        title="Simple, transparent pricing"
        description="Start free, scale as you grow. No hidden fees."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6 md:p-8",
              "transition-all duration-200",
              tier.inverted
                ? "border-transparent bg-foreground text-background"
                : tier.highlighted
                  ? "border-primary bg-card shadow-lg"
                  : "border-border bg-card",
              tier.highlighted && !tier.inverted && "ring-2 ring-primary"
            )}
          >
            {/* Popular badge */}
            {tier.highlighted && !tier.inverted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-mono font-semibold">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-mono font-bold">{tier.price}</span>
                {tier.period && (
                  <span
                    className={cn(
                      "text-sm",
                      tier.inverted
                        ? "text-background/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {tier.period}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-2 text-sm",
                  tier.inverted ? "text-background/80" : "text-muted-foreground"
                )}
              >
                {tier.description}
              </p>
            </div>

            {/* Features */}
            <ul className="mb-8 flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      tier.inverted ? "text-sage-400" : "text-sage-500"
                    )}
                  />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              className={cn(
                "w-full",
                tier.inverted
                  ? "bg-background text-foreground hover:bg-background/90"
                  : tier.highlighted
                    ? ""
                    : "variant-outline"
              )}
              variant={tier.highlighted || tier.inverted ? "default" : "outline"}
            >
              {tier.ctaText}
            </Button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
