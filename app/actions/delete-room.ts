"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteRoom(roomId: string) {
  try {
    const supabase = await createClient();

    // Delete the room from the database
    const { error } = await supabase
      .from("trading_rooms")
      .delete()
      .eq("id", roomId);

    if (error) {
      console.error("Error deleting room:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteRoom action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
