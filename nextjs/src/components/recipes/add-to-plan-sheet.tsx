"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, Clock, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeWithFavorite } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";
import { DAYS_OF_WEEK } from "@/types/meal-plan";
import Image from "next/image";

interface AddToPlanSheetProps {
  recipe: RecipeWithFavorite | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (day: DayOfWeek, cook: string | null) => void;
}

const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

export function AddToPlanSheet({
  recipe,
  isOpen,
  onClose,
  onAdd,
}: AddToPlanSheetProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [selectedCook, setSelectedCook] = useState<string | null>(null);
  const [cookNames, setCookNames] = useState<string[]>([]);
  const [cookColors, setCookColors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);

  // Load cook names from user settings (localStorage)
  useEffect(() => {
    const stored = localStorage.getItem("user-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (settings.cook_names && settings.cook_names.length > 0) {
          setCookNames(settings.cook_names);
        }
        if (settings.cook_colors) {
          setCookColors(settings.cook_colors);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedDay(null);
      setSelectedCook(null);
      setIsAdding(false);
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!selectedDay) return;
    setIsAdding(true);
    try {
      onAdd(selectedDay, selectedCook);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
          "animate-in fade-in duration-200"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "h-[70vh] max-h-[70vh]",
          "bg-background rounded-t-2xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          "flex flex-col"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={onClose}
            className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
            aria-label="Close"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Add to Plan</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onClose}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Recipe Preview */}
          <div className="flex items-center gap-3 p-3 mb-4 bg-muted/50 rounded-xl">
            {recipe.image_url && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base truncate">{recipe.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {recipe.recipe_type}
                </Badge>
                {recipe.prep_time && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.prep_time}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Day Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Select Day <span className="text-destructive">*</span>
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DAYS_OF_WEEK.slice(0, 4).map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-12 text-sm font-medium",
                    selectedDay === day && "shadow-md"
                  )}
                  onClick={() => setSelectedDay(day)}
                >
                  {DAY_ABBREVIATIONS[day]}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DAYS_OF_WEEK.slice(4).map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-12 text-sm font-medium",
                    selectedDay === day && "shadow-md"
                  )}
                  onClick={() => setSelectedDay(day)}
                >
                  {DAY_ABBREVIATIONS[day]}
                </Button>
              ))}
            </div>
          </div>

          {/* Cook Selection */}
          {cookNames.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Who&apos;s Cooking? <span className="text-muted-foreground/60">(optional)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {cookNames.map((cook) => (
                  <Button
                    key={cook}
                    variant={selectedCook === cook ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-10 px-4 text-sm font-medium gap-2",
                      selectedCook === cook && "shadow-md"
                    )}
                    style={
                      selectedCook === cook && cookColors[cook]
                        ? { backgroundColor: cookColors[cook], borderColor: cookColors[cook] }
                        : undefined
                    }
                    onClick={() => setSelectedCook(cook)}
                  >
                    <User className="h-4 w-4" />
                    {cook}
                  </Button>
                ))}
                <Button
                  variant={selectedCook === null ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-10 px-4 text-sm font-medium",
                    selectedCook === null && "ring-1 ring-border"
                  )}
                  onClick={() => setSelectedCook(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  None
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-4 bg-background">
          <Button
            className="w-full h-12 text-base font-medium"
            disabled={!selectedDay || isAdding}
            onClick={handleAdd}
          >
            {isAdding ? "Adding..." : selectedDay ? `Add to ${selectedDay}` : "Select a day"}
          </Button>
        </div>
      </div>
    </>
  );
}
