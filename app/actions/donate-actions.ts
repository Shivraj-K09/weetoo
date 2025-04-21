"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function donateKorCoins(
  roomId: string,
  hostId: string,
  amount: number
) {
  try {
    if (amount < 100) {
      return {
        success: false,
        message: "Minimum donation amount is 100 KOR_COINS",
      };
    }

    const supabase = await createClient(true); // Use service role to bypass RLS

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "You must be logged in to donate" };
    }

    const userId = session.user.id;

    // Don't allow host to donate to themselves
    if (userId === hostId) {
      return { success: false, message: "You cannot donate to yourself" };
    }

    // Get user's current KOR_COINS
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("kor_coins, first_name, last_name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return { success: false, message: "Failed to fetch user data" };
    }

    // Check if user has enough KOR_COINS
    if (userData.kor_coins < amount) {
      return { success: false, message: "You don't have enough KOR_COINS" };
    }

    // Get host's current KOR_COINS
    const { data: hostData, error: hostError } = await supabase
      .from("users")
      .select("kor_coins")
      .eq("id", hostId)
      .single();

    if (hostError) {
      console.error("Error fetching host data:", hostError);
      return { success: false, message: "Failed to fetch host data" };
    }

    // Start a transaction to update both user and host KOR_COINS
    const { error: transactionError } = await supabase.rpc("donate_kor_coins", {
      p_donor_id: userId,
      p_host_id: hostId,
      p_amount: amount,
      p_room_id: roomId,
    });

    if (transactionError) {
      console.error("Error in donation transaction:", transactionError);
      return { success: false, message: "Failed to process donation" };
    }

    // Revalidate the room page to reflect the changes
    revalidatePath(`/rooms/${roomId}`);

    return {
      success: true,
      message: "Donation successful",
      donorName: `${userData.first_name} ${userData.last_name}`,
      amount: amount,
    };
  } catch (error) {
    console.error("Unexpected error in donateKorCoins:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Get user's KOR_COINS
export async function getUserKorCoins() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, amount: 0, message: "Not authenticated" };
    }

    // Get user's current KOR_COINS
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("kor_coins")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return {
        success: false,
        amount: 0,
        message: "Failed to fetch user data",
      };
    }

    return { success: true, amount: userData.kor_coins || 0 };
  } catch (error) {
    console.error("Unexpected error in getUserKorCoins:", error);
    return {
      success: false,
      amount: 0,
      message: "An unexpected error occurred",
    };
  }
}
