/**
 * Redirect: /app/impact -> /app/stats/impact
 * This page redirects to the new Stats section
 */
import { redirect } from "next/navigation";

export default function ImpactRedirectPage() {
  redirect("/app/stats/impact");
}
