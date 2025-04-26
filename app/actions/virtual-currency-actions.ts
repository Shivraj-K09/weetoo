"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

// Get virtual currency for a room (only works for room owner)
export async function getRoomVirtualCurrency(roomId: string) {
  try {
    console.log("[getRoomVirtualCurrency] Original roomId:", roomId);

    // Extract the UUID part from the roomId
    const extractedUUID = extractUUID(roomId);
    console.log("[getRoomVirtualCurrency] Extracted UUID:", extractedUUID);

    if (!extractedUUID) {
      console.error(
        "[getRoomVirtualCurrency] Could not extract UUID from roomId:",
        roomId
      );
      return { success: false, amount: 0, message: "Invalid room ID format" };
    }

    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, amount: 0, message: "Not authenticated" };
    }

    console.log(
      "[getRoomVirtualCurrency] Calling get_room_virtual_currency with UUID:",
      extractedUUID
    );

    // Call the database function to get virtual currency (only returns value if user is owner)
    const { data, error } = await supabase.rpc("get_room_virtual_currency", {
      room_id: extractedUUID,
    });

    if (error) {
      console.error(
        "[getRoomVirtualCurrency] Error getting virtual currency:",
        error
      );
      return { success: false, amount: 0, message: error.message };
    }

    console.log("[getRoomVirtualCurrency] Success, amount:", data || 0);
    return { success: true, amount: data || 0 };
  } catch (error) {
    console.error("[getRoomVirtualCurrency] Unexpected error:", error);
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
    console.log(
      "[updateRoomVirtualCurrency] Original roomId:",
      roomId,
      "newAmount:",
      newAmount
    );

    // Extract the UUID part from the roomId
    const extractedUUID = extractUUID(roomId);
    console.log("[updateRoomVirtualCurrency] Extracted UUID:", extractedUUID);

    if (!extractedUUID) {
      console.error(
        "[updateRoomVirtualCurrency] Could not extract UUID from roomId:",
        roomId
      );
      return { success: false, message: "Invalid room ID format" };
    }

    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    console.log(
      "[updateRoomVirtualCurrency] Calling update_room_virtual_currency with UUID:",
      extractedUUID
    );

    // Call the database function to update virtual currency (only works if user is owner)
    const { data, error } = await supabase.rpc("update_room_virtual_currency", {
      room_id: extractedUUID,
      new_amount: newAmount,
    });

    if (error) {
      console.error(
        "[updateRoomVirtualCurrency] Error updating virtual currency:",
        error
      );
      return { success: false, message: error.message };
    }

    // If the function returned false, it means the user is not the owner
    if (!data) {
      return {
        success: false,
        message: "Only room owner can update virtual currency",
      };
    }

    console.log("[updateRoomVirtualCurrency] Success");

    // Revalidate the room page to reflect the changes
    revalidatePath(`/rooms/${roomId}`);
    return { success: true, message: "Virtual currency updated successfully" };
  } catch (error) {
    console.error("[updateRoomVirtualCurrency] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Reset virtual currency to zero when room is closed
export async function resetRoomVirtualCurrency(roomId: string) {
  try {
    console.log(
      "[resetRoomVirtualCurrency] Resetting virtual currency for roomId:",
      roomId
    );
    return await updateRoomVirtualCurrency(roomId, 0);
  } catch (error) {
    console.error(
      "[resetRoomVirtualCurrency] Error resetting virtual currency:",
      error
    );
    return { success: false, message: "Failed to reset virtual currency" };
  }
}
