"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Minus,
  Package,
  Check,
} from "lucide-react";
import type { SubstitutionSuggestion, BudgetTier } from "@/types/substitution";

interface SubstitutionSuggestionCardProps {
  suggestion: SubstitutionSuggestion;
  onSelect: (suggestion: SubstitutionSuggestion) => void;
  isLoading?: boolean;
}

/**
 * Card displaying a single substitution suggestion
 */
export function SubstitutionSuggestionCard({
  suggestion,
  onSelect,
  isLoading,
}: SubstitutionSuggestionCardProps) {
  const {
    substitute,
    quantity,
    unit,
    match_score,
    reason,
    preparation_note,
    dietary_flags,
    in_pantry,
    budget_tier,
    nutritional_note,
  } = suggestion;

  const BudgetIcon = getBudgetIcon(budget_tier);
  const matchColor = getMatchScoreColor(match_score);

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        in_pantry
          ? "border-green-500/50 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
          : "border-gray-200 hover:border-[#D9F99D] dark:border-gray-700"
      }`}
    >
      {/* Header: Name and Score */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-base truncate text-gray-900 dark:text-gray-100">
              {quantity} {unit && `${unit} `}{substitute}
            </h4>
            {in_pantry && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                <Package className="h-3 w-3 mr-1" />
                In Pantry
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{reason}</p>
        </div>

        {/* Match Score Badge */}
        <div
          className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${matchColor}`}
        >
          {match_score}%
        </div>
      </div>

      {/* Preparation Note */}
      {preparation_note && (
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 italic">
          {preparation_note}
        </p>
      )}

      {/* Dietary Flags and Budget */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {dietary_flags.length > 0 && (
          <>
            {dietary_flags.slice(0, 3).map((flag) => (
              <Badge key={flag} variant="outline" className="text-xs">
                {flag}
              </Badge>
            ))}
            {dietary_flags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{dietary_flags.length - 3}
              </Badge>
            )}
          </>
        )}

        {/* Budget Indicator */}
        <Badge
          variant="outline"
          className={`text-xs ${getBudgetBadgeClass(budget_tier)}`}
        >
          <BudgetIcon className="h-3 w-3 mr-1" />
          {budget_tier === "cheaper"
            ? "Cheaper"
            : budget_tier === "pricier"
            ? "Pricier"
            : "Same price"}
        </Badge>
      </div>

      {/* Nutritional Note */}
      {nutritional_note && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {nutritional_note}
        </p>
      )}

      {/* Select Button */}
      <Button
        className={`w-full mt-3 rounded-full ${in_pantry ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"}`}
        size="sm"
        variant={in_pantry ? "default" : "outline"}
        onClick={() => onSelect(suggestion)}
        disabled={isLoading}
      >
        <Check className="h-4 w-4 mr-2" />
        Use This Substitute
      </Button>
    </div>
  );
}

/**
 * Get the appropriate icon for budget tier
 */
function getBudgetIcon(tier: BudgetTier) {
  switch (tier) {
    case "cheaper":
      return TrendingDown;
    case "pricier":
      return TrendingUp;
    default:
      return Minus;
  }
}

/**
 * Get color classes for match score
 */
function getMatchScoreColor(score: number): string {
  if (score >= 90) {
    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
  }
  if (score >= 70) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  }
  if (score >= 50) {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  }
  return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
}

/**
 * Get badge classes for budget tier
 */
function getBudgetBadgeClass(tier: BudgetTier): string {
  switch (tier) {
    case "cheaper":
      return "border-green-500 text-green-700 dark:text-green-400";
    case "pricier":
      return "border-red-500 text-red-700 dark:text-red-400";
    default:
      return "";
  }
}
