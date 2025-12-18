"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  CookModeLayout,
  StepDisplay,
  StepNavigation,
  TimerPanel,
  TimerDialog,
} from "@/components/cook-mode";
import { ArrowLeft, CheckCircle } from "lucide-react";
import {
  getActiveSession,
  navigateStep,
  createTimer,
  getActiveTimers,
  completeCookingSession,
  abandonSession,
  startCookingSession,
} from "@/app/actions/voice-cooking";
import type {
  ActiveCookingSession,
  VoiceSessionTimer,
  CreateTimerData,
} from "@/types/voice-cooking";
import { toast } from "sonner";

interface VoiceCookingModeProps {
  recipeId: string;
}

/**
 * Main voice cooking mode component with database-backed session tracking
 * - Persistent cooking sessions
 * - Timer management
 * - Analytics logging
 */
export function VoiceCookingMode({ recipeId }: VoiceCookingModeProps) {
  const router = useRouter();
  const [session, setSession] = useState<ActiveCookingSession | null>(null);
  const [timers, setTimers] = useState<VoiceSessionTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Load or create session
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        // Check for existing active session
        const activeResult = await getActiveSession();

        if (activeResult.data) {
          // Verify it's for the same recipe
          if (activeResult.data.recipe_id === recipeId) {
            setSession(activeResult.data);
            loadTimers(activeResult.data.id);
          } else {
            // Different recipe - need to abandon old session first
            toast.error(
              "You have an active cooking session for a different recipe. Please complete or abandon it first."
            );
            router.push(`/app/recipes/${recipeId}`);
            return;
          }
        } else {
          // No active session - create new one
          const startResult = await startCookingSession(recipeId);
          if (startResult.error || !startResult.data) {
            toast.error("Failed to start cooking session");
            router.push(`/app/recipes/${recipeId}`);
            return;
          }

          // Load the newly created session
          const newSessionResult = await getActiveSession();
          if (newSessionResult.data) {
            setSession(newSessionResult.data);
            loadTimers(newSessionResult.data.id);
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
        toast.error("Failed to load cooking session");
        router.push(`/app/recipes/${recipeId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [recipeId, router]);

  const loadTimers = async (sessionId: string) => {
    const result = await getActiveTimers(sessionId);
    if (result.data) {
      setTimers(result.data);
    }
  };

  const handleNavigate = useCallback(
    async (direction: "next" | "back" | "repeat") => {
      if (!session || isNavigating) return;

      setIsNavigating(true);
      try {
        const result = await navigateStep(session.id, direction);
        if (result.error || !result.data) {
          toast.error("Failed to navigate");
          return;
        }

        // Check if cooking is complete
        if (result.data.is_complete && direction === "next") {
          setShowCompleteDialog(true);
          return;
        }

        // Update session with new step
        setSession({
          ...session,
          current_step: result.data.new_step,
          current_instruction: result.data.instruction,
        });
      } catch (error) {
        console.error("Navigation error:", error);
        toast.error("Navigation failed");
      } finally {
        setIsNavigating(false);
      }
    },
    [session, isNavigating]
  );

  const handleCreateTimer = async (data: CreateTimerData) => {
    if (!session) return;

    const result = await createTimer(session.id, data);
    if (result.error) {
      toast.error("Failed to create timer");
      return;
    }

    toast.success("Timer created");
    loadTimers(session.id);
  };

  const handleComplete = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const result = await completeCookingSession(session.id);
      if (result.error) {
        toast.error("Failed to complete session");
        return;
      }

      toast.success("Cooking session completed!");
      router.push(`/app/recipes/${recipeId}`);
    } catch (error) {
      console.error("Complete error:", error);
      toast.error("Failed to complete session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandon = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const result = await abandonSession(session.id);
      if (result.error) {
        toast.error("Failed to exit");
        return;
      }

      router.push(`/app/recipes/${recipeId}`);
    } catch (error) {
      console.error("Abandon error:", error);
      toast.error("Failed to exit");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !session) {
    return (
      <CookModeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-muted-foreground">
            Loading cooking session...
          </p>
        </div>
      </CookModeLayout>
    );
  }

  return (
    <CookModeLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitDialog(true)}
              className="flex-shrink-0"
              aria-label="Exit cooking mode"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit
            </Button>

            <div className="text-center flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">
                {session.recipe_title}
              </h1>
              {session.recipe_servings && (
                <p className="text-sm text-muted-foreground">
                  {session.recipe_servings}
                  {session.servings_multiplier !== 1 &&
                    ` × ${session.servings_multiplier}`}
                </p>
              )}
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
              disabled={session.current_step !== session.total_steps}
              className="flex-shrink-0"
              aria-label="Complete cooking session"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Current step */}
          <StepDisplay
            currentStep={session.current_step}
            totalSteps={session.total_steps}
            instruction={session.current_instruction}
            ingredients={session.ingredients}
            onSetTimer={() => setShowTimerDialog(true)}
          />

          <Separator />

          {/* Navigation */}
          <StepNavigation
            currentStep={session.current_step}
            totalSteps={session.total_steps}
            onPrevious={() => handleNavigate("back")}
            onNext={() => handleNavigate("next")}
            onRepeat={() => handleNavigate("repeat")}
            isLoading={isNavigating}
          />

          <Separator />

          {/* Timers */}
          <TimerPanel
            timers={timers}
            onAddTimer={() => setShowTimerDialog(true)}
            onTimerComplete={(timerId) => {
              toast.success("Timer complete!");
              loadTimers(session.id);
            }}
          />
        </div>
      </div>

      {/* Timer dialog */}
      <TimerDialog
        open={showTimerDialog}
        onOpenChange={setShowTimerDialog}
        onCreateTimer={handleCreateTimer}
        currentStep={session.current_step}
      />

      {/* Exit confirmation */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Cooking Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved to cooking history. Active timers
              will be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Cooking</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbandon}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete confirmation */}
      <AlertDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Cooking?</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this cooking session as complete. This will be logged to your
              cooking history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Yet</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CookModeLayout>
  );
}
