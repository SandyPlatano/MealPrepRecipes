"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { PrepRecipeProgress } from "./prep-recipe-progress";
import { IngredientOverlapCard } from "./ingredient-overlap-card";
import {
  startPrepSession,
  completePrepSession,
  deletePrepSession,
  updatePrepSessionRecipe,
} from "@/app/actions/meal-prep";
import { CalendarDays, Clock, Play, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type {
  PrepSessionWithRecipes,
  PrepSessionOverlapAnalysis,
  PrepRecipeStatus,
  PrepSessionStatus,
} from "@/types/meal-prep";

export interface PrepSessionDetailProps {
  session: PrepSessionWithRecipes;
  overlapAnalysis: PrepSessionOverlapAnalysis | null;
}

const STATUS_LABELS: Record<PrepSessionStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<PrepSessionStatus, string> = {
  planned: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  in_progress: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
  completed: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  cancelled: "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
};

export function PrepSessionDetail({
  session: initialSession,
  overlapAnalysis,
}: PrepSessionDetailProps) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const result = await startPrepSession(session.id);
      if (result.error) {
        toast.error("Failed to start session", {
          description: result.error,
        });
      } else if (result.data) {
        setSession({ ...session, ...result.data });
        toast.success("Prep session started!");
      }
    } catch (error) {
      toast.error("Failed to start session");
    } finally {
      setIsStarting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const result = await completePrepSession(session.id);
      if (result.error) {
        toast.error("Failed to complete session", {
          description: result.error,
        });
      } else if (result.data) {
        setSession({ ...session, ...result.data });
        toast.success("Prep session completed!");
      }
    } catch (error) {
      toast.error("Failed to complete session");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePrepSession(session.id);
      if (result.error) {
        toast.error("Failed to delete session", {
          description: result.error,
        });
        setIsDeleting(false);
      } else {
        toast.success("Prep session deleted");
        router.push("/app/prep");
      }
    } catch (error) {
      toast.error("Failed to delete session");
      setIsDeleting(false);
    }
  };

  const handleRecipeStatusChange = async (recipeId: string, newStatus: PrepRecipeStatus) => {
    try {
      const result = await updatePrepSessionRecipe(recipeId, { status: newStatus });
      if (result.error) {
        toast.error("Failed to update recipe status", {
          description: result.error,
        });
      } else {
        // Update local state optimistically
        setSession({
          ...session,
          recipes: session.recipes.map((r) =>
            r.id === recipeId ? { ...r, status: newStatus } : r
          ),
        });
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update recipe status");
    }
  };

  const totalEstimatedTime = session.recipes.reduce(
    (sum, r) => sum + (r.estimated_prep_minutes || 0) + (r.estimated_cook_minutes || 0),
    0
  );

  const canStart = session.status === "planned";
  const canComplete = session.status === "in_progress";
  const canDelete = session.status !== "in_progress";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{session.name}</CardTitle>
                  <Badge className={STATUS_COLORS[session.status]}>
                    {STATUS_LABELS[session.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(new Date(session.scheduled_date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  {totalEstimatedTime > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        ~{Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m estimated
                      </span>
                    </div>
                  )}
                </div>
                {session.notes && (
                  <p className="mt-3 text-sm text-muted-foreground">{session.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {canStart && (
                  <Button
                    onClick={handleStart}
                    disabled={isStarting}
                    className="gap-2"
                  >
                    {isStarting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Start
                  </Button>
                )}
                {canComplete && (
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="gap-2"
                  >
                    {isCompleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Complete
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={!canDelete || isDeleting}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Recipe Progress List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recipes ({session.recipes.length})</h2>
          {session.recipes.length > 0 ? (
            <div className="space-y-3">
              {session.recipes.map((recipe) => (
                <PrepRecipeProgress
                  key={recipe.id}
                  recipe={recipe}
                  onStatusChange={handleRecipeStatusChange}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No recipes added to this session yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Ingredient Overlap Analysis */}
        {overlapAnalysis && (
          <IngredientOverlapCard analysis={overlapAnalysis} />
        )}

        {/* Session Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Recipes</span>
              <span className="font-medium">{session.recipes.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Servings</span>
              <span className="font-medium">
                {session.recipes.reduce((sum, r) => sum + r.servings_to_prep, 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Containers Needed</span>
              <span className="font-medium">
                {session.recipes.reduce((sum, r) => sum + r.containers_needed, 0)}
              </span>
            </div>
            {totalEstimatedTime > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-medium">
                  {Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prep Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{session.name}"? This action cannot be undone.
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
