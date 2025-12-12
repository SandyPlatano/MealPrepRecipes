import { redirect } from "next/navigation";

interface PlanPageProps {
  searchParams: Promise<{ week?: string }>;
}

// Redirect /app/plan to /app (homepage) since the plan page is now the homepage
export default async function PlanPage({ searchParams }: PlanPageProps) {
  const params = await searchParams;
  const weekParam = params.week ? `?week=${params.week}` : "";
  redirect(`/app${weekParam}`);
}
