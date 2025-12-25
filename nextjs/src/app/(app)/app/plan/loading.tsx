import { Skeleton } from "@/components/ui/skeleton";

export default function PlanLoading() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-9" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Week view grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`header-${i}`} className="p-2">
            <Skeleton className="h-4 w-12 mx-auto" />
          </div>
        ))}

        {/* Day columns */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`day-${i}`} className="flex flex-col gap-2 min-h-[400px] rounded-lg border p-2">
            <Skeleton className="h-6 w-8 mx-auto" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="rounded-md border p-2 flex flex-col gap-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
