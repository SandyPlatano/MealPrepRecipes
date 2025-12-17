"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Sparkles, ChefHat, Calendar, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoFloatingCTAProps {
  /** Delay in seconds before showing the CTA (default: 120 = 2 minutes) */
  delaySeconds?: number;
}

export function DemoFloatingCTA({ delaySeconds = 120 }: DemoFloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem("demo-floating-cta-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 50);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem("demo-floating-cta-dismissed", "true");
    }, 300);
  };

  if (isDismissed || !isAnimating) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      )}
    >
      <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">
                Enjoying the demo?
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Create your free account to save recipes, plan meals, and generate shopping lists.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ChefHat className="h-3 w-3" />
                  Cook Mode
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Meal Planning
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <ShoppingCart className="h-3 w-3" />
                  Shopping Lists
                </span>
              </div>

              <div className="flex gap-2">
                <Link href="/signup" className="flex-1">
                  <Button size="sm" className="w-full">
                    Sign Up Free
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-muted-foreground"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
