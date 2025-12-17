"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCcw } from "lucide-react";

interface SubstitutionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Button to trigger AI substitution suggestions for a shopping list item
 */
export function SubstitutionButton({
  onClick,
  disabled,
  className,
}: SubstitutionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${className || ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          disabled={disabled}
        >
          <RefreshCcw className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Find substitutes
      </TooltipContent>
    </Tooltip>
  );
}
