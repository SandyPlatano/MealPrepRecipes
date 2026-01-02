"use client";

import { useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuickCartInputProps {
  onAdd: (text: string) => void;
  disabled?: boolean;
}

export function QuickCartInput({ onAdd, disabled }: QuickCartInputProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!value.trim() || disabled || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await onAdd(value.trim());
        setValue("");
      } finally {
        setIsSubmitting(false);
      }
    },
    [value, onAdd, disabled, isSubmitting]
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add item (e.g., 2 cups flour)"
        disabled={disabled || isSubmitting}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim() || disabled || isSubmitting}
        className="shrink-0 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        <span className="sr-only">Add item</span>
      </Button>
    </form>
  );
}
