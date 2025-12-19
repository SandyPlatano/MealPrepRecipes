import { Metadata } from "next";
import { WasteDashboard } from "@/components/stats/waste-dashboard";

export const metadata: Metadata = {
  title: "Your Impact | Meal Prep OS",
  description: "Track your food waste reduction and sustainability impact",
};

export default function ImpactPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight font-mono">Your Impact</h1>
        <p className="text-muted-foreground">
          See how your meal planning habits are reducing food waste and saving money.
        </p>
      </div>

      <WasteDashboard />
    </div>
  );
}
