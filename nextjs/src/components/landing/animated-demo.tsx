"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Check,
  ShoppingCart,
  Plus,
  ChefHat,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";

// Animated Recipe Card Demo
export function RecipeCardDemo() {
  const [isAdded, setIsAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    // Initial animation
    timeouts.push(setTimeout(() => setIsFavorite(true), 1000));
    timeouts.push(setTimeout(() => setIsAdded(true), 2500));

    const interval = setInterval(() => {
      // Cycle through states
      timeouts.push(setTimeout(() => setIsFavorite(true), 0));
      timeouts.push(setTimeout(() => setIsAdded(true), 1500));
      timeouts.push(setTimeout(() => {
        setIsFavorite(false);
        setIsAdded(false);
      }, 4000));
    }, 5000);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative">
      {/* Browser Frame */}
      <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-background">
          <Card className="max-w-sm mx-auto transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Garlic Butter Salmon</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <UtensilsCrossed className="h-3 w-3" />
                    Dinner • 25 min
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all duration-300 ${
                    isFavorite ? "text-red-500 scale-110" : ""
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 transition-all duration-300 ${
                      isFavorite ? "fill-current" : ""
                    }`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Salmon, butter, garlic, lemon, parsley...
              </p>
              <Button
                className={`w-full transition-all duration-300 ${
                  isAdded
                    ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                    : ""
                }`}
                variant={isAdded ? "outline" : "default"}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Plan
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Animated Meal Planning Demo
export function MealPlanDemo() {
  const [assignments, setAssignments] = useState<Record<string, { cook: string; day: string }>>({});

  const meals = [
    { name: "Garlic Salmon", icon: "🐟" },
    { name: "Chicken Stir Fry", icon: "🍗" },
    { name: "Pasta Primavera", icon: "🍝" },
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const steps = [
      () => setAssignments({ "0": { cook: "Sarah", day: "Monday" } }),
      () => setAssignments({ "0": { cook: "Sarah", day: "Monday" }, "1": { cook: "Mike", day: "Wednesday" } }),
      () => setAssignments({ "0": { cook: "Sarah", day: "Monday" }, "1": { cook: "Mike", day: "Wednesday" }, "2": { cook: "Sarah", day: "Friday" } }),
      () => setAssignments({}),
    ];

    const runAnimation = () => {
      steps.forEach((stepFn, i) => {
        timeouts.push(setTimeout(stepFn, i * 1200));
      });
    };

    runAnimation();
    const interval = setInterval(runAnimation, 6000);
    
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative">
      <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        <div className="p-6 bg-background">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Week of Dec 2
            </h3>
            <Badge variant="secondary">3 meals planned</Badge>
          </div>

          <div className="space-y-3">
            {meals.map((meal, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border bg-card transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meal.icon}</span>
                  <span className="font-medium text-sm">{meal.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {assignments[String(i)] ? (
                    <>
                      <Badge
                        variant="outline"
                        className="transition-all duration-300 animate-in fade-in slide-in-from-right-2"
                      >
                        <ChefHat className="h-3 w-3 mr-1" />
                        {assignments[String(i)].cook}
                      </Badge>
                      <Badge className="transition-all duration-300 animate-in fade-in slide-in-from-right-2">
                        {assignments[String(i)].day}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Assign →</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated Shopping List Demo
export function ShoppingListDemo() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const items = [
    { name: "Salmon fillets (4)", aisle: "Seafood" },
    { name: "Garlic (1 head)", aisle: "Produce" },
    { name: "Butter (1 stick)", aisle: "Dairy" },
    { name: "Chicken breast (2 lbs)", aisle: "Meat" },
    { name: "Soy sauce", aisle: "Asian" },
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const runAnimation = () => {
      setCheckedItems([]);
      timeouts.push(setTimeout(() => setCheckedItems([0]), 800));
      timeouts.push(setTimeout(() => setCheckedItems([0, 1]), 1600));
      timeouts.push(setTimeout(() => setCheckedItems([0, 1, 2]), 2400));
      timeouts.push(setTimeout(() => setCheckedItems([0, 1, 2, 3]), 3200));
    };

    runAnimation();
    const interval = setInterval(runAnimation, 5000);
    
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative">
      <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        <div className="p-6 bg-background">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Shopping List
            </h3>
            <span className="text-sm text-muted-foreground">
              {checkedItems.length}/{items.length} done
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                  checkedItems.includes(i)
                    ? "bg-green-50 dark:bg-green-950/30"
                    : "bg-muted/30"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                    checkedItems.includes(i)
                      ? "bg-green-500 border-green-500"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {checkedItems.includes(i) && (
                    <Check className="h-3 w-3 text-white animate-in zoom-in duration-200" />
                  )}
                </div>
                <span
                  className={`flex-1 text-sm transition-all duration-300 ${
                    checkedItems.includes(i)
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {item.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.aisle}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Recipe Import Demo
export function RecipeImportDemo() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    const runAnimation = () => {
      setStage(0);
      timeouts.push(setTimeout(() => setStage(1), 1000));
      timeouts.push(setTimeout(() => setStage(2), 2500));
      timeouts.push(setTimeout(() => setStage(3), 4000));
    };

    runAnimation();
    const interval = setInterval(runAnimation, 6000);
    
    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative">
      <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        <div className="p-6 bg-background">
          <div className="space-y-4">
            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste recipe URL</label>
              <div className="flex gap-2">
                <div
                  className={`flex-1 px-3 py-2 rounded-md border text-sm transition-all duration-500 ${
                    stage >= 1 ? "bg-muted" : "bg-background"
                  }`}
                >
                  {stage >= 1 ? (
                    <span className="text-muted-foreground animate-in fade-in">
                      https://recipes.com/garlic-salmon
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">
                      https://...
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  className={`transition-all duration-300 ${
                    stage >= 2 ? "bg-green-600" : ""
                  }`}
                  disabled={stage < 1}
                >
                  {stage >= 2 ? <Check className="h-4 w-4" /> : "Import"}
                </Button>
              </div>
            </div>

            {/* Loading state */}
            {stage === 2 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                AI is parsing your recipe...
              </div>
            )}

            {/* Result */}
            {stage >= 3 && (
              <Card className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Garlic Butter Salmon
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>4 ingredients • 25 min • Serves 4</p>
                  <Button size="sm" className="mt-3 w-full">
                    Save Recipe
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
