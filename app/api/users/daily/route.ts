import { NextResponse } from "next/server";
import { getDailySignups } from "@/lib/supabase/user-queries";

export async function GET() {
  try {
    const signupStats = await getDailySignups();

    return NextResponse.json({
      success: true,
      data: signupStats,
    });
  } catch (error) {
    console.error("Error fetching daily signup stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch daily signup statistics",
      },
      { status: 500 }
    );
  }
}
