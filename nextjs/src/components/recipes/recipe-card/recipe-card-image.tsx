import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Clock, Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { RecipeWithFavoriteAndNutrition } from "@/types/recipe";

interface RecipeCardImageProps {
  recipe: RecipeWithFavoriteAndNutrition;
  totalTime: string;
  currentRating: number | null;
  onRatingClick: (e: React.MouseEvent) => void;
}

export function RecipeCardImage({
  recipe,
  totalTime,
  currentRating,
  onRatingClick,
}: RecipeCardImageProps) {
  const isNew =
    recipe.created_at &&
    Date.now() - new Date(recipe.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-t-2xl">
      {recipe.image_url ? (
        <Image
          src={recipe.image_url}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMiMVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAQEBAAAAAAAAAAAAAAAAAQIDEUH/2gAMAwEAAhEDEQA/ALTce5Nw6XfRWOnWtjJAkccjGaN2LFhnHDDjgce/dSX9x73/AGb/AHfz/Sla1FNRlpHD9J//2Q=="
        />
      ) : (
        /* Placeholder for cards without images - warm gradient with pattern */
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F5F5F5] via-[#EEEEEE] to-[#E8E8E8]">
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="size-8 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* NEW Badge - for recently added recipes (last 7 days) */}
      {isNew && (
        <div className="absolute top-2 left-2 z-10">
          <Badge
            variant="default"
            className="bg-[#D9F99D] hover:bg-[#D9F99D] text-[#1A1A1A] text-[10px] px-1.5 py-0.5 font-semibold shadow-sm"
          >
            NEW
          </Badge>
        </div>
      )}

      {/* Floating Badges - Bottom of image */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
        {/* Time Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-[11px] font-medium">
          <Clock className="size-3" />
          {totalTime}
        </div>
        {/* Rating Badge - Click to review */}
        <button
          onClick={onRatingClick}
          className="flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-black text-[11px] font-medium shadow-sm hover:bg-white transition-colors"
        >
          <Star
            className={
              currentRating
                ? "size-3 fill-amber-400 text-amber-400"
                : "size-3 text-muted-foreground/60"
            }
          />
          {currentRating && currentRating.toFixed(1)}
        </button>
      </div>
    </AspectRatio>
  );
}
