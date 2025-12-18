import { Suspense } from "react";
import { getCookModeSettings, getCustomCookModePresets } from "@/app/actions/settings";
import { CookModeSettingsContent } from "./content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Cooking Mode Settings",
  description: "Customize your cooking mode experience",
};

export default async function CookModeSettingsPage() {
  const [settingsResult, presetsResult] = await Promise.all([
    getCookModeSettings(),
    getCustomCookModePresets(),
  ]);

  return (
    <Suspense fallback={<CookModeSettingsPageSkeleton />}>
      <CookModeSettingsContent
        initialSettings={settingsResult.data}
        initialPresets={presetsResult.data}
      />
    </Suspense>
  );
}

function CookModeSettingsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4 pb-6 border-b">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
