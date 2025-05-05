"use server";

import { createClient } from "@/lib/supabase/server";
import { resetRoomVirtualCurrency } from "./virtual-currency-actions";

export async function deleteRoom(roomId: string) {
  try {
    const supabase = await createClient();

    // First, get the room details
    const { data: roomData, error: roomError } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError) {
      console.error("Error fetching room data:", roomError);
      return { success: false, error: roomError.message };
    }

    // Get the virtual currency balance using the RPC function
    const { data: balanceData, error: balanceError } = await supabase.rpc(
      "get_room_virtual_currency",
      {
        room_id: roomId,
      }
    );

    if (balanceError) {
      console.error("Error fetching virtual currency balance:", balanceError);
      return { success: false, error: balanceError.message };
    }

    // Calculate final balance from virtual currency
    const finalBalance = balanceData || 0;
    const initialBalance = 10000; // Default initial balance

    // Calculate profit rate for this room
    const roomProfitRate =
      ((finalBalance - initialBalance) / initialBalance) * 100;

    // Calculate profit (amount above initial balance)
    const profit = Math.max(0, finalBalance - initialBalance);

    // Update the room with final values before deletion
    const { error: updateError } = await supabase
      .from("trading_rooms")
      .update({
        final_balance: finalBalance,
        room_profit_rate: roomProfitRate,
      })
      .eq("id", roomId);

    if (updateError) {
      console.error("Error updating room before deletion:", updateError);
      return { success: false, error: updateError.message };
    }

    // Update all user rankings before deleting the room
    const { error: rankingError } = await supabase.rpc(
      "update_all_user_rankings",
      {
        p_room_id: roomId,
        p_user_id: roomData.owner_id,
        p_room_profit_rate: roomProfitRate,
        p_profit: profit,
      }
    );

    if (rankingError) {
      console.error("Error updating user rankings:", rankingError);
      // Continue with deletion even if ranking update fails
      // We log the error but don't stop the process
    }

    // Reset the virtual currency to zero
    await resetRoomVirtualCurrency(roomId);

    // Now delete the room
    const { error: deleteError } = await supabase
      .from("trading_rooms")
      .delete()
      .eq("id", roomId);

    if (deleteError) {
      console.error("Error deleting room:", deleteError);
      return { success: false, error: deleteError.message };
    }

    // Dispatch a custom event to notify the UI that a room was closed
    if (typeof window !== "undefined") {
      const event = new CustomEvent("room-closed", {
        detail: { roomId: roomId },
      });
      window.dispatchEvent(event);
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
