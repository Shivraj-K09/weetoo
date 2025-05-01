"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Resets a user's negative profit rate to zero.
 * Only works if the profit rate is negative.
 */
export async function resetNegativeProfitRate() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      return { success: false, error: "Authentication required" };
    }

    // Call the database function to reset negative profit rate
    const { data, error } = await supabase.rpc("reset_negative_profit_rate", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error resetting profit rate:", error);
      return { success: false, error: error.message };
    }

    // The function returns true if a reset was performed, false if no reset was needed
    return {
      success: true,
      wasReset: data,
      message: data
        ? "Your negative profit rate has been reset to zero."
        : "No reset needed. Your profit rate is not negative.",
    };
  } catch (error) {
    console.error("Error in resetNegativeProfitRate action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets the current profit rate for a user
 */
export async function getUserProfitRate() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Error getting user:", userError);
      return { success: false, error: "Authentication required" };
    }

    // Get the user's profit rate
    const { data, error } = await supabase
      .from("user_profit_rates")
      .select("cumulative_profit_rate, total_rooms_opened, last_updated")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Error getting profit rate:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      profitRate: data?.cumulative_profit_rate || 0,
      totalRooms: data?.total_rooms_opened || 0,
      lastUpdated: data?.last_updated || null,
    };
  } catch (error) {
    console.error("Error in getUserProfitRate action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
