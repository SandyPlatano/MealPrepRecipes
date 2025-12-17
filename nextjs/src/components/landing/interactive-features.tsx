"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Timer, Activity, Package, Users, BookOpen, TrendingUp } from "lucide-react";
import {
  CookModeIllustration,
  NutritionIllustration,
  PantryIllustration,
  HouseholdIllustration,
} from "./feature-illustrations";

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  illustration?: React.ComponentType;
}

const features: Feature[] = [
  {
    id: "cook",
    icon: <Timer className="h-5 w-5" />,
    title: "Cook Mode",
    description: "Step-by-step instructions with built-in timers",
    illustration: CookModeIllustration,
  },
  {
    id: "nutrition",
    icon: <Activity className="h-5 w-5" />,
    title: "Nutrition",
    description: "Track macros, calories, and weekly trends",
    illustration: NutritionIllustration,
  },
  {
    id: "pantry",
    icon: <Package className="h-5 w-5" />,
    title: "Pantry",
    description: "Track what you have, exclude from lists",
    illustration: PantryIllustration,
  },
  {
    id: "household",
    icon: <Users className="h-5 w-5" />,
    title: "Household",
    description: "Multiple cooks, shared plans and lists",
    illustration: HouseholdIllustration,
  },
  {
    id: "folders",
    icon: <BookOpen className="h-5 w-5" />,
    title: "Folders",
    description: "Organize recipes your way",
  },
  {
    id: "ai",
    icon: <TrendingUp className="h-5 w-5" />,
    title: "AI Suggestions",
    description: "Personalized meal ideas",
  },
];

export function InteractiveFeatures() {
  const [activeFeature, setActiveFeature] = useState<string | null>("cook");
  const activeData = features.find((f) => f.id === activeFeature);

  return (
    <section className="py-20 bg-dark-lighter">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-3">
            Everything you need
          </h2>
          <p className="text-cream/60">From planning to cooking to cleanup.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Desktop: Side-by-side layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Feature list */}
            <div className="space-y-2">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  onMouseEnter={() => setActiveFeature(feature.id)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200",
                    activeFeature === feature.id
                      ? "bg-dark-accent border border-primary/50"
                      : "bg-dark-accent/50 border border-transparent hover:bg-dark-accent"
                  )}
                >
                  <div
                    className={cn(
                      "p-2.5 rounded-lg shrink-0 transition-colors",
                      activeFeature === feature.id
                        ? "bg-primary/20 text-primary"
                        : "bg-dark text-cream/60"
                    )}
                  >
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-cream">{feature.title}</h3>
                    <p className="text-sm text-cream/60 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Illustration panel */}
            <div className="flex flex-col">
              <div className="bg-dark rounded-2xl p-6 border border-dark-border flex-1 flex items-center justify-center">
                {activeData?.illustration ? (
                  <div className="w-full max-w-sm">
                    <activeData.illustration />
                  </div>
                ) : (
                  <div className="text-center text-cream/40">
                    <div className="text-4xl mb-2">
                      {activeData?.id === "folders" && "📁"}
                      {activeData?.id === "ai" && "✨"}
                    </div>
                    <p className="text-sm">{activeData?.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet: Compact grid */}
          <div className="lg:hidden grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-3 p-4 rounded-xl bg-dark-accent border border-dark-border"
              >
                <div className="p-2 rounded-lg bg-primary/20 text-primary shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-cream text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-cream/60 text-xs mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
