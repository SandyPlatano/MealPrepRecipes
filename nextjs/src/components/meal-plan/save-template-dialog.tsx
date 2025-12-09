"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { createMealPlanTemplate } from "@/app/actions/meal-plans";
import { toast } from "sonner";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
  mealCount: number;
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  weekStart,
  mealCount,
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Template name required", {
        description: "Please enter a name for your template.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await createMealPlanTemplate(templateName.trim(), weekStart);
      
      if (result.error) {
        toast.error("Failed to save template", {
          description: result.error,
        });
      } else {
        toast.success("Template saved", {
          description: `"${templateName.trim()}" has been saved successfully.`,
        });
        setTemplateName("");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTemplateName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save your current meal plan as a template to reuse later. This will
            save {mealCount} meal{mealCount !== 1 ? "s" : ""} from this week.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="e.g., Weekly Rotation, Meal Prep Favorites"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSaving) {
                  handleSave();
                }
              }}
              disabled={isSaving}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !templateName.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

