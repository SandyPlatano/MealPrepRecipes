"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, X, Clock, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MealAssignmentWithRecipe } from "@/types/meal-plan";
import type { RecipeNutrition } from "@/types/nutrition";

interface MealCellProps {
  assignment: MealAssignmentWithRecipe;
  cookNames: string[];
  onUpdateCook: (assignmentId: string, cook: string | null) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  isDragging?: boolean;
  nutrition?: RecipeNutrition | null;
}

export function MealCell({
  assignment,
  cookNames,
  onUpdateCook,
  onRemove,
  isDragging = false,
  nutrition = null,
}: MealCellProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: assignment.id,
    data: {
      type: "meal",
      assignment,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCookChange = async (value: string) => {
    setIsUpdating(true);
    try {
      await onUpdateCook(assignment.id, value === "none" ? null : value);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(assignment.id);
    } finally {
      setIsRemoving(false);
    }
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const defaultColors = [
    "#3b82f6",
    "#a855f7",
    "#10b981",
    "#f59e0b",
    "#ec4899",
  ];

  // Calculate relative luminance (0-1)
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((val) => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio between two colors
  const getContrastRatio = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ) => {
    const lum1 = getLuminance(color1.r, color1.g, color1.b);
    const lum2 = getLuminance(color2.r, color2.g, color2.b);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  const blendWithBackground = (
    color: { r: number; g: number; b: number },
    opacity: number,
    bgColor: { r: number; g: number; b: number }
  ) => {
    return {
      r: Math.round(color.r * opacity + bgColor.r * (1 - opacity)),
      g: Math.round(color.g * opacity + bgColor.g * (1 - opacity)),
      b: Math.round(color.b * opacity + bgColor.b * (1 - opacity)),
    };
  };

  const toRgba = (color: { r: number; g: number; b: number }, opacity: number) =>
    `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;

  // Get cook color for visual distinction with contrast safety
  const getCookColorStyle = (cook: string | null) => {
    if (!cook) return {};

    let hex = "";
    const index = cookNames.indexOf(cook);
    hex = index >= 0 ? defaultColors[index % defaultColors.length] : defaultColors[0];

    const colorRgb = hexToRgb(hex);
    const bgOpacity = 0.16;
    const borderOpacity = 0.32;

    const baseBgLight = { r: 255, g: 255, b: 255 };
    const baseBgDark = { r: 17, g: 17, b: 23 };

    const effectiveBgLight = blendWithBackground(colorRgb, bgOpacity, baseBgLight);
    const effectiveBgDark = blendWithBackground(colorRgb, bgOpacity, baseBgDark);

    const black = { r: 17, g: 17, b: 23 };
    const white = { r: 255, g: 255, b: 255 };

    const contrastWhiteLight = getContrastRatio(effectiveBgLight, white);
    const contrastWhiteDark = getContrastRatio(effectiveBgDark, white);
    const contrastBlackLight = getContrastRatio(effectiveBgLight, black);
    const contrastBlackDark = getContrastRatio(effectiveBgDark, black);

    const minContrastWhite = Math.min(contrastWhiteLight, contrastWhiteDark);
    const minContrastBlack = Math.min(contrastBlackLight, contrastBlackDark);

    let textColor: string;
    if (minContrastWhite >= 4.5 || minContrastWhite > minContrastBlack) {
      textColor = "#ffffff";
    } else if (minContrastBlack >= 4.5) {
      textColor = "#0f172a";
    } else {
      textColor = minContrastWhite > minContrastBlack ? "#ffffff" : "#0f172a";
    }

    return {
      backgroundColor: toRgba(colorRgb, bgOpacity),
      color: textColor,
      borderColor: toRgba(colorRgb, borderOpacity),
    };
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border rounded-lg p-3 transition-all",
        "hover:shadow-md hover:border-primary/30",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg scale-105",
        isRemoving && "opacity-50"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Content */}
      <div className="pl-4 pr-6">
        {/* Recipe Title */}
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="font-medium text-sm truncate cursor-default">
              {assignment.recipe.title}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{assignment.recipe.title}</p>
            <p className="text-xs text-muted-foreground">
              {assignment.recipe.recipe_type}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Prep Time and Nutrition */}
        <div className="mt-0.5 flex items-center gap-2 flex-wrap">
          {assignment.recipe.prep_time && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {assignment.recipe.prep_time}
            </span>
          )}
          {nutrition && (
            <>
              {nutrition.calories && (
                <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
                  {Math.round(nutrition.calories)} cal
                </Badge>
              )}
              {nutrition.protein_g && (
                <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
                  {Math.round(nutrition.protein_g)}g protein
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Cook Selector */}
        <div className="mt-2">
          <Select
            value={assignment.cook || "none"}
            onValueChange={handleCookChange}
            disabled={isUpdating}
          >
            <SelectTrigger
              className="h-7 text-xs"
              style={getCookColorStyle(assignment.cook)}
            >
              <ChefHat className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Assign cook" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No cook</SelectItem>
              {cookNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Overlay version for drag preview
export function MealCellOverlay({
  assignment,
}: {
  assignment: MealAssignmentWithRecipe;
}) {
  return (
    <div className="bg-card border-2 border-primary rounded-lg p-3 shadow-xl opacity-90 w-48">
      <p className="font-medium text-sm truncate">{assignment.recipe.title}</p>
      <p className="text-xs text-muted-foreground">
        {assignment.recipe.recipe_type}
      </p>
      {assignment.cook && (
        <p className="text-xs mt-1 flex items-center gap-1">
          <ChefHat className="h-3 w-3" />
          {assignment.cook}
        </p>
      )}
    </div>
  );
}

