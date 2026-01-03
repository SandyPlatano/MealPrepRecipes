"use client";

import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RecipeDetailNotesProps {
  notes: string | null;
}

export function RecipeDetailNotes({ notes }: RecipeDetailNotesProps) {
  if (!notes) return null;

  return (
    <Collapsible defaultOpen={false} className="flex flex-col gap-3">
      <CollapsibleTrigger className="flex items-center justify-between w-full group">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white">Notes</h3>
          <Separator className="flex-1" />
        </div>
        <ChevronDown className="size-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="prose prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {notes}
          </ReactMarkdown>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
