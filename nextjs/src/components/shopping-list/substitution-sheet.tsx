"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { SubstitutionSuggestionCard } from "./substitution-suggestion";
import { acceptSubstitution } from "@/app/actions/ai-substitutions";
import type {
  SubstitutionSuggestion,
  SubstitutionReason,
  SubstitutionResponse,
  SubstitutionError,
  AcceptSubstitutionInput,
} from "@/types/substitution";
import { SUBSTITUTION_ERROR_MESSAGES } from "@/types/substitution";

interface SubstitutionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    recipe_id?: string | null;
    recipe_title?: string | null;
  } | null;
}

type ActionType = "replace" | "add_new" | "mark_unavailable";

/**
 * Sheet for requesting and selecting ingredient substitutions
 */
export function SubstitutionSheet({
  isOpen,
  onClose,
  item,
}: SubstitutionSheetProps) {
  const [reason, setReason] = useState<SubstitutionReason>("unavailable");
  const [suggestions, setSuggestions] = useState<SubstitutionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<SubstitutionError | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionType>("replace");
  const [hasFetched, setHasFetched] = useState(false);

  const handleFetchSuggestions = async () => {
    if (!item) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch("/api/ai/suggest-substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          ingredient: item.ingredient,
          quantity: item.quantity,
          unit: item.unit,
          recipe_id: item.recipe_id,
          recipe_title: item.recipe_title,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData: SubstitutionError = await response.json();
        setError(errorData);
        return;
      }

      const data: SubstitutionResponse = await response.json();
      setSuggestions(data.suggestions);
      setQuotaRemaining(data.quota_remaining);
      setHasFetched(true);
    } catch (err) {
      setError({
        type: "ai_error",
        message: "Failed to fetch suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubstitute = async (suggestion: SubstitutionSuggestion) => {
    if (!item) return;

    setIsAccepting(true);

    const input: AcceptSubstitutionInput = {
      item_id: item.id,
      original_ingredient: item.ingredient,
      substitute: suggestion,
      action: selectedAction,
    };

    const result = await acceptSubstitution(input);

    if (result.error) {
      toast.error(result.error);
    } else {
      const actionMessages: Record<ActionType, string> = {
        replace: `Replaced ${item.ingredient} with ${suggestion.substitute}`,
        add_new: `Added ${suggestion.substitute} to your list`,
        mark_unavailable: `Marked ${item.ingredient} as unavailable`,
      };
      toast.success(actionMessages[selectedAction]);
      handleClose();
    }

    setIsAccepting(false);
  };

  const handleClose = () => {
    // Reset state when closing
    setSuggestions([]);
    setError(null);
    setReason("unavailable");
    setSelectedAction("replace");
    setHasFetched(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Find Substitutes
          </SheetTitle>
          <SheetDescription>
            {item ? (
              <>
                Get AI-powered substitution suggestions for{" "}
                <span className="font-medium text-foreground">
                  {item.quantity && `${item.quantity} `}
                  {item.unit && `${item.unit} `}
                  {item.ingredient}
                </span>
              </>
            ) : (
              "Select an ingredient to find substitutes"
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          {/* Reason Selection */}
          {!hasFetched && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">Why do you need a substitute?</Label>
              <RadioGroup
                value={reason}
                onValueChange={(v) => setReason(v as SubstitutionReason)}
                className="grid grid-cols-1 gap-2"
              >
                <ReasonOption
                  value="unavailable"
                  label="Not available"
                  description="Can't find it at the store"
                />
                <ReasonOption
                  value="dietary"
                  label="Dietary restriction"
                  description="Need an alternative for health reasons"
                />
                <ReasonOption
                  value="budget"
                  label="Budget friendly"
                  description="Looking for a cheaper option"
                />
                <ReasonOption
                  value="pantry_first"
                  label="Use what I have"
                  description="Prefer items already in my pantry"
                />
                <ReasonOption
                  value="preference"
                  label="Just curious"
                  description="Want to try something different"
                />
              </RadioGroup>

              <Button
                className="w-full mt-4"
                onClick={handleFetchSuggestions}
                disabled={isLoading || !item}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finding substitutes...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    {SUBSTITUTION_ERROR_MESSAGES[error.type] || error.message}
                  </p>
                  {error.reset_at && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Resets:{" "}
                      {new Date(error.reset_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="flex flex-col gap-4">
              {/* Action Selection */}
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">What should we do?</Label>
                <RadioGroup
                  value={selectedAction}
                  onValueChange={(v) => setSelectedAction(v as ActionType)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace" className="flex-1 cursor-pointer text-sm">
                      Replace the original item
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="add_new" id="add_new" />
                    <Label htmlFor="add_new" className="flex-1 cursor-pointer text-sm">
                      Add substitute, keep original
                    </Label>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value="mark_unavailable" id="mark_unavailable" />
                    <Label htmlFor="mark_unavailable" className="flex-1 cursor-pointer text-sm">
                      Mark original as unavailable
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Quota indicator */}
              {quotaRemaining !== null && (
                <p className="text-xs text-muted-foreground text-center">
                  {quotaRemaining} substitution{quotaRemaining !== 1 ? "s" : ""} remaining this week
                </p>
              )}

              {/* Suggestion Cards */}
              <div className="flex flex-col gap-3">
                {suggestions.map((suggestion, index) => (
                  <SubstitutionSuggestionCard
                    key={index}
                    suggestion={suggestion}
                    onSelect={handleSelectSubstitute}
                    isLoading={isAccepting}
                  />
                ))}
              </div>

              {/* Try Again */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setHasFetched(false);
                  setSuggestions([]);
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Change Reason & Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Finding the best substitutes...
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Radio option for substitution reason
 */
function ReasonOption({
  value,
  label,
  description,
}: {
  value: SubstitutionReason;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
      <RadioGroupItem value={value} id={value} className="mt-0.5" />
      <Label htmlFor={value} className="flex-1 cursor-pointer">
        <span className="font-medium block">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Label>
    </div>
  );
}
