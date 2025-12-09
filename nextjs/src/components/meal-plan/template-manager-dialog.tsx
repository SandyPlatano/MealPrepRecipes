"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Play, Trash2, Calendar } from "lucide-react";
import {
  getMealPlanTemplates,
  applyMealPlanTemplate,
  deleteMealPlanTemplate,
} from "@/app/actions/meal-plans";
import type { MealPlanTemplate } from "@/types/meal-plan";
import { toast } from "sonner";

interface TemplateManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart: string;
}

export function TemplateManagerDialog({
  open,
  onOpenChange,
  weekStart,
}: TemplateManagerDialogProps) {
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await getMealPlanTemplates();
      if (result.error) {
        toast.error("Failed to load templates", {
          description: result.error,
        });
      } else {
        setTemplates(result.data || []);
      }
    } catch {
      toast.error("Error", {
        description: "Failed to load templates.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (templateId: string) => {
    setIsApplying(templateId);
    startTransition(async () => {
      try {
        const result = await applyMealPlanTemplate(templateId, weekStart);
        if (result.error) {
          toast.error("Failed to apply template", {
            description: result.error,
          });
        } else {
          toast.success("Template applied", {
            description: "Your meal plan has been updated.",
          });
          onOpenChange(false);
        }
      } catch {
        toast.error("Error", {
          description: "An unexpected error occurred.",
        });
      } finally {
        setIsApplying(null);
      }
    });
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return;
    }

    setIsDeleting(templateId);
    try {
      const result = await deleteMealPlanTemplate(templateId);
      if (result.error) {
        toast.error("Failed to delete template", {
          description: result.error,
        });
      } else {
        toast.success("Template deleted");
        await loadTemplates();
      }
    } catch {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const getMealCount = (template: MealPlanTemplate) => {
    return Array.isArray(template.assignments) ? template.assignments.length : 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Meal Plan Templates</DialogTitle>
          <DialogDescription>
            Apply a saved template to your current week or manage your templates.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No templates saved yet.</p>
              <p className="text-xs mt-2">
                Save your current meal plan as a template to reuse it later.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => {
                const mealCount = getMealCount(template);
                const isApplyingThis = isApplying === template.id;
                const isDeletingThis = isDeleting === template.id;

                return (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mealCount} meal{mealCount !== 1 ? "s" : ""} • Created{" "}
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleApply(template.id)}
                        disabled={isApplyingThis || isDeletingThis || mealCount === 0}
                      >
                        {isApplyingThis ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Apply
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isApplyingThis || isDeletingThis}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDelete(template.id, template.name)}
                            disabled={isDeletingThis}
                            className="text-destructive focus:text-destructive"
                          >
                            {isDeletingThis ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

