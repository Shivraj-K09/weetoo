import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Extract UUID if needed
    const extractUUID = (str: string): string | null => {
      if (!str) return null;
      const uuidRegex =
        /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
      const match = str.match(uuidRegex);
      return match ? match[1] : null;
    };

    const extractedUUID = extractUUID(roomId) || roomId;

    // Create Supabase client
    const supabase = await createServerClient();

    // Get detailed balance information
    const { data, error } = await supabase.rpc("get_detailed_balance", {
      p_room_id: extractedUUID,
    });

    if (error) {
      console.error("[virtual-currency/balance] Error:", error);
      return NextResponse.json(
        {
          availableBalance: 10000,
          totalBalance: 10000,
          lockedBalance: 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      availableBalance: data?.available || 10000,
      totalBalance: data?.holdings || 10000,
      lockedBalance: data?.initial_margin || 0,
    });
  } catch (error) {
    console.error("[virtual-currency/balance] Unexpected error:", error);
    return NextResponse.json(
      {
        availableBalance: 10000,
        totalBalance: 10000,
        lockedBalance: 0,
      },
      { status: 200 }
    );
  }
}
