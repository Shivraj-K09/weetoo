"use server";

import { createServerClient } from "@/lib/supabase/server";
import { resetRoomVirtualCurrency } from "./virtual-currency-actions";

export async function deleteRoom(roomId: string) {
  try {
    const supabase = await createServerClient();

    // First, reset the virtual currency to zero
    await resetRoomVirtualCurrency(roomId);

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
