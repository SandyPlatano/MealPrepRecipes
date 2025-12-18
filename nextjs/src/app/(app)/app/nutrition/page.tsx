/**
 * Redirect: /app/nutrition -> /app/stats/nutrition
 * This page redirects to the new Stats section
 */
import { redirect } from "next/navigation";

export default function NutritionRedirectPage() {
  redirect("/app/stats/nutrition");
}
