"use client";

import { Globe, Clock, ListChecks } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Import from anywhere",
    description: "Paste any recipe URL and our AI extracts ingredients & steps automatically",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Cook Mode",
    description: "Step-by-step instructions with built-in timers — hands-free cooking",
  },
  {
    icon: <ListChecks className="h-8 w-8" />,
    title: "One-tap shopping",
    description: "Your meal plan instantly becomes a categorized shopping list",
  },
];

export function MetricsSection() {
  return (
    <section className="py-16 md:py-20 bg-dark-lighter">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <FeatureHighlight key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlight({ icon, title, description }: Feature) {
  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center">
        <div className="p-3 rounded-xl bg-primary/20 text-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-cream">{title}</h3>
      <p className="text-sm text-cream/60 max-w-xs mx-auto">{description}</p>
    </div>
  );
}
