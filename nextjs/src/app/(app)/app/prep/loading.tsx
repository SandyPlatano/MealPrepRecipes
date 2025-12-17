import { ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PrepSessionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PrepPageLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-muted-foreground" />
            <h1 className="text-3xl font-mono font-bold">Meal Prep</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Plan and track your batch cooking sessions.
          </p>
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Loading skeleton cards */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PrepSessionCardSkeleton />
          <PrepSessionCardSkeleton />
          <PrepSessionCardSkeleton />
        </div>
      </div>
    </div>
  );
}
