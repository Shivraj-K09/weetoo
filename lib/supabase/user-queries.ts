import { createClient } from "./server";

// Interface for user statistics
export interface UserStats {
  totalUsers: number;
  percentageChange: number;
  direction: "up" | "down";
  lastUpdated: Date;
}

/**
 * Fetches the total number of registered users
 */
export async function getTotalUsers(): Promise<UserStats> {
  const supabase = await createClient();

  try {
    // Count total users
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    // For server-side, we'll just return the total with a neutral trend
    // The client component will handle the trend calculation
    return {
      totalUsers: count || 0,
      percentageChange: 0,
      direction: "up",
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    // Return default values in case of error
    return {
      totalUsers: 0,
      percentageChange: 0,
      direction: "up",
      lastUpdated: new Date(),
    };
  }
}

// Interface for daily signup statistics
export interface DailySignupStats {
  dailySignups: number;
  percentageChange: number;
  direction: "up" | "down";
  lastUpdated: Date;
}

/**
 * Gets users registered in the last 24 hours
 */
export async function getDailySignups(): Promise<DailySignupStats> {
  const supabase = await createClient();

  try {
    // Calculate the timestamp for 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Count users created in the last 24 hours
    const { count: todayCount, error: todayError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday.toISOString());

    if (todayError) throw todayError;

    // Calculate the timestamp for 48 hours ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Count users created in the previous 24 hour period for comparison
    const { count: yesterdayCount, error: yesterdayError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", twoDaysAgo.toISOString())
      .lt("created_at", yesterday.toISOString());

    if (yesterdayError) throw yesterdayError;

    // Calculate percentage change
    const previousCount = yesterdayCount || 1; // Avoid division by zero
    const difference = (todayCount || 0) - previousCount;
    const percentageChange = Math.round((difference / previousCount) * 100);

    return {
      dailySignups: todayCount || 0,
      percentageChange: Math.abs(percentageChange),
      direction: percentageChange >= 0 ? "up" : "down",
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching daily signup stats:", error);
    return {
      dailySignups: 0,
      percentageChange: 0,
      direction: "up",
      lastUpdated: new Date(),
    };
  }
}
