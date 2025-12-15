import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: "ok" | "error";
    auth: "ok" | "error";
  };
  responseTime?: number;
}

export async function GET() {
  const startTime = Date.now();
  const checks = {
    database: "error" as "ok" | "error",
    auth: "error" as "ok" | "error",
  };

  try {
    // Check database connectivity
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (!dbError) {
      checks.database = "ok";
    }

    // Check auth service
    const { error: authError } = await supabase.auth.getSession();
    if (!authError) {
      checks.auth = "ok";
    }
  } catch (error) {
    console.error("Health check error:", error);
  }

  const responseTime = Date.now() - startTime;
  const allChecksOk = Object.values(checks).every((c) => c === "ok");
  const someChecksOk = Object.values(checks).some((c) => c === "ok");

  const status: HealthStatus = {
    status: allChecksOk ? "healthy" : someChecksOk ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "development",
    checks,
    responseTime,
  };

  const httpStatus = allChecksOk ? 200 : someChecksOk ? 200 : 503;

  return NextResponse.json(status, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
