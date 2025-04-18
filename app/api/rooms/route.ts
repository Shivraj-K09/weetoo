import { type NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/livekit-service";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Create a room in LiveKit
    const roomId = await createRoom(name);

    return NextResponse.json({ roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
