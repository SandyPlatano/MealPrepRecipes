"use client";

/**
 * Cook Mode Scrollable View
 * Alternative navigation mode showing all steps at once with scroll
 * Features:
 * - All steps visible in a scrollable list
 * - Current step highlighting with IntersectionObserver
 * - Click to jump to step
 * - Progress indicator
 */

import { useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectTimers } from "@/lib/timer-detector";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CookModeScrollableViewProps {
  instructions: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onStartTimer: (minutes: number) => void;
  proseSizeClass: string;
  showTimers: boolean;
}

export function CookModeScrollableView({
  instructions,
  currentStep,
  onStepChange,
  onStartTimer,
  proseSizeClass,
  showTimers,
}: CookModeScrollableViewProps) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize refs array
  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, instructions.length);
  }, [instructions.length]);

  // Scroll to current step when it changes externally
  useEffect(() => {
    const stepElement = stepRefs.current[currentStep];
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  // IntersectionObserver to track which step is most visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        let maxRatio = 0;
        let mostVisibleStep = currentStep;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const index = stepRefs.current.findIndex(
              (ref) => ref === entry.target
            );
            if (index !== -1) {
              mostVisibleStep = index;
            }
          }
        });

        // Only update if significantly more visible
        if (maxRatio > 0.5 && mostVisibleStep !== currentStep) {
          onStepChange(mostVisibleStep);
        }
      },
      {
        root: containerRef.current,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [currentStep, onStepChange]);

  const handleStepClick = useCallback(
    (index: number) => {
      onStepChange(index);
      const stepElement = stepRefs.current[index];
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [onStepChange]
  );

  return (
    <div
      ref={containerRef}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scroll-smooth"
    >
      {instructions.map((instruction, index) => {
        const isCurrentStep = index === currentStep;
        const isCompleted = index < currentStep;
        const isFinalStep = index === instructions.length - 1;
        const detectedTimers = showTimers ? detectTimers(instruction) : [];

        return (
          <Card
            key={index}
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            className={cn(
              "p-6 cursor-pointer transition-all duration-200",
              isCurrentStep &&
                "ring-2 ring-primary shadow-lg bg-primary/5",
              isCompleted && "opacity-60 bg-muted/50",
              !isCurrentStep && !isCompleted && "hover:bg-muted/30"
            )}
            onClick={() => handleStepClick(index)}
          >
            <div className="space-y-3">
              {/* Step header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      isCurrentStep && "bg-primary text-primary-foreground",
                      isCompleted &&
                        "bg-green-500 text-white",
                      !isCurrentStep && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrentStep && "text-primary",
                      isCompleted && "text-muted-foreground"
                    )}
                  >
                    Step {index + 1}
                  </span>
                </div>
                {isFinalStep && (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    Final Step
                  </Badge>
                )}
              </div>

              {/* Instruction content */}
              <div
                className={cn(
                  "prose dark:prose-invert max-w-none",
                  proseSizeClass,
                  isCompleted && "line-through"
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {instruction}
                </ReactMarkdown>
              </div>

              {/* Timers */}
              {showTimers && detectedTimers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  {detectedTimers.map((timer, idx) => (
                    <Button
                      key={idx}
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartTimer(timer.minutes);
                      }}
                      className="gap-1"
                    >
                      <Timer className="h-3 w-3" />
                      {timer.displayText}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
