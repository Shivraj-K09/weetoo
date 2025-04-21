import { NextResponse } from "next/server";
import { getTotalKorCoins } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const korCoinStats = await getTotalKorCoins();

    return NextResponse.json({
      success: true,
      data: korCoinStats,
    });
  } catch (error) {
    console.error("Error fetching KOR_Coin stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch KOR_Coin statistics",
      },
      { status: 500 }
    );
  }
}
