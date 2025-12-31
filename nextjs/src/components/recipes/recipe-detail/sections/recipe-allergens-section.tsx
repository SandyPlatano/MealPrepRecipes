import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { getAllergenDisplayName, type AllergenType } from "@/lib/allergen-detector";

interface RecipeAllergensSectionProps {
  matchingAllergens: string[];
  matchingCustomRestrictions: string[];
}

export function RecipeAllergensSection({
  matchingAllergens,
  matchingCustomRestrictions,
}: RecipeAllergensSectionProps) {
  const hasWarnings = matchingAllergens.length > 0 || matchingCustomRestrictions.length > 0;

  if (!hasWarnings) return null;

  return (
    <Alert className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-500">
      <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
      <AlertDescription>
        <div className="flex flex-col">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            ⚠️ Contains items you&apos;ve flagged
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              This recipe contains:
            </span>
            {matchingAllergens.map((allergen) => (
              <Badge
                key={allergen}
                className="bg-amber-600 dark:bg-amber-700 text-white"
              >
                {getAllergenDisplayName(allergen as AllergenType)}
              </Badge>
            ))}
            {matchingCustomRestrictions.map((restriction) => (
              <Badge
                key={restriction}
                className="bg-amber-600 dark:bg-amber-700 text-white"
              >
                {restriction}
              </Badge>
            ))}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
