"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportRecipe } from "@/app/actions/community";
import type { RecipeReportReason } from "@/types/social";

interface ReportRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeId: string;
}

const REPORT_REASONS: { value: RecipeReportReason; label: string; description: string }[] = [
  {
    value: "inappropriate",
    label: "Inappropriate Content",
    description: "Contains offensive, harmful, or adult content",
  },
  {
    value: "spam",
    label: "Spam",
    description: "Promotional content, ads, or repetitive posts",
  },
  {
    value: "copyright",
    label: "Copyright Violation",
    description: "Uses copyrighted content without permission",
  },
  {
    value: "misleading",
    label: "Misleading",
    description: "False information or deceptive content",
  },
  {
    value: "other",
    label: "Other",
    description: "Another reason not listed above",
  },
];

export function ReportRecipeDialog({
  open,
  onOpenChange,
  recipeId,
}: ReportRecipeDialogProps) {
  const [reason, setReason] = useState<RecipeReportReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    setIsSubmitting(true);
    const result = await reportRecipe(recipeId, reason, description || undefined);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Report submitted. Thank you for helping keep the community safe.");
    setReason("");
    setDescription("");
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Recipe
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe community by reporting content that violates
            our guidelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this recipe?</Label>
            <RadioGroup
              value={reason}
              onValueChange={(v) => setReason(v as RecipeReportReason)}
              className="space-y-2"
            >
              {REPORT_REASONS.map((r) => (
                <div
                  key={r.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setReason(r.value)}
                >
                  <RadioGroupItem value={r.value} id={r.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label
                      htmlFor={r.value}
                      className="font-medium cursor-pointer"
                    >
                      {r.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Additional details <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional context that might help us review this report..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
