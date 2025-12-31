"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect /app/settings directly to Profile & Account settings
// The sidebar provides navigation to all other settings categories
export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/settings/profile");
  }, [router]);

  // Return null while redirecting (layout will show loading state)
  return null;
}
