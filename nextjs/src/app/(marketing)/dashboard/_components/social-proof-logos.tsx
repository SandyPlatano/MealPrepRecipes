import { SOCIAL_PROOF_LOGOS } from "../_data/landing-data";
import { cn } from "@/lib/utils";

export function SocialProofLogos() {
  return (
    <section className="border-b border-border bg-muted/50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Trusted by leading CPG brands worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {SOCIAL_PROOF_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className={cn(
                "flex h-10 w-20 items-center justify-center",
                "rounded-lg bg-muted",
                "text-lg font-mono font-bold text-muted-foreground",
                "opacity-60 grayscale transition-all duration-200",
                "hover:opacity-100 hover:grayscale-0",
                "dark:invert dark:opacity-40 dark:hover:invert-0 dark:hover:opacity-100"
              )}
              title={logo.name}
            >
              {logo.initials}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
