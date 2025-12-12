"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Eye,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";
import { saveRecipe, unsaveRecipe } from "@/app/actions/community";
import type { TrendingRecipe } from "@/types/social";

interface TrendingCarouselProps {
  recipes: TrendingRecipe[];
  isAuthenticated?: boolean;
}

export function TrendingCarousel({
  recipes,
  isAuthenticated = false,
}: TrendingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>(
    recipes.reduce((acc, r) => ({ ...acc, [r.id]: r.is_saved }), {})
  );
  const [isPending, startTransition] = useTransition();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleSaveToggle = (recipeId: string) => {
    if (!isAuthenticated) {
      toast.error("Sign in to save recipes");
      return;
    }

    const newSavedState = !savedStates[recipeId];
    setSavedStates((prev) => ({ ...prev, [recipeId]: newSavedState }));

    startTransition(async () => {
      const result = newSavedState
        ? await saveRecipe(recipeId)
        : await unsaveRecipe(recipeId);

      if (result.error) {
        setSavedStates((prev) => ({ ...prev, [recipeId]: !newSavedState }));
        toast.error(result.error);
      } else {
        toast.success(newSavedState ? "Recipe saved!" : "Recipe unsaved");
      }
    });
  };

  if (recipes.length === 0) return null;

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hidden md:flex"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hidden md:flex"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-4 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {recipes.map((recipe, index) => (
          <Link
            key={recipe.id}
            href={`/discover/${recipe.id}`}
            className="shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <Card className="w-64 h-48 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative group/card">
              {/* Background Image */}
              {recipe.image_url ? (
                <Image
                  src={recipe.image_url}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Rank Badge */}
              <Badge
                className="absolute top-2 left-2 bg-orange-500 text-white border-0"
                variant="secondary"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                #{index + 1}
              </Badge>

              {/* Save Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveToggle(recipe.id);
                }}
                disabled={isPending}
              >
                {savedStates[recipe.id] ? (
                  <BookmarkCheck className="h-4 w-4 fill-current" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>

              {/* Content */}
              <CardContent className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-semibold line-clamp-1 mb-1">
                  {recipe.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5 border border-white/30">
                      <AvatarImage src={recipe.author.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-white/20">
                        {recipe.author.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white/80">
                      @{recipe.author.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Eye className="h-3 w-3" />
                    {recipe.view_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
