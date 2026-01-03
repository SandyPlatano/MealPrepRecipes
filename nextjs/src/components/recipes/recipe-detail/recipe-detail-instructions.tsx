"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RecipeDetailInstructionsProps {
  instructions: string[];
  completedSteps: Set<number>;
  onToggleStepCompletion: (index: number) => void;
}

export function RecipeDetailInstructions({
  instructions,
  completedSteps,
  onToggleStepCompletion,
}: RecipeDetailInstructionsProps) {
  const completedCount = completedSteps.size;
  const totalSteps = instructions.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Title Row with visual hierarchy */}
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white whitespace-nowrap">Instructions</h3>
        <Badge className="bg-[#D9F99D]/20 text-[#1A1A1A] dark:text-white border-0 text-xs">
          {completedCount}/{totalSteps} steps
        </Badge>
        <Separator className="flex-1" />
      </div>

      {/* Progress Bar */}
      {completedCount > 0 && (
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {progressPercent}% done
          </span>
        </div>
      )}

      {/* Timeline step cards */}
      <ol className="flex flex-col gap-0">
        {instructions.map((instruction, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrentStep = !isCompleted && (index === 0 || completedSteps.has(index - 1));

          return (
            <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Connector line */}
              {index < instructions.length - 1 && (
                <div
                  className={`absolute left-[1.1875rem] top-12 bottom-0 w-0.5 transition-colors ${
                    isCompleted ? "bg-[#D9F99D]" : "bg-[#D9F99D]/40"
                  }`}
                />
              )}
              {/* Step number - clickable */}
              <button
                onClick={() => onToggleStepCompletion(index)}
                className={`flex-shrink-0 size-10 rounded-full font-bold flex items-center justify-center z-10 shadow-sm transition-all ${
                  isCompleted
                    ? "bg-[#D9F99D] text-[#1A1A1A]"
                    : isCurrentStep
                    ? "bg-[#D9F99D] text-[#1A1A1A] ring-2 ring-[#D9F99D] ring-offset-2"
                    : "bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400"
                }`}
                aria-label={isCompleted ? `Mark step ${index + 1} as incomplete` : `Mark step ${index + 1} as complete`}
              >
                {isCompleted ? <Check className="size-5" /> : index + 1}
              </button>
              {/* Step content card */}
              <div
                className={`flex-1 rounded-xl border p-4 shadow-sm transition-all cursor-pointer ${
                  isCompleted
                    ? "bg-[#D9F99D]/10 border-[#D9F99D]/30 dark:bg-[#D9F99D]/5"
                    : isCurrentStep
                    ? "bg-white dark:bg-slate-700 border-[#D9F99D] dark:border-[#D9F99D]"
                    : "bg-white dark:bg-slate-700 border-gray-100 dark:border-gray-600"
                }`}
                onClick={() => onToggleStepCompletion(index)}
              >
                <div
                  className={`prose prose-base dark:prose-invert max-w-none leading-relaxed ${
                    isCompleted ? "opacity-60 line-through decoration-[#D9F99D]/50" : ""
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {instruction}
                  </ReactMarkdown>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
