"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Clock, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
  tags?: string[];
  protein_type?: string | null;
}

interface RecipePickerCardProps {
  recipe: Recipe;
  isSelected: boolean;
  isFavorite: boolean;
  onToggle: () => void;
}

export function RecipePickerCard({
  recipe,
  isSelected,
  isFavorite,
  onToggle,
}: RecipePickerCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary",
        "relative overflow-hidden",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5"
      )}
      onClick={onToggle}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}

      {/* Favorite Badge */}
      {isFavorite && !isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      )}

      {/* Image */}
      <div className="relative w-full aspect-video bg-muted">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <CardContent className="p-2.5">
        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2 mb-1.5">
          {recipe.title}
        </h4>

        {/* Simple Meta Info - Recipe Type, Time, Protein */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {/* Recipe Type */}
          <span className="font-medium text-foreground">{recipe.recipe_type}</span>
          
          {/* Separator */}
          {(recipe.prep_time || recipe.cook_time || recipe.protein_type) && (
            <span className="text-muted-foreground/50">•</span>
          )}

          {/* Time - Show cook_time if available, otherwise prep_time */}
          {(recipe.prep_time || recipe.cook_time) && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{recipe.cook_time || recipe.prep_time}</span>
            </div>
          )}

          {/* Protein Type */}
          {recipe.protein_type && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{recipe.protein_type}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

