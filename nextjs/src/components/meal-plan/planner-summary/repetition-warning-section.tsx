import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { RepetitionWarningSectionProps } from "./types";

export function RepetitionWarningSection({ warnings }: RepetitionWarningSectionProps) {
  if (warnings.length === 0) return null;

  return (
    <Card className="overflow-hidden border-yellow-500/30 bg-yellow-500/5 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-mono flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-4 w-4" />
          Recipe Diversity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground mb-3">
          These recipes appear frequently across your planned weeks:
        </p>
        {warnings.map((warning) => (
          <div
            key={warning.recipeId}
            className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50"
          >
            <Link
              href={`/app/recipes/${warning.recipeId}`}
              className="text-sm font-medium hover:underline truncate max-w-[60%]"
            >
              {warning.recipeTitle}
            </Link>
            <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
              {warning.count}x planned
            </Badge>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-2">
          Consider adding variety to your meal plan for better nutrition balance.
        </p>
      </CardContent>
    </Card>
  );
}
