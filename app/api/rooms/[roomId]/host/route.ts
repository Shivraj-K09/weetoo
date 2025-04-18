import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRoomParticipants } from "@/lib/livekit-service";

// Use NextRequest instead of Request
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;

    // First, try to get the host from LiveKit directly
    const participants = await getRoomParticipants(roomId);
    const hostParticipant = participants.find((p) => {
      try {
        const metadata = JSON.parse(p.metadata || "{}");
        return metadata.isHost === true;
      } catch (e) {
        return false;
      }
    });

    // If we found a host in LiveKit, return that ID
    if (hostParticipant && hostParticipant.identity) {
      console.log(`Found host in LiveKit: ${hostParticipant.identity}`);
      return NextResponse.json({ hostId: hostParticipant.identity });
    }

    // If no host found in LiveKit, fall back to database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trading_rooms")
      .select("owner_id")
      .eq("id", roomId)
      .single();

    if (error) {
      console.error("Error fetching host:", error);
      return NextResponse.json(
        { error: "Failed to get host" },
        { status: 500 }
      );
    }

    if (!data || !data.owner_id) {
      return NextResponse.json({ error: "No host found" }, { status: 404 });
    }

    console.log(`Returning host from database: ${data.owner_id}`);
    return NextResponse.json({ hostId: data.owner_id });
  } catch (error) {
    console.error("Error in host route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Use these segment config options
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
