import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MealPlannerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Desktop Day Rows */}
      <div className="hidden md:flex md:flex-col gap-3">
        {DAYS.map((day, index) => (
          <DayRowSkeleton key={day} delay={index * 100} />
        ))}
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden space-y-2">
        {DAYS.map((day, index) => (
          <MobileDaySkeleton key={day} delay={index * 100} />
        ))}
      </div>
    </div>
  );
}

function DayRowSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="flex items-start gap-3 animate-slide-up-fade"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Day Badge */}
      <div className="flex flex-col items-center justify-center min-w-[60px] pt-2">
        <Skeleton className="h-8 w-8 mb-1" />
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-2 w-6 mt-1" />
      </div>

      {/* Card */}
      <Card className="flex-1 min-h-[100px]">
        <CardContent className="p-2.5 space-y-1.5">
          {/* Recipe Row Skeletons */}
          <div className="flex items-center gap-2 p-2 rounded-md border bg-card/50">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-[130px] rounded" />
          </div>

          {/* Add Meal Button Skeleton */}
          <Skeleton className="h-10 w-full rounded-md border-2 border-dashed" />
        </CardContent>
      </Card>
    </div>
  );
}

function MobileDaySkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="animate-slide-up-fade"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ShoppingListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Add Item Form Skeleton */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-10" />
          </div>
        </CardContent>
      </Card>

      {/* Actions Skeleton */}
      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-9" />
      </div>

      {/* Progress Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Category Cards */}
      {[1, 2, 3].map((i) => (
        <CategorySkeleton key={i} delay={i * 100} />
      ))}
    </div>
  );
}

function CategorySkeleton({ delay }: { delay: number }) {
  return (
    <Card
      className="animate-slide-up-fade"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
