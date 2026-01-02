'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// SERVING ADJUSTER - Shared Molecule
// +/- buttons for adjusting serving counts
// ═══════════════════════════════════════════════════════════════════════════

interface ServingAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function ServingAdjuster({
  value,
  onChange,
  min = 1,
  max = 24,
  label = 'servings',
  className,
}: ServingAdjusterProps) {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease servings"
      >
        <Minus className="w-4 h-4" />
      </Button>

      <div className="text-center min-w-[60px]">
        <span className="font-semibold text-lg">{value}</span>
        <span className="text-muted-foreground text-sm ml-1">{label}</span>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase servings"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
