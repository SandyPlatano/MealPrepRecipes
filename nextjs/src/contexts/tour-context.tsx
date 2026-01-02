"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
}

interface TourContextValue {
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Current step data */
  currentStepData: TourStep | null;
  /** Total number of steps */
  totalSteps: number;
  /** Start the tour */
  startTour: () => void;
  /** Go to the next step */
  nextStep: () => void;
  /** Skip the tour entirely */
  skipTour: () => void;
  /** Complete the tour (called on last step) */
  completeTour: () => void;
  /** Whether the tour has been completed before */
  hasCompletedTour: boolean;
}

// ============================================================================
// Tour Steps Configuration
// ============================================================================

export const TOUR_STEPS: TourStep[] = [
  {
    id: "recipes",
    target: '[data-tour="recipes-nav"]',
    title: "Your Recipe Collection",
    description: "Browse, search, and organize all your recipes here. Star favorites for quick access.",
    placement: "right",
  },
  {
    id: "planner",
    target: '[data-tour="planner-nav"]',
    title: "Plan Your Week",
    description: "Drag recipes onto days to build your meal plan. Assign cooks to share the work.",
    placement: "right",
  },
  {
    id: "shopping",
    target: '[data-tour="shopping-nav"]',
    title: "Smart Shopping List",
    description: "Auto-generated from your meal plan. Check off items as you shop.",
    placement: "right",
  },
  {
    id: "command",
    target: '[data-tour="command-trigger"]',
    title: "Quick Search",
    description: "Press ⌘K anytime to search recipes, navigate, or take quick actions.",
    placement: "bottom",
  },
];

// ============================================================================
// Storage
// ============================================================================

const TOUR_STORAGE_KEY = "app_tour_completed";

function getTourCompletedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setTourCompletedInStorage(completed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, completed ? "true" : "false");
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Context
// ============================================================================

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface TourProviderProps {
  children: ReactNode;
  /** Auto-start tour for new users (default: true) */
  autoStart?: boolean;
}

export function TourProvider({ children, autoStart = true }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(true); // Default true to prevent flash

  // Load completion state on mount
  useEffect(() => {
    const completed = getTourCompletedFromStorage();
    setHasCompletedTour(completed);

    // Auto-start for new users after a short delay (let UI settle)
    if (autoStart && !completed) {
      const timeout = setTimeout(() => {
        setIsActive(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [autoStart]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step - complete the tour
      setIsActive(false);
      setHasCompletedTour(true);
      setTourCompletedInStorage(true);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    setTourCompletedInStorage(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
    setTourCompletedInStorage(true);
  }, []);

  const currentStepData = isActive ? TOUR_STEPS[currentStep] : null;

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        currentStepData,
        totalSteps: TOUR_STEPS.length,
        startTour,
        nextStep,
        skipTour,
        completeTour,
        hasCompletedTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
