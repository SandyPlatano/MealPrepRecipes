import { NextResponse } from "next/server";
import { isNutritionTrackingEnabled } from "@/app/actions/nutrition";

export async function GET() {
  try {
    const result = await isNutritionTrackingEnabled();
    return NextResponse.json({ enabled: result.enabled });
  } catch (error) {
    console.error("Error checking nutrition tracking status:", error);
    return NextResponse.json({ enabled: false }, { status: 500 });
  }
}
