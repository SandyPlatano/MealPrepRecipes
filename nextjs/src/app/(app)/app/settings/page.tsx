import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SETTINGS_CATEGORIES } from "@/lib/settings/settings-categories";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | Meal Prep OS",
  description: "Customize your meal planning experience",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight font-mono">Settings</h1>
        <p className="text-muted-foreground">
          Customize your meal planning experience.
        </p>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={category.path}>
              <Card className="h-full group hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        {category.label}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                      <CardDescription className="text-sm mt-1 line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
