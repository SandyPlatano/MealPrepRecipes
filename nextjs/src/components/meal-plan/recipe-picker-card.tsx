"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Clock } from "lucide-react";
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
            <div className="text-6xl opacity-20">🍽️</div>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {/* Title */}
        <h4 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
          {recipe.title}
        </h4>

        {/* Meta Info */}
        <div className="space-y-1.5">
          {/* Recipe Type */}
          <Badge variant="secondary" className="text-xs">
            {recipe.recipe_type}
          </Badge>

          {/* Prep Time */}
          {recipe.prep_time && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{recipe.prep_time}</span>
            </div>
          )}

          {/* Category */}
          {recipe.category && (
            <p className="text-xs text-muted-foreground truncate">
              {recipe.category}
            </p>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                +{recipe.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

