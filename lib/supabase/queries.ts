import { createClient } from "./server";

// Interface for KOR_Coin statistics
export interface KorCoinStats {
  totalCoins: number;
  percentageChange: number;
  direction: "up" | "down";
  lastUpdated: Date;
}

/**
 * Fetches the total KOR_Coins from all users
 */
export async function getTotalKorCoins(): Promise<KorCoinStats> {
  const supabase = await createClient();

  try {
    // Get current total KOR_Coins
    const { data: currentData, error: currentError } = await supabase
      .from("users")
      .select("kor_coins")
      .not("kor_coins", "is", null);

    if (currentError) throw currentError;

    // Calculate total coins
    const totalCoins = currentData.reduce(
      (sum, user) => sum + (user.kor_coins || 0),
      0
    );

    // For server-side, we'll just return the total with a neutral trend
    // The client component will handle the trend calculation
    return {
      totalCoins,
      percentageChange: 0,
      direction: "up",
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching KOR_Coin stats:", error);
    // Return default values in case of error
    return {
      totalCoins: 0,
      percentageChange: 0,
      direction: "up",
      lastUpdated: new Date(),
    };
  }
}

/**
 * Updates a user's KOR_Coins (for purchase or usage)
 */
export async function updateUserKorCoins(
  userId: string,
  amount: number
): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Get current KOR_Coins for the user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("kor_coins")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // Calculate new amount (ensure it doesn't go below 0)
    const currentCoins = userData.kor_coins || 0;
    const newAmount = Math.max(0, currentCoins + amount);

    // Update the user's KOR_Coins
    const { error: updateError } = await supabase
      .from("users")
      .update({ kor_coins: newAmount })
      .eq("id", userId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error("Error updating KOR_Coins:", error);
    return false;
  }
}
