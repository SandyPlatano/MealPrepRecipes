import { Metadata } from "next";
import { WasteDashboard } from "@/components/stats/waste-dashboard";

export const metadata: Metadata = {
  title: "Your Impact | Meal Prep OS",
  description: "Track your food waste reduction and sustainability impact",
};

export default function ImpactPage() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Your Impact</h1>
        <p className="text-muted-foreground">
          See how your meal planning habits are reducing food waste and saving money.
        </p>
      </div>

      <WasteDashboard />
    </div>
  );
}
