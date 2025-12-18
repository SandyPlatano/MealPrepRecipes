/**
 * Redirect: /app/nutrition/help -> /app/stats/nutrition/help
 */
import { redirect } from "next/navigation";

export default function NutritionHelpRedirectPage() {
  redirect("/app/stats/nutrition/help");
}
