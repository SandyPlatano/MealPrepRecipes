import { PROCESS_STEPS } from "../_data/landing-data";
import { cn } from "@/lib/utils";

export function ProcessSection() {
  return (
    <section id="process" className="bg-dark py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-mono font-bold tracking-tight text-cream md:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-cream/60">
            Get started in minutes, not months. Our platform integrates seamlessly with your existing systems.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {PROCESS_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative text-center">
                {/* Step number */}
                <div className="mb-4 inline-flex items-center justify-center">
                  <div
                    className={cn(
                      "flex size-16 items-center justify-center",
                      "rounded-xl border-2 border-cream/30",
                      "bg-cream/5 text-cream",
                      "transition-all duration-200",
                      "hover:border-primary hover:bg-primary/10"
                    )}
                  >
                    <Icon className="size-7" />
                  </div>
                </div>

                {/* Step indicator */}
                <div className="mb-3 font-mono text-sm font-medium text-primary">
                  Step {step.step}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-mono font-semibold text-cream">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-cream/60">{step.description}</p>

                {/* Connector line (hidden on mobile and last item) */}
                {step.step < PROCESS_STEPS.length && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-12 -translate-x-1/2 bg-cream/20 md:block lg:w-16" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
