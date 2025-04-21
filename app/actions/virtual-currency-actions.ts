"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Get virtual currency for a room (only works for room owner)
export async function getRoomVirtualCurrency(roomId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, amount: 0, message: "Not authenticated" };
    }

    // Call the database function to get virtual currency (only returns value if user is owner)
    const { data, error } = await supabase.rpc("get_room_virtual_currency", {
      room_id: roomId,
    });

    if (error) {
      console.error("Error getting virtual currency:", error);
      return { success: false, amount: 0, message: error.message };
    }

    return { success: true, amount: data || 0 };
  } catch (error) {
    console.error("Unexpected error in getRoomVirtualCurrency:", error);
    return {
      success: false,
      amount: 0,
      message: "An unexpected error occurred",
    };
  }
}

// Update virtual currency for a room (only works for room owner)
export async function updateRoomVirtualCurrency(
  roomId: string,
  newAmount: number
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    // Call the database function to update virtual currency (only works if user is owner)
    const { data, error } = await supabase.rpc("update_room_virtual_currency", {
      room_id: roomId,
      new_amount: newAmount,
    });

    if (error) {
      console.error("Error updating virtual currency:", error);
      return { success: false, message: error.message };
    }

    // If the function returned false, it means the user is not the owner
    if (!data) {
      return {
        success: false,
        message: "Only room owner can update virtual currency",
      };
    }

    // Revalidate the room page to reflect the changes
    revalidatePath(`/rooms/${roomId}`);
    return { success: true, message: "Virtual currency updated successfully" };
  } catch (error) {
    console.error("Unexpected error in updateRoomVirtualCurrency:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Reset virtual currency to zero when room is closed
export async function resetRoomVirtualCurrency(roomId: string) {
  try {
    return await updateRoomVirtualCurrency(roomId, 0);
  } catch (error) {
    console.error("Error resetting virtual currency:", error);
    return { success: false, message: "Failed to reset virtual currency" };
  }
}
