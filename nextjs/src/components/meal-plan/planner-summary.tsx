"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { MealAssignmentWithRecipe } from "@/types/meal-plan";

interface PlannerSummaryProps {
  assignments: MealAssignmentWithRecipe[];
  weekStartStr: string;
}

export function PlannerSummary({
  assignments,
  weekStartStr,
}: PlannerSummaryProps) {
  const totalMeals = assignments.length;

  if (totalMeals === 0) {
    return null;
  }

  return (
    <div className="flex justify-center py-6">
      <Button
        asChild
        size="lg"
        className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
      >
        <Link href={`/app/finalize?week=${weekStartStr}`}>
          <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
          <span>Finalize Your Plan</span>
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          
          {/* Subtle glow effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Link>
      </Button>
    </div>
  );
}

