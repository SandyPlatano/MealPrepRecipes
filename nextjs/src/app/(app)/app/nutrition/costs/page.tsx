/**
 * Redirect: /app/nutrition/costs -> /app/stats/nutrition/costs
 */
import { redirect } from "next/navigation";

export default function NutritionCostsRedirectPage() {
  redirect("/app/stats/nutrition/costs");
}
