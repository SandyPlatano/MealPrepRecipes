import { getRecipeStats } from "@/app/actions/cooking-history";
import { StatsView } from "@/components/stats/stats-view";
import { Receipt } from "lucide-react";

export default async function StatsPage() {
  const { data: stats, error } = await getRecipeStats();

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-mono font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            The Receipts
          </h1>
          <p className="text-muted-foreground mt-1">
            Something went wrong loading your stats.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-mono font-bold flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          The Receipts
        </h1>
        <p className="text-muted-foreground mt-1">
          Proof you&apos;ve been pulling your weight in the kitchen.
        </p>
      </div>

      <StatsView stats={stats} />
    </div>
  );
}
