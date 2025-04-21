"use server";

import { createClient } from "@/lib/supabase/server";

export async function autoJoinRoom(roomId: string) {
  try {
    // Always use service role to bypass RLS for this operation
    const supabase = await createClient(true);

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Not logged in" };
    }

    const userId = session.user.id;
    console.log(`[AUTO JOIN] User ${userId} auto-joining room ${roomId}`);

    // Fetch room details with service role
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("[AUTO JOIN] Room not found or error:", roomError);
      return { success: false, message: "Room not found" };
    }

    // Check if room is at capacity
    if (room.current_participants >= room.max_participants) {
      return { success: false, message: "Room is at maximum capacity" };
    }

    // Ensure participants is an array
    const participants = Array.isArray(room.participants)
      ? [...room.participants]
      : [];
    console.log("[AUTO JOIN] Current participants:", participants);

    // Check if user is already a participant
    if (participants.includes(userId)) {
      console.log("[AUTO JOIN] User already in participants list:", userId);
      return { success: true, message: "Already a member of this room" };
    }

    // For public rooms, automatically add the user
    if (room.room_type === "public") {
      // Add user to participants array
      participants.push(userId);
      console.log("[AUTO JOIN] New participants lists:", participants);

      // DIRECT UPDATE: Use a direct SQL update to ensure the array is properly updated
      const { data: updateData, error: updateError } = await supabase
        .from("trading_rooms")
        .update({
          participants: participants,
          current_participants: participants.length,
        })
        .eq("id", roomId)
        .select("participants, current_participants");

      if (updateError) {
        console.error("[AUTO JOIN] Failed to auto-join room:", updateError);
        return {
          success: false,
          message: "Failed to join room: " + updateError.message,
        };
      }

      console.log("[AUTO JOIN] Update result:", updateData);
      // FIX: Don't call revalidatePath here, it will be called by the client component
      // This prevents the "revalidatePath during render" error
      return {
        success: true,
        message: "Successfully joined room",
        shouldRevalidate: true, // Flag to indicate revalidation is needed
        path: `/rooms/${roomId}`, // Path to revalidate
      };
    }

    return { success: false, message: "Room is private" };
  } catch (error) {
    console.error("[AUTO JOIN] Unexpected error in autoJoinRoom:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
