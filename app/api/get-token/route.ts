import { type NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/lib/livekit-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const room = searchParams.get("room");
    const isHost = searchParams.get("host") === "true";

    if (!room) {
      return NextResponse.json(
        { error: "Room parameter is required" },
        { status: 400 }
      );
    }

    // Generate a token for the participant
    // This is safe because this code only runs on the server
    const token = await generateToken(room, isHost);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
