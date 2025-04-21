import { NextResponse } from "next/server";
import { getTotalUsers } from "@/lib/supabase/user-queries";

export async function GET() {
  try {
    const userStats = await getTotalUsers();

    return NextResponse.json({
      success: true,
      data: userStats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user statistics",
      },
      { status: 500 }
    );
  }
}
