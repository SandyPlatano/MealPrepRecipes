"use client";

import { useState } from "react";
import { Download, Calendar, ShoppingCart, ChefHat, ArrowRight } from "lucide-react";
import { RecipeCardDemo, MealPlanDemo, ShoppingListDemo, CookModeDemo } from "./animated-demos";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// Demo Section - Tabbed container for feature demos
// ─────────────────────────────────────────────────────────────

const TABS = [
  {
    id: "import",
    label: "Import",
    icon: Download,
    title: "AI Recipe Import",
    description: "Paste any recipe URL and watch AI extract ingredients, steps, and nutrition in seconds.",
    features: [
      "Works with any recipe website",
      "Extracts ingredients & quantities",
      "Calculates nutrition automatically",
      "Cleans up messy formatting",
    ],
  },
  {
    id: "plan",
    label: "Plan",
    icon: Calendar,
    title: "Weekly Meal Planning",
    description: "Drag recipes to your calendar. Assign cooks. Build your perfect week.",
    features: [
      "Visual weekly calendar",
      "Assign who's cooking",
      "Scale recipes for guests",
      "Repeat favorite weeks",
    ],
  },
  {
    id: "shop",
    label: "Shop",
    icon: ShoppingCart,
    title: "Smart Shopping Lists",
    description: "Auto-generated lists organized by store aisle. Check off items as you shop.",
    features: [
      "Auto-combines ingredients",
      "Organized by store section",
      "Syncs across devices",
      "Add custom items anytime",
    ],
  },
  {
    id: "cook",
    label: "Cook",
    icon: ChefHat,
    title: "Guided Cook Mode",
    description: "Step-by-step instructions with built-in timers. Hands-free voice control.",
    features: [
      "Large, easy-to-read steps",
      "Built-in timers",
      "Scale servings on the fly",
      "Mark steps complete",
    ],
  },
];

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("import");
  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-xs font-bold text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/30 px-3 py-1 rounded-full mb-4">
            See It In Action
          </span>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-white mb-4">
            Every Feature, Animated
          </h2>
          <p className="text-[#888] max-w-xl mx-auto">
            Watch how each feature works. No signup required to explore.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex gap-1 p-1 bg-[#1a1a1a] border-2 border-[#333] rounded-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm font-bold
                    transition-all duration-200
                    ${isActive
                      ? "bg-[#F97316] text-white shadow-[4px_4px_0_#111]"
                      : "text-[#888] hover:text-white hover:bg-[#222]"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Demo */}
          <div className="order-2 lg:order-1">
            {activeTab === "import" && <RecipeCardDemo />}
            {activeTab === "plan" && <MealPlanDemo />}
            {activeTab === "shop" && <ShoppingListDemo />}
            {activeTab === "cook" && <CookModeDemo />}
          </div>

          {/* Description */}
          <div className="order-1 lg:order-2">
            <h3 className="font-mono text-2xl font-bold text-white mb-4">
              {currentTab.title}
            </h3>
            <p className="text-[#888] mb-6 leading-relaxed">
              {currentTab.description}
            </p>

            {/* Feature List */}
            <ul className="space-y-3 mb-8">
              {currentTab.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                  <span className="text-[#ccc] text-sm font-mono">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-[#F97316] text-white font-mono font-bold px-6 py-3 rounded-lg border-2 border-[#111] shadow-[4px_4px_0_#111] hover:shadow-[2px_2px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Try It Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
