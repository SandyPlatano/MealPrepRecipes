"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { MoreVertical, Bookmark, Copy, Trash2, Loader2 } from "lucide-react";
import { deleteMealPlan, createMealPlanTemplateFromPlan } from "@/app/actions/meal-plans";
import { toast } from "sonner";

interface WeeklyPlan {
  id: string;
  week_start: string;
  sent_at: string;
  meal_assignments: Array<{
    id: string;
    day_of_week: string;
    cook: string | null;
    recipe: {
      id: string;
      title: string;
      recipe_type: string;
    };
  }>;
}

interface WeeklyPlanActionsProps {
  plan: WeeklyPlan;
  weekRange: string;
}

export function WeeklyPlanActions({ plan, weekRange }: WeeklyPlanActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMealPlan(plan.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Plan removed from history");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete plan");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsSavingTemplate(true);
    try {
      const result = await createMealPlanTemplateFromPlan(plan.id, templateName);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Template saved!");
        setShowTemplateDialog(false);
        setTemplateName("");
      }
    } catch {
      toast.error("Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleUseAgain = () => {
    // Navigate to the planner with this week's start date
    // The user can then adjust the week if needed
    router.push(`/app/plan?week=${plan.week_start}`);
  };

  const mealCount = plan.meal_assignments?.length || 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowTemplateDialog(true)}>
            <Bookmark className="h-4 w-4 mr-2" />
            Save as Template
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUseAgain}>
            <Copy className="h-4 w-4 mr-2" />
            Use Again
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Week Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the meal plan for {weekRange} from
              your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save as Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this week&apos;s meal plan as a reusable template. You can apply it to
              any future week.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Quick Weeknight Meals"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && templateName.trim()) {
                    handleSaveAsTemplate();
                  }
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This template will include {mealCount} meal{mealCount !== 1 ? "s" : ""}.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTemplateDialog(false)}
              disabled={isSavingTemplate}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAsTemplate}
              disabled={isSavingTemplate || !templateName.trim()}
            >
              {isSavingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
