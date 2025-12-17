"use client";

import { useState } from "react";
import { Sparkles, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { WeekVarietyScore, VarietySuggestion } from "@/types/meal-prep";
import { cn } from "@/lib/utils";

export interface WeekVarietyScoreCardProps {
  score: WeekVarietyScore | null;
  className?: string;
}

export function WeekVarietyScoreCard({
  score,
  className,
}: WeekVarietyScoreCardProps) {
  const [isProteinsOpen, setIsProteinsOpen] = useState(false);
  const [isCuisinesOpen, setIsCuisinesOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Empty state
  if (!score) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Variety Score</CardTitle>
          </div>
          <CardDescription>
            Add meals to your week to see your variety score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No meals planned for this week yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallScore = score.overall_score ?? 0;

  // Determine color based on overall score
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue < 40) return "text-red-500 dark:text-red-400";
    if (scoreValue < 70) return "text-amber-500 dark:text-amber-400";
    return "text-green-500 dark:text-green-400";
  };

  const getProgressColor = (scoreValue: number) => {
    if (scoreValue < 40)
      return "[&>div]:bg-red-500 dark:[&>div]:bg-red-400";
    if (scoreValue < 70)
      return "[&>div]:bg-amber-500 dark:[&>div]:bg-amber-400";
    return "[&>div]:bg-green-500 dark:[&>div]:bg-green-400";
  };

  const getSuggestionVariant = (priority: VarietySuggestion["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Variety Score</CardTitle>
        </div>
        <CardDescription>
          How diverse your meal plan is this week
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score Display */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn("text-6xl font-bold", getScoreColor(overallScore))}>
            {Math.round(overallScore)}
          </div>
          <p className="text-sm text-muted-foreground">Overall Score</p>
        </div>

        {/* Individual Scores */}
        <div className="space-y-4">
          {/* Protein Variety */}
          {score.protein_variety_score !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Protein Variety</span>
                <span className={cn("font-semibold", getScoreColor(score.protein_variety_score))}>
                  {Math.round(score.protein_variety_score)}
                </span>
              </div>
              <Progress
                value={score.protein_variety_score}
                className={cn("h-2", getProgressColor(score.protein_variety_score))}
              />
            </div>
          )}

          {/* Cuisine Variety */}
          {score.cuisine_variety_score !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Cuisine Variety</span>
                <span className={cn("font-semibold", getScoreColor(score.cuisine_variety_score))}>
                  {Math.round(score.cuisine_variety_score)}
                </span>
              </div>
              <Progress
                value={score.cuisine_variety_score}
                className={cn("h-2", getProgressColor(score.cuisine_variety_score))}
              />
            </div>
          )}

          {/* Category Variety */}
          {score.category_variety_score !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Category Variety</span>
                <span className={cn("font-semibold", getScoreColor(score.category_variety_score))}>
                  {Math.round(score.category_variety_score)}
                </span>
              </div>
              <Progress
                value={score.category_variety_score}
                className={cn("h-2", getProgressColor(score.category_variety_score))}
              />
            </div>
          )}
        </div>

        {/* Used Items Collapsibles */}
        <div className="space-y-2 border-t pt-4">
          {/* Proteins Used */}
          {score.proteins_used.length > 0 && (
            <Collapsible open={isProteinsOpen} onOpenChange={setIsProteinsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-primary transition-colors">
                <span>Proteins Used ({score.proteins_used.length})</span>
                {isProteinsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {score.proteins_used.map((protein, index) => (
                    <Badge key={index} variant="secondary">
                      {protein}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Cuisines Used */}
          {score.cuisines_used.length > 0 && (
            <Collapsible open={isCuisinesOpen} onOpenChange={setIsCuisinesOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-primary transition-colors">
                <span>Cuisines Used ({score.cuisines_used.length})</span>
                {isCuisinesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {score.cuisines_used.map((cuisine, index) => (
                    <Badge key={index} variant="secondary">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Categories Used */}
          {score.categories_used.length > 0 && (
            <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-primary transition-colors">
                <span>Categories Used ({score.categories_used.length})</span>
                {isCategoriesOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {score.categories_used.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Suggestions */}
        {score.suggestions.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span>Suggestions</span>
            </div>
            <div className="space-y-2">
              {score.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    suggestion.priority === "high" &&
                      "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
                    suggestion.priority === "medium" &&
                      "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20",
                    suggestion.priority === "low" &&
                      "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Badge
                      variant={getSuggestionVariant(suggestion.priority)}
                      className="shrink-0"
                    >
                      {suggestion.type}
                    </Badge>
                    <p className="flex-1 leading-relaxed">{suggestion.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
