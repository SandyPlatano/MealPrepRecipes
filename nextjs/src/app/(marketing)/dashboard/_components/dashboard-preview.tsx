"use client";

import { useState } from "react";
import { SectionWrapper, SectionHeader } from "@/components/landing/shared";
import { StatCard } from "@/components/landing/shared/stat-card";
import { DASHBOARD_TABS } from "../_data/landing-data";
import { cn } from "@/lib/utils";

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("month");
  const activeData = DASHBOARD_TABS.find((tab) => tab.id === activeTab);

  return (
    <SectionWrapper id="dashboard">
      <SectionHeader
        title="Your retail command center"
        description="Real-time visibility into revenue, inventory, and chargeback recovery across all retailers."
      />

      {/* Dashboard container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-muted/50 p-4 md:p-8">
        {/* Tab bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-muted p-1">
            {DASHBOARD_TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters placeholder */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-muted-foreground">All Retailers</span>
            <div className="size-2 rounded-full bg-sage-500" />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeData?.cards.map((card, index) => (
            <StatCard
              key={`${activeTab}-${index}`}
              value={card.value}
              label={card.label}
              trend={card.trend}
              trendUp={card.trendUp}
              borderColor={card.borderColor}
            />
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-mono font-semibold">Revenue Trend</h4>
            <span className="text-sm text-muted-foreground">Last 12 months</span>
          </div>
          {/* SVG Chart visualization */}
          <div className="h-48 w-full">
            <svg viewBox="0 0 400 120" className="h-full w-full">
              {/* Grid lines */}
              <line
                x1="0"
                y1="30"
                x2="400"
                y2="30"
                className="stroke-border"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <line
                x1="0"
                y1="60"
                x2="400"
                y2="60"
                className="stroke-border"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <line
                x1="0"
                y1="90"
                x2="400"
                y2="90"
                className="stroke-border"
                strokeWidth="1"
                strokeDasharray="4"
              />

              {/* Area fill */}
              <path
                d="M0,100 L33,85 L66,90 L100,75 L133,80 L166,65 L200,70 L233,55 L266,45 L300,50 L333,35 L366,30 L400,20 L400,120 L0,120 Z"
                className="fill-primary/10"
              />

              {/* Line */}
              <path
                d="M0,100 L33,85 L66,90 L100,75 L133,80 L166,65 L200,70 L233,55 L266,45 L300,50 L333,35 L366,30 L400,20"
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {[
                [0, 100],
                [33, 85],
                [66, 90],
                [100, 75],
                [133, 80],
                [166, 65],
                [200, 70],
                [233, 55],
                [266, 45],
                [300, 50],
                [333, 35],
                [366, 30],
                [400, 20],
              ].map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  className="fill-primary"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
