"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PEPPER_QUICK_ACTIONS, type PepperQuickAction } from "@/types/pepper";

interface PepperInputProps {
  onSend: (message: string) => void;
  onQuickAction: (action: PepperQuickAction) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function PepperInput({
  onSend,
  onQuickAction,
  isLoading,
  disabled = false,
}: PepperInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !isLoading && !disabled) {
      onSend(trimmed);
      setInput("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      {/* Quick action chips */}
      <div className="flex flex-wrap gap-1.5">
        {PEPPER_QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onQuickAction(action.id)}
            disabled={isLoading || disabled}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1",
              "text-xs font-medium rounded-md",
              "border border-black/20 dark:border-white/20",
              "bg-secondary/50 hover:bg-secondary",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span>{action.emoji}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div
          className={cn(
            "flex-1 relative",
            "rounded-lg",
            "border-2 border-black dark:border-white",
            "bg-background",
            "",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1"
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Pepper anything..."
            disabled={isLoading || disabled}
            rows={1}
            className={cn(
              "w-full resize-none",
              "px-3 py-2",
              "bg-transparent",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || disabled}
          size="icon"
          className="shrink-0"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
