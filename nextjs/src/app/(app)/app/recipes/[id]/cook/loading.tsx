import { Skeleton } from "@/components/ui/skeleton";

export default function CookModeLoading() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-2 w-8 rounded-full" />
          ))}
        </div>

        {/* Step content */}
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>

        {/* Timer placeholder */}
        <Skeleton className="h-16 w-32 rounded-xl" />
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between p-4 border-t">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}
