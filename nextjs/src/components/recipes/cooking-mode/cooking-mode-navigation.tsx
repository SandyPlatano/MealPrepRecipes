import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

interface CookingModeNavigationProps {
  currentStep: number;
  totalSteps: number;
  recipeId: string;
  basePath: string;
  onPrevStep: () => void;
  onNextStep: () => void;
  onNavigate: (path: string) => void;
}

const handleNavigate = (path: string, navigate: (p: string) => void) => {
  navigate(path);
};

export function CookingModeNavigation({
  currentStep,
  totalSteps,
  recipeId,
  basePath,
  onPrevStep,
  onNextStep,
  onNavigate,
}: CookingModeNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === totalSteps - 1;

  const handleDone = () => {
    toast.success("Great job! Enjoy your meal!");
    onNavigate(`${basePath}/recipes/${recipeId}`);
  };

  return (
    <>
      {/* Step Navigation */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevStep}
          disabled={isFirstStep}
          className="flex-1 h-16 text-base rounded-xl border border-gray-200"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>
        <Button
          size="lg"
          onClick={onNextStep}
          disabled={isFinalStep}
          className="flex-1 h-16 text-base rounded-xl bg-[#D9F99D] text-[#1A1A1A] hover:bg-[#D9F99D]/90 shadow-md active:scale-[0.98] transition-all"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Done Button */}
      {isFinalStep && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleDone}
        >
          <Check className="h-5 w-5 mr-2" />
          Done Cooking!
        </Button>
      )}
    </>
  );
}
