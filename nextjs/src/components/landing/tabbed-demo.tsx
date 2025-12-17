"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { BookOpen, Calendar, ShoppingCart, Sparkles } from "lucide-react";

// Lazy load demos
const RecipeCardDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.RecipeCardDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-dark-accent rounded-2xl animate-pulse" />
    ),
  }
);

const MealPlanDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.MealPlanDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-dark-accent rounded-2xl animate-pulse" />
    ),
  }
);

const ShoppingListDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.ShoppingListDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-dark-accent rounded-2xl animate-pulse" />
    ),
  }
);

const RecipeImportDemo = dynamic(
  () =>
    import("@/components/landing/animated-demo").then((mod) => ({
      default: mod.RecipeImportDemo,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 bg-dark-accent rounded-2xl animate-pulse" />
    ),
  }
);

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  {
    id: "recipes",
    label: "Recipes",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Build your collection",
    description: "Save favorites, track nutrition, add to your plan with one tap.",
    component: RecipeCardDemo,
  },
  {
    id: "planning",
    label: "Planning",
    icon: <Calendar className="h-4 w-4" />,
    title: "Plan the whole week",
    description: "Pick meals for each day. Assign cooks. Everyone knows what's for dinner.",
    component: MealPlanDemo,
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: <ShoppingCart className="h-4 w-4" />,
    title: "Auto shopping lists",
    description: "Generated from your plan, organized by category. Check off as you shop.",
    component: ShoppingListDemo,
  },
  {
    id: "import",
    label: "AI Import",
    icon: <Sparkles className="h-4 w-4" />,
    title: "Import any recipe",
    description: "Paste a URL or text. AI extracts ingredients and instructions instantly.",
    component: RecipeImportDemo,
  },
];

export function TabbedDemo() {
  const [activeTab, setActiveTab] = useState("recipes");
  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0];
  const ActiveComponent = activeTabData.component;

  return (
    <section id="demo" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-cream mb-4">
            See it in action
          </h2>
          <p className="text-cream/60 max-w-xl mx-auto">
            From saving recipes to cooking dinner — here&apos;s how it works.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-glow-red"
                  : "bg-dark-accent text-cream/70 hover:text-cream hover:bg-dark-lighter"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div className="max-w-3xl mx-auto">
          {/* Tab title and description */}
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-cream mb-2">
              {activeTabData.title}
            </h3>
            <p className="text-cream/60">{activeTabData.description}</p>
          </div>

          {/* Demo component */}
          <div className="transition-all duration-300">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </section>
  );
}
