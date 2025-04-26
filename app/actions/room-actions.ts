"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function joinRoom(roomId: string, password?: string) {
  try {
    // Always use service role to bypass RLS for this operation
    const supabase = await createServerClient(true);

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
    console.log(`User ${userId} attempting to join room ${roomId}`);

    // Fetch room details with service role
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("Room not found or error:", roomError);
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
    console.log("Current participants:", participants);

    // Check if user is already a participant
    if (participants.includes(userId)) {
      console.log("User already in participants list:", userId);
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
    console.log("New participants list:", participants);

    // Use a direct SQL update to ensure the array is properly updated
    // This bypasses any potential issues with the RLS policies
    const { error: updateError } = await supabase.rpc(
      "add_participant_to_room",
      {
        room_id: roomId,
        user_id: userId,
      }
    );

    if (updateError) {
      console.error("Failed to join room:", updateError);
      return {
        success: false,
        message: "Failed to join room: " + updateError.message,
      };
    }

    // Verify the update was successful
    const { data: updatedRoom, error: checkError } = await supabase
      .from("trading_rooms")
      .select("participants, current_participants")
      .eq("id", roomId)
      .single();

    if (checkError) {
      console.error("Error verifying room update:", checkError);
    } else {
      console.log("Updated room participants:", updatedRoom.participants);
      console.log(
        "Updated participant count:",
        updatedRoom.current_participants
      );
    }

    revalidatePath(`/rooms/${roomId}`);
    return { success: true, message: "Successfully joined room" };
  } catch (error) {
    console.error("Unexpected error in joinRoom:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function leaveRoom(roomId: string) {
  try {
    // Always use service role to bypass RLS for this operation
    const supabase = await createServerClient(true);

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: "You must be logged in to leave a room",
      };
    }

    const userId = session.user.id;
    console.log(`User ${userId} attempting to leave room ${roomId}`);

    // Fetch room details with service role
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("Room not found or error:", roomError);
      return { success: false, message: "Room not found" };
    }

    // Ensure participants is an array
    const participants = Array.isArray(room.participants)
      ? [...room.participants]
      : [];

    // Check if user is a participant
    if (!participants.includes(userId)) {
      console.log("User not in participants list:", userId);
      return { success: true, message: "Not a member of this room" };
    }

    // Don't allow the owner to leave their own room
    if (room.owner_id === userId) {
      return {
        success: false,
        message: "Room owner cannot leave their own room",
      };
    }

    // Use the RPC function to remove the participant
    const { error: updateError } = await supabase.rpc(
      "remove_participant_from_room",
      {
        room_id: roomId,
        user_id: userId,
      }
    );

    if (updateError) {
      console.error("Failed to leave room:", updateError);
      return {
        success: false,
        message: "Failed to leave room: " + updateError.message,
      };
    }

    // Verify the update was successful
    const { data: updatedRoom, error: checkError } = await supabase
      .from("trading_rooms")
      .select("participants, current_participants")
      .eq("id", roomId)
      .single();

    if (checkError) {
      console.error("Error verifying room update:", checkError);
    } else {
      console.log("Updated room participants:", updatedRoom.participants);
      console.log(
        "Updated participant count:",
        updatedRoom.current_participants
      );
    }

    revalidatePath(`/rooms/${roomId}`);
    return { success: true, message: "Successfully left room" };
  } catch (error) {
    console.error("Unexpected error in leaveRoom:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
