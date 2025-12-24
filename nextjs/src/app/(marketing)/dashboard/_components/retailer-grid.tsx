import { SectionWrapper, SectionHeader } from "@/components/landing/shared";
import { RETAILERS } from "../_data/landing-data";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const colorMap = {
  blue: "bg-bold-blue hover:bg-bold-blue/90",
  red: "bg-bold-red hover:bg-bold-red/90",
  yellow: "bg-bold-yellow hover:bg-bold-yellow/90",
  green: "bg-sage-500 hover:bg-sage-600",
};

export function RetailerGrid() {
  return (
    <SectionWrapper bgClassName="bg-muted/30">
      <SectionHeader
        title="Connect with major retailers"
        description="Seamlessly integrate with your retailer portals and start tracking in minutes."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RETAILERS.map((retailer) => (
          <div
            key={retailer.name}
            className={cn(
              "group relative flex flex-col items-center justify-center",
              "rounded-2xl p-8 md:p-12",
              "transition-all duration-200",
              "hover:-translate-y-1 hover:shadow-xl",
              colorMap[retailer.color]
            )}
          >
            {/* Logo placeholder */}
            <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-white/20 text-3xl font-mono font-bold text-white">
              {retailer.initials}
            </div>

            {/* Name */}
            <h3 className="text-xl font-mono font-semibold text-white">
              {retailer.name}
            </h3>

            {/* Link button */}
            <button type="button" className="mt-4 flex items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span>View Link</span>
              <ExternalLink className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
