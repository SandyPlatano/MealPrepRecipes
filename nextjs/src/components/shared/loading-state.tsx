'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// LOADING STATE - Shared Molecule
// Various loading indicators for different contexts
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 1, className }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-xl border bg-card p-4 space-y-3',
            className
          )}
        >
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </>
  );
}

interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

export function ListSkeleton({ rows = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
