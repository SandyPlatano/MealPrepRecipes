"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepDisplayProps {
  currentStep: number;
  totalSteps: number;
  instruction: string;
  ingredients?: string[];
  onSetTimer?: () => void;
  className?: string;
}

/**
 * Displays the current cooking instruction in large, readable text
 * - Shows step number badge
 * - Highlights mentioned ingredients
 * - Detects time mentions and offers timer button
 */
export function StepDisplay({
  currentStep,
  totalSteps,
  instruction,
  ingredients = [],
  onSetTimer,
  className,
}: StepDisplayProps) {
  // Detect if instruction mentions time (e.g., "15 minutes", "2 hours")
  const hasTimeReference = /\d+\s*(minute|min|hour|hr|second|sec)s?/i.test(
    instruction
  );

  // Escape special regex characters in a string
  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Extract ingredient names from full ingredient strings (e.g., "2 cups flour" -> "flour")
  // Also strip out parenthetical notes like "(divided)" or "(optional)"
  const ingredientKeywords = ingredients.map((ing) => {
    // Remove parenthetical content first
    const cleaned = ing.replace(/\s*\([^)]*\)/g, "").trim();
    const words = cleaned.toLowerCase().split(" ");
    // Get the last 1-2 words as the ingredient name
    return words.slice(-2).join(" ");
  });

  // Highlight ingredients mentioned in the instruction
  const highlightIngredients = (text: string) => {
    let highlightedText = text;
    const parts: Array<{ text: string; isIngredient: boolean }> = [];
    let lastIndex = 0;

    // Find all ingredient mentions
    ingredientKeywords.forEach((keyword) => {
      if (!keyword) return; // Skip empty keywords
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi");
      let match;
      const matches: Array<{ index: number; length: number }> = [];

      while ((match = regex.exec(text)) !== null) {
        matches.push({ index: match.index, length: match[0].length });
      }

      matches.forEach((m) => {
        if (m.index > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, m.index),
            isIngredient: false,
          });
        }
        parts.push({
          text: text.substring(m.index, m.index + m.length),
          isIngredient: true,
        });
        lastIndex = m.index + m.length;
      });
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), isIngredient: false });
    }

    return parts.length > 0 ? parts : [{ text, isIngredient: false }];
  };

  const textParts = highlightIngredients(instruction);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Step badge */}
      <div className="flex items-center justify-between gap-4">
        <Badge variant="secondary" className="text-base px-4 py-2">
          Step {currentStep} of {totalSteps}
        </Badge>

        {/* Timer button if time is mentioned */}
        {hasTimeReference && onSetTimer && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSetTimer}
            className="gap-2"
          >
            <Timer className="h-4 w-4" />
            Set Timer
          </Button>
        )}
      </div>

      {/* Instruction text - large and readable */}
      <div className="text-2xl sm:text-3xl md:text-4xl leading-relaxed font-medium">
        {textParts.map((part, index) => (
          <span
            key={index}
            className={cn(
              part.isIngredient &&
                "text-primary font-semibold underline decoration-primary/30"
            )}
          >
            {part.text}
          </span>
        ))}
      </div>
    </div>
  );
}
