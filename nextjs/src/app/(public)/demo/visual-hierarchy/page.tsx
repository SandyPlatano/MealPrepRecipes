"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Clock,
  Users,
  Plus,
  ChefHat,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type VisualStyle = "current" | "elevated" | "tinted" | "bordered" | "combined";

const SAMPLE_RECIPES = [
  {
    id: "1",
    title: "Honey Garlic Chicken",
    type: "Dinner",
    time: "35 min",
    servings: 4,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "Mediterranean Pasta",
    type: "Dinner",
    time: "25 min",
    servings: 4,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "Thai Basil Stir Fry",
    type: "Dinner",
    time: "20 min",
    servings: 2,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1562967916-eb82221dfb44?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "Lemon Herb Salmon",
    type: "Dinner",
    time: "30 min",
    servings: 2,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },
];

const STYLE_INFO: Record<VisualStyle, { name: string; description: string }> = {
  current: {
    name: "Current Design",
    description: "Your existing design - warm off-white background, subtle shadows",
  },
  elevated: {
    name: "A) Elevated Cards",
    description: "Same warm background, but cards have much stronger shadows (floating paper effect)",
  },
  tinted: {
    name: "B) Tinted Background",
    description: "Slightly darker/grayer background so white cards naturally pop",
  },
  bordered: {
    name: "C) Bold Borders",
    description: "Colored left border accent on cards, subtle ring glow on hover",
  },
  combined: {
    name: "D) Combined (Recommended)",
    description: "3-tier depth: tinted page → day containers → elevated recipe cards with accents",
  },
};

export default function VisualHierarchyDemo() {
  const [style, setStyle] = useState<VisualStyle>("current");

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        // Background color based on style
        style === "current" && "bg-[#FFFCF6]",
        style === "elevated" && "bg-[#FFFCF6]",
        style === "tinted" && "bg-[#F0F0EB]",
        style === "bordered" && "bg-[#FFFCF6]",
        style === "combined" && "bg-[#F5F5F0]"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Visual Hierarchy Demo</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Compare different approaches to make recipe cards pop
          </p>

          {/* Style Selector */}
          <Tabs value={style} onValueChange={(v) => setStyle(v as VisualStyle)}>
            <TabsList className="grid grid-cols-5 w-full max-w-3xl">
              <TabsTrigger value="current" className="text-xs">Current</TabsTrigger>
              <TabsTrigger value="elevated" className="text-xs">A) Elevated</TabsTrigger>
              <TabsTrigger value="tinted" className="text-xs">B) Tinted BG</TabsTrigger>
              <TabsTrigger value="bordered" className="text-xs">C) Borders</TabsTrigger>
              <TabsTrigger value="combined" className="text-xs">D) Combined</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Style Description */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-sm">{STYLE_INFO[style].name}</p>
            <p className="text-xs text-muted-foreground">{STYLE_INFO[style].description}</p>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Day Row Demo */}
        <DayRowDemo style={style} day="Monday" date={15} />
        <DayRowDemo style={style} day="Tuesday" date={16} />

        {/* Recipe Grid Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recipe Grid View</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_RECIPES.map((recipe, index) => (
              <RecipeCardDemo
                key={recipe.id}
                recipe={recipe}
                style={style}
                animationDelay={index * 50}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface DayRowDemoProps {
  style: VisualStyle;
  day: string;
  date: number;
}

function DayRowDemo({ style, day, date }: DayRowDemoProps) {
  const recipes = SAMPLE_RECIPES.slice(0, 2);

  return (
    <section>
      <Card
        className={cn(
          "transition-all duration-300",
          // Day container styling based on approach
          style === "current" && "bg-white border-gray-200 shadow-sm",
          style === "elevated" && "bg-white border-gray-200 shadow-sm",
          style === "tinted" && "bg-[#FAFAF8] border-gray-200/50 shadow-sm",
          style === "bordered" && "bg-white border-gray-200 shadow-sm",
          style === "combined" && "bg-[#FAFAF8] border-gray-100 shadow-md"
        )}
      >
        <CardContent className="p-4 md:p-6">
          {/* Day Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-xl",
                  style === "combined" ? "bg-[#D9F99D]/30 text-[#1A1A1A]" : "bg-gray-100"
                )}
              >
                <span className="text-xl font-bold">{date}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {day.slice(0, 3)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{day}</h3>
                <p className="text-sm text-muted-foreground">2 meals planned</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                style === "combined" && "border-[#D9F99D] hover:bg-[#D9F99D]/20"
              )}
            >
              <Plus className="size-4 mr-1" />
              Add Meal
            </Button>
          </div>

          {/* Recipe Cards in Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe, index) => (
              <MiniRecipeCard
                key={recipe.id}
                recipe={recipe}
                style={style}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface MiniRecipeCardProps {
  recipe: (typeof SAMPLE_RECIPES)[0];
  style: VisualStyle;
  index: number;
}

function MiniRecipeCard({ recipe, style, index }: MiniRecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer",
        // Base styles per approach
        style === "current" && "bg-gray-50 hover:bg-gray-100 border border-gray-200",
        style === "elevated" && [
          "bg-white border border-gray-200",
          "shadow-md hover:shadow-xl hover:-translate-y-0.5",
        ],
        style === "tinted" && "bg-white border border-gray-100 shadow-sm hover:shadow-md",
        style === "bordered" && [
          "bg-white border border-gray-200",
          "border-l-4 border-l-[#D9F99D]",
          "hover:ring-2 hover:ring-[#D9F99D]/50",
        ],
        style === "combined" && [
          "bg-white border border-gray-100",
          "border-l-4 border-l-[#D9F99D]",
          "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
          "hover:ring-2 hover:ring-[#D9F99D]/30",
        ]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative size-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{recipe.title}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {recipe.time}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {recipe.servings}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 hover:bg-red-50 hover:text-red-500"
        >
          <Heart className="size-4" />
        </Button>
      </div>
    </div>
  );
}

interface RecipeCardDemoProps {
  recipe: (typeof SAMPLE_RECIPES)[0];
  style: VisualStyle;
  animationDelay: number;
}

function RecipeCardDemo({ recipe, style, animationDelay }: RecipeCardDemoProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 cursor-pointer",
        // Card styles per approach
        style === "current" && [
          "bg-white border-gray-200/80 shadow-sm",
          "hover:shadow-md hover:-translate-y-1",
        ],
        style === "elevated" && [
          "bg-white border-gray-200",
          "shadow-xl hover:shadow-2xl hover:-translate-y-2",
          "ring-1 ring-gray-100",
        ],
        style === "tinted" && [
          "bg-white border-gray-100",
          "shadow-md hover:shadow-lg hover:-translate-y-1",
        ],
        style === "bordered" && [
          "bg-white border-gray-200",
          "shadow-sm hover:shadow-md",
          "ring-2 ring-transparent hover:ring-[#D9F99D]",
          "border-b-4 border-b-[#D9F99D]",
        ],
        style === "combined" && [
          "bg-white border-gray-100",
          "shadow-xl hover:shadow-2xl hover:-translate-y-2",
          "ring-1 ring-gray-100 hover:ring-[#D9F99D]/50",
          "border-l-4 border-l-[#D9F99D]",
        ]
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Floating badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge className="bg-black/60 text-white backdrop-blur-sm">
            <Clock className="size-3 mr-1" />
            {recipe.time}
          </Badge>
          <Badge className="bg-white/90 text-black shadow-sm">
            <Star className="size-3 fill-amber-400 text-amber-400 mr-1" />
            {recipe.rating}
          </Badge>
        </div>

        {/* NEW badge for demo */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-[#D9F99D] text-[#1A1A1A] text-[10px] font-semibold">
            NEW
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{recipe.title}</h3>

        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            <UtensilsCrossed className="size-3 mr-1" />
            {recipe.type}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="size-3" />
            {recipe.servings} servings
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            className={cn(
              "flex-1 rounded-full font-medium",
              style === "combined" || style === "bordered"
                ? "bg-[#1A1A1A] hover:bg-[#333] text-white"
                : "bg-[#1A1A1A] hover:bg-[#333] text-white"
            )}
          >
            Add to Plan
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full shrink-0",
              isFavorite && "bg-red-50 border-red-200 text-red-500"
            )}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn("size-5", isFavorite && "fill-red-500")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
