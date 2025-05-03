import { supabase } from "@/lib/supabase/client";

/**
 * Checks if a user is a participant in a room
 */
export async function isUserParticipant(
  roomId: string,
  userId: string
): Promise<boolean> {
  if (!roomId || !userId) return false;

  try {
    // First check if user is the owner
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("owner_id, participants")
      .eq("id", roomId)
      .single();

    if (roomError) {
      console.error(
        "[PARTICIPANT UTILS] Error checking if user is owner:",
        roomError
      );
      return false;
    }

    // If user is the owner, they're automatically a participant
    if (room.owner_id === userId) {
      return true;
    }

    // Check if user is in the participants array
    if (
      Array.isArray(room.participants) &&
      room.participants.includes(userId)
    ) {
      return true;
    }

    // If we get here, user is not a participant
    return false;
  } catch (error) {
    console.error(
      "[PARTICIPANT UTILS] Error checking participant status:",
      error
    );
    return false;
  }
}

/**
 * Adds a user as a participant to a room
 */
export async function addUserAsParticipant(
  roomId: string,
  userId: string
): Promise<boolean> {
  if (!roomId || !userId) return false;

  try {
    // First check if user is already a participant
    const isParticipant = await isUserParticipant(roomId, userId);

    if (isParticipant) {
      console.log("[PARTICIPANT UTILS] User is already a participant");
      return true;
    }

    // Get current participants
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("participants")
      .eq("id", roomId)
      .single();

    if (roomError) {
      console.error(
        "[PARTICIPANT UTILS] Error getting room participants:",
        roomError
      );
      return false;
    }

    // Add user to participants array
    const participants = Array.isArray(room.participants)
      ? [...room.participants]
      : [];
    participants.push(userId);

    // Update room
    const { error: updateError } = await supabase
      .from("trading_rooms")
      .update({
        participants: participants,
        current_participants: participants.length,
      })
      .eq("id", roomId);

    if (updateError) {
      console.error(
        "[PARTICIPANT UTILS] Error adding user as participant:",
        updateError
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "[PARTICIPANT UTILS] Error adding user as participant:",
      error
    );
    return false;
  }
}
