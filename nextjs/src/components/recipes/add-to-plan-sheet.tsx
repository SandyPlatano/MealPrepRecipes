"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronDown, Clock, Minus, Plus, User, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeWithFavorite } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";
import { DAYS_OF_WEEK } from "@/types/meal-plan";
import Image from "next/image";

interface AddToPlanSheetProps {
  recipe: RecipeWithFavorite | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (day: DayOfWeek, cook: string | null, servingSize: number | null) => void;
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
  const [servingSize, setServingSize] = useState<number>(2);
  const [defaultServingSize, setDefaultServingSize] = useState<number>(2);
  const [cookNames, setCookNames] = useState<string[]>([]);
  const [cookColors, setCookColors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track mount state for portal (SSR compatibility)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Load cook names and default serving size from user settings (localStorage)
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
        // Load default serving size from preferences
        if (settings.preferences?.recipe?.defaultServingSize) {
          setDefaultServingSize(settings.preferences.recipe.defaultServingSize);
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

  // Initialize serving size when recipe changes or sheet opens
  useEffect(() => {
    if (isOpen && recipe) {
      // Use recipe's base_servings if available, otherwise use default
      const initialServings = recipe.base_servings ?? defaultServingSize;
      setServingSize(initialServings);
    }
  }, [isOpen, recipe, defaultServingSize]);

  const handleAdd = async () => {
    if (!selectedDay) return;
    setIsAdding(true);
    try {
      onAdd(selectedDay, selectedCook, servingSize > 0 ? servingSize : null);
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  // Increment/decrement serving size
  const incrementServings = () => setServingSize((prev) => prev + 1);
  const decrementServings = () => setServingSize((prev) => Math.max(1, prev - 1));

  // Don't render if not mounted (SSR), not open, or no recipe
  if (!mounted || !isOpen || !recipe) return null;

  // Use portal to render at body level (avoids stacking context issues)
  return createPortal(
    <>
      {/* Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm",
          "animate-in fade-in duration-200"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[101]",
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

          {/* Serving Size Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              <Users className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
              Servings
              {recipe.base_servings && (
                <span className="text-muted-foreground/60 ml-1">
                  (recipe makes {recipe.base_servings})
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={decrementServings}
                disabled={servingSize <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                value={servingSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setServingSize(val);
                  }
                }}
                className="h-10 w-20 text-center text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={incrementServings}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">servings</span>
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
    </>,
    document.body
  );
}
