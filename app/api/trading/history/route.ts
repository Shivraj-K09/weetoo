import { type NextRequest, NextResponse } from "next/server";
import { getRoomTradeHistory } from "@/app/actions/trading-actions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Get trade history using the server action
    const result = await getRoomTradeHistory(roomId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // Log the first trade to check entry and exit prices
    if (result.trades && result.trades.length > 0) {
      console.log("[API] First trade:", {
        entry: result.trades[0].entry_price,
        exit: result.trades[0].exit_price,
        pnl: result.trades[0].pnl,
        pnl_percentage: result.trades[0].pnl_percentage,
      });
    }

    return NextResponse.json({ trades: result.trades });
  } catch (error) {
    console.error("Error in trading history API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
