import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { detectTimers } from "@/lib/timer-detector";

interface CookingModeStepProps {
  stepNumber: number;
  totalSteps: number;
  stepText: string;
  showTimers: boolean;
  quickTimerPresets: number[];
  isSwiping: boolean;
  transitionClass: string;
  proseSizeClass: string;
  onStartTimer: (minutes: number) => void;
  onTap?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  swipeRef?: React.RefObject<HTMLDivElement>;
}

export function CookingModeStep({
  stepNumber,
  totalSteps,
  stepText,
  showTimers,
  quickTimerPresets,
  isSwiping,
  transitionClass,
  proseSizeClass,
  onStartTimer,
  onTap,
  onTouchStart,
  onTouchEnd,
  swipeRef,
}: CookingModeStepProps) {
  const isFinalStep = stepNumber === totalSteps;

  return (
    <div
      ref={swipeRef}
      onClick={onTap}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onTouchStart}
      onMouseUp={onTouchEnd}
    >
      <Card className={cn(
        "p-8 lg:p-12",
        isSwiping && "opacity-90 scale-[0.99] transition-transform",
        transitionClass
      )}>
        <div className="flex flex-col">
          {/* Step Number Hero */}
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "flex-shrink-0",
                "w-16 h-16 lg:w-20 lg:h-20",
                "rounded-2xl lg:rounded-3xl",
                "bg-[#D9F99D]",
                "text-[#1A1A1A]",
                "flex items-center justify-center",
                "text-2xl lg:text-3xl font-bold font-mono",
                "shadow-lg shadow-lime-200/30",
                isFinalStep && "ring-4 ring-lime-300/40"
              )}
            >
              {stepNumber}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                Step
              </span>
              <div className="flex items-center gap-3">
                <span className="text-lg lg:text-xl font-semibold">
                  {stepNumber} of {totalSteps}
                </span>
                {isFinalStep && (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    Final
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className={cn("prose dark:prose-invert max-w-none prose-p:leading-relaxed", proseSizeClass)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {stepText}
            </ReactMarkdown>
          </div>

          {/* Timer Section */}
          {showTimers && (
            <>
              {/* Auto-detected Timers */}
              {(() => {
                const detectedTimers = detectTimers(stepText);
                return detectedTimers.length > 0 ? (
                  <div className="flex flex-wrap gap-4 mt-10 pt-8 border-t">
                    <span className="text-muted-foreground mr-2">
                      Detected timers:
                    </span>
                    {detectedTimers.map((timer, idx) => (
                      <Button
                        key={idx}
                        variant="default"
                        onClick={() => onStartTimer(timer.minutes)}
                        className="gap-2"
                      >
                        <Timer className="h-4 w-4" />
                        {timer.displayText}
                      </Button>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Quick Timer Buttons */}
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
                <span className="text-muted-foreground mr-2">Quick timers:</span>
                {quickTimerPresets.map((mins) => (
                  <Button
                    key={mins}
                    variant="outline"
                    onClick={() => onStartTimer(mins)}
                  >
                    {mins} min
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
