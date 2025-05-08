"use server";

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Define the ranking types
export type RankingType =
  | "profit"
  | "virtual"
  | "sponsored"
  | "activity"
  | "followers";

// Define the structure of a ranking entry
export interface RankingEntry {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  value: number;
  rank: number;
}

// Define the structure of the ranking response
export interface RankingResponse {
  rankings: RankingEntry[];
  lastUpdated: string;
}

// Add type for the ranking data
interface RankingData {
  user_id: string;
  [key: string]: any;
}

/**
 * Fetches user rankings based on the specified type
 * @param type The type of ranking to fetch (profit, virtual, sponsored, activity, followers)
 * @param limit The maximum number of results to return
 * @returns A promise that resolves to the ranking data
 */
export async function getRankings(
  type: RankingType = "profit",
  limit = 5
): Promise<RankingResponse> {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient();

    let rankings: RankingEntry[] = [];

    // Handle activity ranking separately since it's directly from the users table
    if (type === "activity") {
      const { data: activityData, error: activityError } = await supabase
        .from("users")
        .select(
          `
          id,
          first_name,
          last_name,
          avatar_url,
          exp
        `
        )
        .not("exp", "is", null)
        .order("exp", { ascending: false })
        .limit(limit);

      console.log("Activity ranking query result:", {
        data: activityData,
        error: activityError,
      });

      if (activityError) {
        console.error("Error fetching activity rankings:", activityError);
      } else if (activityData) {
        rankings = activityData.map((item, index) => {
          const displayName =
            [item.first_name, item.last_name].filter(Boolean).join(" ") ||
            "Unknown User";

          return {
            user_id: item.id,
            username: displayName,
            avatar_url: item.avatar_url,
            value: item.exp || 0,
            rank: index + 1,
          };
        });
      }

      return {
        rankings,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Handle followers ranking separately since it requires a different query approach
    if (type === "followers") {
      try {
        // Get users with the most followers
        const { data: followersData, error: followersError } =
          await supabase.rpc("get_most_followed_users", {
            limit_count: limit,
          });

        if (followersError) {
          console.error("Error fetching followers rankings:", followersError);
          return {
            rankings: [],
            lastUpdated: new Date().toISOString(),
          };
        }

        if (followersData && followersData.length > 0) {
          // Get user IDs from the followers data
          const userIds = followersData.map(
            (item: { following_id: string }) => item.following_id
          );

          // Fetch user details for these IDs
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, first_name, last_name, avatar_url")
            .in("id", userIds);

          if (userError) {
            console.error(
              "Error fetching user data for followers ranking:",
              userError
            );
          } else if (userData) {
            // Create a map of user data for quick lookup
            const userMap = new Map(userData.map((user) => [user.id, user]));

            // Combine followers data with user data
            rankings = followersData.map(
              (
                item: { following_id: string; follower_count: number },
                index: number
              ) => {
                const user = userMap.get(item.following_id);
                const displayName = user
                  ? [user.first_name, user.last_name].filter(Boolean).join(" ")
                  : "Unknown User";

                return {
                  user_id: item.following_id,
                  username: displayName,
                  avatar_url: user?.avatar_url || null,
                  value: Number(item.follower_count),
                  rank: index + 1,
                };
              }
            );
          }
        }

        return {
          rankings,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Error in followers ranking:", error);
        return {
          rankings: [],
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    // For other ranking types, we need to fetch the ranking data first
    // Fix the type annotations in the main switch statement
    let rankingData: RankingData[] = [];
    let rankingError = null;
    let valueField = "";
    let tableName = "";

    switch (type) {
      case "profit":
        tableName = "user_profit_rates";
        valueField = "cumulative_profit_rate";
        const profitResult = await supabase
          .from("user_profit_rates")
          .select("*")
          .order("cumulative_profit_rate", { ascending: false })
          .limit(limit);

        rankingData = profitResult.data || [];
        rankingError = profitResult.error;
        break;

      case "virtual":
        tableName = "user_virtual_profits";
        valueField = "total_profit";
        const virtualResult = await supabase
          .from("user_virtual_profits")
          .select("*")
          .order("total_profit", { ascending: false })
          .limit(limit);

        rankingData = virtualResult.data || [];
        rankingError = virtualResult.error;
        break;

      case "sponsored":
        tableName = "user_donation_totals";
        valueField = "total_donations_received";
        const sponsoredResult = await supabase
          .from("user_donation_totals")
          .select("*")
          .order("total_donations_received", { ascending: false })
          .limit(limit);

        rankingData = sponsoredResult.data || [];
        rankingError = sponsoredResult.error;
        break;
    }

    if (rankingError) {
      console.error(`Error fetching ${type} rankings:`, rankingError);
      return {
        rankings: [],
        lastUpdated: new Date().toISOString(),
      };
    }

    // If we have ranking data, fetch the corresponding user information
    if (rankingData.length > 0) {
      // Extract user IDs from the ranking data
      const userIds = rankingData.map((item) => item.user_id);

      // Fetch user information for these IDs
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name, avatar_url")
        .in("id", userIds);

      if (userError) {
        console.error("Error fetching user data:", userError);
      } else if (userData) {
        // Create a map of user data for quick lookup
        const userMap = new Map(userData.map((user) => [user.id, user]));

        // Fix the type annotations in the user data mapping
        rankings = rankingData.map((item: RankingData, index: number) => {
          const user = userMap.get(item.user_id);
          const displayName = user
            ? [user.first_name, user.last_name].filter(Boolean).join(" ")
            : "Unknown User";

          return {
            user_id: item.user_id,
            username: displayName,
            avatar_url: user?.avatar_url || null,
            value: item[valueField] || 0,
            rank: index + 1,
          };
        });
      }
    }

    return {
      rankings,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in getRankings:", error);
    // Return empty rankings instead of throwing to prevent UI errors
    return {
      rankings: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Fetches a user's ranking information
 * @param userId The ID of the user
 * @param type The type of ranking to fetch
 * @returns The user's ranking information
 */
export async function getUserRanking(
  userId: string,
  type: RankingType = "profit"
): Promise<{ rank: number; value: number } | null> {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient();

    // Special handling for followers ranking
    if (type === "followers") {
      // Get the user's follower count
      const { data: followerData, error: followerError } = await supabase
        .from("user_follows")
        .select("following_id", { count: "exact" })
        .eq("following_id", userId);

      if (followerError) {
        console.error("Error getting user follower count:", followerError);
        return null;
      }

      const followerCount = followerData?.length || 0;

      // Count how many users have more followers
      const { data: higherRankedData, error: rankError } = await supabase.rpc(
        "get_users_with_more_followers",
        {
          min_followers: followerCount,
        }
      );

      if (rankError) {
        console.error("Error getting user follower rank:", rankError);
        return null;
      }

      return {
        rank: (higherRankedData?.length || 0) + 1,
        value: followerCount,
      };
    }

    let tableName: string;
    let valueColumn: string;
    let idColumn = "user_id";

    // Determine the table and column based on ranking type
    switch (type) {
      case "profit":
        tableName = "user_profit_rates";
        valueColumn = "cumulative_profit_rate";
        break;
      case "virtual":
        tableName = "user_virtual_profits";
        valueColumn = "total_profit";
        break;
      case "sponsored":
        tableName = "user_donation_totals";
        valueColumn = "total_donations_received";
        break;
      case "activity":
        tableName = "users";
        valueColumn = "exp";
        idColumn = "id";
        break;
      default:
        throw new Error(`Invalid ranking type: ${type}`);
    }

    // Get the user's value
    const { data: userData, error: userError } = await supabase
      .from(tableName)
      .select(valueColumn)
      .eq(idColumn, userId)
      .single();

    if (userError || !userData) {
      return null;
    }

    const userValue = userData[valueColumn as keyof typeof userData];

    // Count how many users have a higher value
    const { count, error: countError } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .gt(valueColumn, userValue);

    if (countError) {
      console.error("Error getting user rank:", countError);
      return null;
    }

    // The rank is the count of users with higher values plus 1
    return {
      rank: (count || 0) + 1,
      value: Number(userValue),
    };
  } catch (error) {
    console.error("Error in getUserRanking:", error);
    return null;
  }
}
