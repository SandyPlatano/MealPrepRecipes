import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  Edit,
  BookOpen,
  CheckCircle,
  Info,
} from "lucide-react";

export default function NutritionHelpPage() {
  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/stats/nutrition">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">Nutrition Tracking Help</h1>
          <p className="text-muted-foreground mt-1">
            Quick guide to using nutrition tracking features
          </p>
        </div>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started with nutrition tracking in 3 steps</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Enable Nutrition Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Go to Settings → Toggle &quot;Track Nutrition&quot; ON → Save
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Set Your Goals (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                In Settings, set daily targets for calories, protein, carbs, and fat
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Start Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Create recipes and plan meals - nutrition is extracted automatically!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Extraction
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">
              Nutrition data is automatically extracted from your recipe ingredients using AI.
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-medium">When it happens:</p>
              <ul className="list-disc list-inside text-muted-foreground flex flex-col gap-1">
                <li>Creating new recipes</li>
                <li>Editing recipe ingredients</li>
                <li>Using batch extraction tool</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit className="h-5 w-5 text-primary" />
              Manual Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">
              You can always edit or manually enter nutrition values.
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-medium">How to edit:</p>
              <ul className="list-disc list-inside text-muted-foreground flex flex-col gap-1">
                <li>Open recipe detail page</li>
                <li>Find Nutrition Facts card</li>
                <li>Click edit button (pencil icon)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Goal Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">
              Set daily macro goals and track your progress over time.
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Progress indicators:</p>
              <ul className="list-disc list-inside text-muted-foreground flex flex-col gap-1">
                <li>Green ring: Meeting goals</li>
                <li>Yellow ring: Close to goals (80-100%)</li>
                <li>Red ring: Below goals (&lt;80%)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              History & Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">
              View your nutrition history and identify patterns over time.
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-medium">What you&apos;ll see:</p>
              <ul className="list-disc list-inside text-muted-foreground flex flex-col gap-1">
                <li>Current week dashboard</li>
                <li>Weekly averages</li>
                <li>Trend graphs (last 12 weeks)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Where to Find Nutrition Data */}
      <Card>
        <CardHeader>
          <CardTitle>Where to Find Nutrition Data</CardTitle>
          <CardDescription>Nutrition information appears in multiple places</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Recipe Detail Page</p>
                <p className="text-sm text-muted-foreground">
                  Full FDA-style nutrition label with per-serving breakdown
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Meal Plan</p>
                <p className="text-sm text-muted-foreground">
                  Nutrition badges on each meal showing calories and protein
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Meal Plan Summary</p>
                <p className="text-sm text-muted-foreground">
                  Daily and weekly totals at the bottom of the planner
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Nutrition History</p>
                <p className="text-sm text-muted-foreground">
                  Trends, averages, and goal tracking over time
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips for Best Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-medium text-sm">Use Specific Ingredients</p>
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-sm text-green-600">Good: &quot;2 cups whole milk&quot;</p>
                <p className="text-sm text-red-600">Bad: &quot;Some milk&quot;</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Include Quantities</p>
              <div className="mt-1 flex flex-col gap-1">
                <p className="text-sm text-green-600">Good: &quot;1 lb ground beef (85% lean)&quot;</p>
                <p className="text-sm text-red-600">Bad: &quot;Ground beef&quot;</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm">Review AI Extractions</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check confidence scores and verify values seem reasonable
              </p>
            </div>
            <div>
              <p className="font-medium text-sm">Use Standard Measurements</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cups, tablespoons, grams, ounces work better than vague amounts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Confidence Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Confidence Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            AI-extracted nutrition includes a confidence score (0.0 - 1.0) indicating accuracy:
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                0.9 - 1.0
              </Badge>
              <p className="text-sm">Very High - Trust the data</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                0.7 - 0.9
              </Badge>
              <p className="text-sm">High - Generally reliable</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                0.5 - 0.7
              </Badge>
              <p className="text-sm">Medium - Review and verify</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
                0.0 - 0.5
              </Badge>
              <p className="text-sm">Low - Consider manual entry</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="font-medium text-sm">Nutrition not auto-extracting?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check Settings → Ensure &quot;Track Nutrition&quot; is enabled
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">Values seem inaccurate?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check confidence score → Use manual entry for low scores
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">Missing nutrition on meal plan?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open recipe detail page → Click &quot;Extract Nutrition with AI&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Settings</p>
              <p className="text-sm text-muted-foreground">
                Enable tracking and set goals
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/settings/dietary">Open Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
