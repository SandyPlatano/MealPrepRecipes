import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function PlannerEmptyState() {
  return (
    <div className="animate-slide-up-fade py-8">
      <EmptyState
        icon={<CalendarDays className="h-12 w-12 text-muted-foreground/50" />}
        title="No meals planned yet"
        description="Start adding recipes to your week by clicking on any day above, or browse your recipes to add them to your plan."
        action={
          <Button variant="outline" asChild>
            <Link href="/app/recipes">Browse Recipes</Link>
          </Button>
        }
        variant="card"
        className="border-dashed"
      />
    </div>
  );
}
