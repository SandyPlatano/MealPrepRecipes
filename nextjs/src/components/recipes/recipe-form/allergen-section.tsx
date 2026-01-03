import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ALLERGEN_TYPES, getAllergenDisplayName, type AllergenType } from "@/lib/allergen-detector";

interface AllergenSectionProps {
  allergenTags: string[];
  toggleAllergenTag: (allergen: string) => void;
}

export function AllergenSection({
  allergenTags,
  toggleAllergenTag,
}: AllergenSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Allergen Warnings</CardTitle>
        <CardDescription>
          Mark allergens present in this recipe. Auto-detected allergens are shown below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_TYPES.map((allergen) => {
            const isSelected = allergenTags.includes(allergen);
            return (
              <div key={allergen} className="flex items-center gap-2">
                <Checkbox
                  id={`allergen-${allergen}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleAllergenTag(allergen)}
                />
                <label
                  htmlFor={`allergen-${allergen}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <Badge
                    variant={isSelected ? "warning" : "secondary"}
                  >
                    {getAllergenDisplayName(allergen)}
                  </Badge>
                </label>
              </div>
            );
          })}
        </div>
        {allergenTags.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected allergens: {allergenTags.map((tag) => getAllergenDisplayName(tag as AllergenType)).join(", ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
