"use client";

import { DemoMealPlanner } from "@/components/demo/demo-meal-planner";

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold">Meal Plan</h1>
        <p className="text-muted-foreground mt-1">
          Plan your week. Assign cooks. Send the list. Done.
        </p>
      </div>

      <DemoMealPlanner />
    </div>
  );
}
