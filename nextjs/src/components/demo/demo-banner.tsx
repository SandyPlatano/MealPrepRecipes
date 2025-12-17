"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Sparkles, RotateCcw } from "lucide-react";
import { useDemo } from "@/lib/demo/demo-context";

interface DemoBannerProps {
  variant?: "default" | "minimal";
}

export function DemoBanner({ variant = "default" }: DemoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { resetDemo } = useDemo();

  if (isDismissed) return null;

  if (variant === "minimal") {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 via-primary/10 to-purple-500/10 border-b border-purple-200/50 dark:border-purple-800/50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="font-medium text-purple-700 dark:text-purple-300">Demo Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDemo}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
            <Link href="/signup">
              <Button size="sm" className="h-7 text-xs">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 via-primary to-purple-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-full shrink-0">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Demo Mode</span>
            </div>
            <p className="text-sm text-white/90 truncate hidden sm:block">
              You&apos;re exploring with sample data. Sign up to save your own recipes!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDemo}
              className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset Demo
            </Button>
            <Link href="/signup">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Sign Up Free
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss banner</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
