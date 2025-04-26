import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Get the Supabase client
    const supabase = await createServerClient();

    // Query the trading_rooms table to get room info
    const { data, error } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) {
      console.error("Error fetching room:", error);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room: data });
  } catch (error) {
    console.error("Error getting room:", error);
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 });
  }
}

// Use these segment config options
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
