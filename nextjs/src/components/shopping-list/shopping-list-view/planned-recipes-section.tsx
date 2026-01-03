import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, ChevronDown, ChevronUp, ChefHat } from "lucide-react";

export interface PlannedRecipe {
  day: string;
  assignmentId: string;
  recipeName: string;
  recipeId?: string;
  cook: string | undefined;
  recipe: unknown;
}

interface PlannedRecipesSectionProps {
  recipes: PlannedRecipe[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  weekStart?: string;
  cookNames: string[];
  cookColors: Record<string, string>;
  onUpdateCook: (assignmentId: string, cook: string | null) => void;
  getCookForAssignment: (assignmentId: string, fallbackCook?: string | undefined) => string | undefined;
}

// Helper function to get date for a day of the week
// Using UTC timezone for consistent server/client rendering
function getDateForDay(day: string, weekStart?: string): string {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayIndex = daysOfWeek.indexOf(day);
  if (dayIndex === -1 || !weekStart) return "";
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// Helper function to get cook badge color
function getCookBadgeColor(cook: string, cookNames: string[], cookColors: Record<string, string>): string {
  if (cookColors[cook]) {
    return cookColors[cook];
  }
  // Default colors if not customized
  const defaultColors = [
    "#3b82f6", // blue
    "#a855f7", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ];
  const index = cookNames.indexOf(cook);
  return index >= 0 ? defaultColors[index % defaultColors.length] : "#6b7280";
}

export function PlannedRecipesSection({
  recipes,
  isOpen,
  onOpenChange,
  weekStart,
  cookNames,
  cookColors,
  onUpdateCook,
  getCookForAssignment,
}: PlannedRecipesSectionProps) {
  if (recipes.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger className="w-full hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                  {recipes.length} Recipe{recipes.length !== 1 ? "s" : ""} This Week
                </CardTitle>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              {recipes.map((item, index) => {
                // Use optimistic cook value for instant UI feedback
                const currentCook = getCookForAssignment(item.assignmentId, item.cook);
                const cookColor = currentCook ? getCookBadgeColor(currentCook, cookNames, cookColors) : null;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <div className="min-w-[100px]">
                      <span className="font-medium text-primary text-sm block">
                        {item.day}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getDateForDay(item.day, weekStart)}
                      </span>
                    </div>
                    <span className="flex-1 text-sm font-medium">{item.recipeName}</span>
                    <Select
                      value={currentCook || "none"}
                      onValueChange={(value) => onUpdateCook(item.assignmentId, value === "none" ? null : value)}
                    >
                      <SelectTrigger
                        className="h-8 w-[130px] text-xs"
                        style={cookColor ? {
                          borderLeft: `3px solid ${cookColor}`,
                        } : undefined}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChefHat className="h-3 w-3 mr-1 flex-shrink-0" />
                        <SelectValue placeholder="Assign cook" />
                      </SelectTrigger>
                      <SelectContent
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <SelectItem value="none">No cook</SelectItem>
                        {cookNames.map((name) => {
                          const color = getCookBadgeColor(name, cookNames, cookColors);
                          return (
                            <SelectItem key={name} value={name}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                  aria-hidden="true"
                                />
                                {name}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
