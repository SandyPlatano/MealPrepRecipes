"use client";

import { Fragment, memo } from "react";
import { cn } from "@/lib/utils";

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  className?: string;
  highlightClassName?: string;
}

/**
 * Highlights matching search terms within text.
 * Splits the text by the search term and wraps matches in a styled span.
 */
export const HighlightText = memo(function HighlightText({
  text,
  searchTerm,
  className,
  highlightClassName = "bg-yellow-200 dark:bg-yellow-800 text-foreground rounded-sm px-0.5",
}: HighlightTextProps) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create a case-insensitive regex to split by the search term
  const regex = new RegExp(`(${escapedSearchTerm})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();

        return (
          <Fragment key={index}>
            {isMatch ? (
              <mark className={cn("font-medium", highlightClassName)}>
                {part}
              </mark>
            ) : (
              part
            )}
          </Fragment>
        );
      })}
    </span>
  );
});
