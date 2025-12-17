import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPrepSessionWithRecipes,
  analyzeIngredientOverlap,
} from "@/app/actions/meal-prep";
import { PrepSessionDetail } from "@/components/meal-prep/prep-session-detail";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PrepSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrepSessionPage({ params }: PrepSessionPageProps) {
  const { id } = await params;

  const [sessionResult, overlapResult] = await Promise.all([
    getPrepSessionWithRecipes(id),
    analyzeIngredientOverlap(id),
  ]);

  if (sessionResult.error || !sessionResult.data) {
    notFound();
  }

  const session = sessionResult.data;
  const overlapAnalysis = overlapResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/app/prep">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prep Sessions
          </Button>
        </Link>
      </div>

      <PrepSessionDetail
        session={session}
        overlapAnalysis={overlapAnalysis}
      />
    </div>
  );
}
