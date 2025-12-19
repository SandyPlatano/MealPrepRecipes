"use client";

import {
  ImportIllustration,
  CookModeIllustration,
  ShoppingIllustration,
} from "./feature-illustrations";

interface Feature {
  title: string;
  description: string;
  illustration: React.ComponentType;
}

const features: Feature[] = [
  {
    title: "Import from anywhere",
    description: "Paste any recipe URL and our AI extracts ingredients & steps automatically",
    illustration: ImportIllustration,
  },
  {
    title: "Cook Mode",
    description: "Step-by-step instructions with built-in timers — hands-free cooking",
    illustration: CookModeIllustration,
  },
  {
    title: "One-tap shopping",
    description: "Your meal plan instantly becomes a categorized shopping list",
    illustration: ShoppingIllustration,
  },
];

export function MetricsSection() {
  return (
    <section className="py-16 md:py-24 bg-dark-lighter">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-cream mb-3">
              Core Features
            </h2>
            <p className="text-cream/60">The essentials that make meal planning effortless.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, illustration: Illustration }: Feature) {
  return (
    <div className="flex flex-col gap-4">
      <Illustration />
      <div className="text-center flex flex-col gap-2">
        <h3 className="text-lg md:text-xl font-mono font-semibold text-cream">{title}</h3>
        <p className="text-sm text-cream/60 max-w-xs mx-auto">{description}</p>
      </div>
    </div>
  );
}
