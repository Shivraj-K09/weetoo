"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateRoomParticipantCount(
  roomId: string,
  count: number
) {
  try {
    const supabase = await createClient();

    // Update the current_participants count in the database
    const { error } = await supabase
      .from("trading_rooms")
      .update({ current_participants: count })
      .eq("id", roomId);

    if (error) {
      console.error("Error updating participant count:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateRoomParticipantCount action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
