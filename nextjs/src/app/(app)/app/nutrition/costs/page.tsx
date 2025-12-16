import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/auth/admin";
import { NutritionCostsClient } from "./nutrition-costs-client";

/**
 * Nutrition Costs Dashboard - Admin Only
 *
 * This page shows the cost breakdown of AI nutrition extraction.
 * Only accessible to admin users.
 */
export default async function NutritionCostsPage() {
  // Server-side admin check
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/app/nutrition");
  }

  return <NutritionCostsClient />;
}
