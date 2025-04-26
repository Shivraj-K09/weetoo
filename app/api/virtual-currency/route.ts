import { createServerClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "Room ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get the virtual currency for the room
    const { data, error } = await supabase
      .from("trading_rooms")
      .select("virtual_currency")
      .eq("id", roomId)
      .single();

    if (error) {
      console.error("Error fetching virtual currency:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      amount: data?.virtual_currency || 0,
    });
  } catch (error) {
    console.error("Unexpected error in virtual currency API:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
