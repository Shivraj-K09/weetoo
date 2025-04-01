"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function joinRoom(roomId: string, password?: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: "You must be logged in to join a room" };
  }

  // Fetch room details
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

  // Initialize participants array if it doesn't exist
  const participants = Array.isArray(room.participants)
    ? room.participants
    : [];

  // Check if user is already a participant
  if (participants.includes(session.user.id)) {
    console.log("User already in participants list:", session.user.id);
    return { success: true, message: "Already a member of this room" };
  }

  // If room is private, verify password
  if (room.room_type === "private") {
    if (!password) {
      return { success: false, message: "Password required for private room" };
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

  // Add user to participants
  const newParticipants = [...participants, session.user.id];
  console.log("Updating participants list:", newParticipants);

  const { error: updateError } = await supabase
    .from("trading_rooms")
    .update({
      participants: newParticipants,
      current_participants: newParticipants.length,
    })
    .eq("id", roomId);

  if (updateError) {
    console.error("Failed to join room:", updateError);
    return { success: false, message: "Failed to join room" };
  }

  revalidatePath(`/rooms/${roomId}`);
  return { success: true, message: "Successfully joined room" };
}

export async function leaveRoom(roomId: string) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: "You must be logged in to leave a room" };
  }

  // Fetch room details
  const { data: room, error: roomError } = await supabase
    .from("trading_rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    console.error("Room not found or error:", roomError);
    return { success: false, message: "Room not found" };
  }

  // Initialize participants array if it doesn't exist
  const participants = Array.isArray(room.participants)
    ? room.participants
    : [];

  // Check if user is a participant
  if (!participants.includes(session.user.id)) {
    console.log("User not in participants list:", session.user.id);
    return { success: true, message: "Not a member of this room" };
  }

  // Remove user from participants
  const newParticipants = participants.filter(
    (id: string) => id !== session.user.id
  );
  console.log("Updating participants list after leave:", newParticipants);

  const { error: updateError } = await supabase
    .from("trading_rooms")
    .update({
      participants: newParticipants,
      current_participants: newParticipants.length,
    })
    .eq("id", roomId);

  if (updateError) {
    console.error("Failed to leave room:", updateError);
    return { success: false, message: "Failed to leave room" };
  }

  revalidatePath(`/rooms/${roomId}`);
  return { success: true, message: "Successfully left room" };
}
