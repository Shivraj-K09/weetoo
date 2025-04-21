"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function joinRoom(roomId: string, password?: string) {
  try {
    // Always use service role to bypass RLS for this operation
    const supabase = await createClient(true);

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: "You must be logged in to join a room",
      };
    }

    const userId = session.user.id;
    console.log(`[JOIN ROOM] User ${userId} attempting to join room ${roomId}`);

    // Fetch room details with service role
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("[JOIN ROOM] Room not found or error:", roomError);
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
    console.log("[JOIN ROOM] Current participants:", participants);

    // Check if user is already a participant
    if (participants.includes(userId)) {
      console.log("[JOIN ROOM] User already in participants list:", userId);
      return { success: true, message: "Already a member of this room" };
    }

    // If room is private, verify password
    if (room.room_type === "private") {
      if (!password) {
        return {
          success: false,
          message: "Password required for private room",
        };
      }

      // Verify password
      const isPasswordCorrect = await bcrypt.compare(
        password,
        room.room_password
      );
      if (!isPasswordCorrect) {
        return { success: false, message: "Incorrect password" };
      }
    }

    // Add user to participants array
    participants.push(userId);
    console.log("[JOIN ROOM] New participants list:", participants);

    // DIRECT UPDATE: Use a direct SQL update to ensure the array is properly updated
    // This bypasses any potential issues with the RLS policies
    const { data: updateData, error: updateError } = await supabase
      .from("trading_rooms")
      .update({
        participants: participants,
        current_participants: participants.length,
      })
      .eq("id", roomId)
      .select("participants, current_participants");

    if (updateError) {
      console.error("[JOIN ROOM] Failed to join room:", updateError);
      return {
        success: false,
        message: "Failed to join room: " + updateError.message,
      };
    }

    console.log("[JOIN ROOM] Update result:", updateData);

    // Verify the update was successful
    const { data: updatedRoom, error: checkError } = await supabase
      .from("trading_rooms")
      .select("participants, current_participants")
      .eq("id", roomId)
      .single();

    if (checkError) {
      console.error("[JOIN ROOM] Error verifying room update:", checkError);
    } else {
      console.log(
        "[JOIN ROOM] Updated room participants:",
        updatedRoom.participants
      );
      console.log(
        "[JOIN ROOM] Updated participant count:",
        updatedRoom.current_participants
      );
    }

    revalidatePath(`/rooms/${roomId}`);
    return { success: true, message: "Successfully joined room" };
  } catch (error) {
    console.error("[JOIN ROOM] Unexpected error in joinRoom:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
