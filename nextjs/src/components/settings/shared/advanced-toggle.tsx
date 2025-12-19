"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface AdvancedToggleProps {
  label?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AdvancedToggle({
  label = "Show Advanced Settings",
  defaultOpen = false,
  children,
  className,
}: AdvancedToggleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-between text-muted-foreground hover:text-foreground",
            "border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50",
            open && "border-solid border-primary/30 text-primary"
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="size-3.5" />
            {open ? "Hide Advanced Settings" : label}
          </span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
