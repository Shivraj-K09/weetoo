"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define types for daily activity limits
interface DailyActivityLimits {
  id: string;
  user_id: string;
  activity_date: string;
  posts_created: number;
  comments_added: number;
  posts_liked: number;
  posts_shared: number;
  created_at?: string;
  updated_at?: string;
}

// Define point transaction type
interface PointTransaction {
  id: string;
  act_id: string;
  user_id: string;
  transaction_type: string;
  exp_earned: number;
  coins_earned: number;
  reference_id: string;
  reference_type: string;
  metadata: any;
  created_at: string;
}

// Define activity column type
type ActivityColumn =
  | "posts_created"
  | "comments_added"
  | "posts_liked"
  | "posts_shared";

// Check if user has reached daily limit for an activity
export async function checkDailyLimit(
  activityType: ActivityColumn
): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error("No authenticated user found:", userError);
      return false;
    }

    const userId = userData.user.id;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get today's activity record
    const { data, error } = await supabase
      .from("daily_activity_limits")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_date", today)
      .single();

    // If no record exists or there's an error, user hasn't reached any limits
    if (error || !data) {
      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking daily limits:", error);
      }
      return true;
    }

    // Check if user has reached the limit for the specified activity
    const limits = {
      posts_created: 20,
      comments_added: 30,
      posts_liked: 10,
      posts_shared: 5,
    };

    // Safely access the activity count
    const activityCount =
      typeof data[activityType] === "number" ? data[activityType] : 0;
    return activityCount < limits[activityType];
  } catch (error) {
    console.error("Unexpected error checking daily limit:", error);
    return false;
  }
}

// Award points to a user
export async function awardPoints(
  userId: string,
  transactionType:
    | "post_create"
    | "comment_add"
    | "post_like"
    | "post_share"
    | "welcome_bonus"
    | "daily_login",
  referenceId: string,
  referenceType: "post" | "comment" | "like" | "share" | "login" | "welcome",
  metadata: any = {}
): Promise<{
  success: boolean;
  error?: string;
  transaction?: PointTransaction;
}> {
  try {
    const supabase = await createServerClient();

    // Define point values
    const pointValues = {
      post_create: { exp: 100, coins: 50 },
      comment_add: { exp: 50, coins: 25 },
      post_like: { exp: 50, coins: 25 },
      post_share: { exp: 100, coins: 50 },
      welcome_bonus: { exp: 0, coins: 5000 },
      daily_login: { exp: 200, coins: 100 },
    };

    const { exp, coins } = pointValues[transactionType];

    // 1. Log the transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from("point_transactions")
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        exp_earned: exp,
        coins_earned: coins,
        reference_id: referenceId,
        reference_type: referenceType,
        metadata,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error logging point transaction:", transactionError);
      return { success: false, error: "Failed to log transaction" };
    }

    // 2. Update user's totals
    // Get current user values first
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("kor_coins, exp")
      .eq("id", userId)
      .single();

    if (getUserError) {
      console.error("Error getting user data:", getUserError);
      return { success: false, error: "Failed to get user data" };
    }

    // Calculate new values
    const newExp = (userData?.exp || 0) + exp;
    const newKorCoins = (userData?.kor_coins || 0) + coins;

    // Update with new values
    const { error: updateError } = await supabase
      .from("users")
      .update({
        exp: newExp,
        kor_coins: newKorCoins,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user points:", updateError);
      return { success: false, error: "Failed to update user points" };
    }

    // 3. Update daily activity count for regular activities (not bonuses)
    if (
      ["post_create", "comment_add", "post_like", "post_share"].includes(
        transactionType
      )
    ) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // Map transaction type to activity column
      const activityColumnMap = {
        post_create: "posts_created",
        comment_add: "comments_added",
        post_like: "posts_liked",
        post_share: "posts_shared",
      } as const;

      const activityColumn =
        activityColumnMap[transactionType as keyof typeof activityColumnMap];

      // Try to get existing record first
      const { data, error } = await supabase
        .from("daily_activity_limits")
        .select("*")
        .eq("user_id", userId)
        .eq("activity_date", today)
        .single();

      if (error) {
        // If the error is "no rows returned", create a new record
        if (error.code === "PGRST116") {
          // Create initial values for all columns
          const initialValues: Partial<DailyActivityLimits> = {
            user_id: userId,
            activity_date: today,
            posts_created: 0,
            comments_added: 0,
            posts_liked: 0,
            posts_shared: 0,
          };

          // Set the specific activity column to 1
          initialValues[activityColumn] = 1;

          // Insert the new record
          const { error: insertError } = await supabase
            .from("daily_activity_limits")
            .insert(initialValues);

          if (insertError) {
            console.error("Error creating daily activity record:", insertError);
          }
        } else {
          // For any other error, log it
          console.error("Error checking daily activity record:", error);
        }
      } else if (data) {
        // We have an existing record, update it
        // Create an update object with just the column we want to update
        const updateValues: Partial<DailyActivityLimits> = {};
        updateValues[activityColumn] = (data[activityColumn] || 0) + 1;

        // Update the record
        const { error: updateError } = await supabase
          .from("daily_activity_limits")
          .update(updateValues)
          .eq("id", data.id);

        if (updateError) {
          console.error("Error updating daily activity:", updateError);
        }
      }
    }

    // Revalidate the user profile page
    revalidatePath(`/profile/${userId}`);

    return {
      success: true,
      transaction: transactionData as PointTransaction,
    };
  } catch (error) {
    console.error("Unexpected error awarding points:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Get user's point transactions
export async function getUserPointTransactions(
  userId: string,
  limit = 10,
  offset = 0
): Promise<{ transactions: PointTransaction[]; count: number }> {
  try {
    const supabase = await createServerClient();

    // Get transactions
    const { data, error, count } = await supabase
      .from("point_transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching point transactions:", error);
      return { transactions: [], count: 0 };
    }

    return {
      transactions: data as PointTransaction[],
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected error fetching point transactions:", error);
    return { transactions: [], count: 0 };
  }
}

// Check if user has received a login bonus in the last 24 hours
export async function hasReceivedLoginBonusLast24Hours(
  userId: string
): Promise<{
  received: boolean;
  nextEligibleTime?: string;
  timeRemaining?: number; // in milliseconds
}> {
  try {
    const supabase = await createServerClient();

    // Get the most recent daily login bonus
    const { data, error } = await supabase
      .from("point_transactions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("transaction_type", "daily_login")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error checking login bonus:", error);
      return { received: false };
    }

    // If no previous login bonus, user is eligible
    if (!data || data.length === 0) {
      return { received: false };
    }

    const lastBonusTime = new Date(data[0].created_at).getTime();
    const currentTime = new Date().getTime();
    const timeSinceLastBonus = currentTime - lastBonusTime;
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // If it's been less than 24 hours, user is not eligible yet
    if (timeSinceLastBonus < twentyFourHours) {
      const nextEligibleTime = new Date(lastBonusTime + twentyFourHours);
      const timeRemaining = twentyFourHours - timeSinceLastBonus;

      return {
        received: true,
        nextEligibleTime: nextEligibleTime.toISOString(),
        timeRemaining: timeRemaining,
      };
    }

    // It's been more than 24 hours, user is eligible
    return { received: false };
  } catch (error) {
    console.error("Unexpected error checking login bonus:", error);
    return { received: false };
  }
}

// Check and award welcome bonus if user hasn't received it yet
export async function checkAndAwardWelcomeBonus(userId: string): Promise<{
  success: boolean;
  awarded: boolean;
  error?: string;
  transaction?: PointTransaction;
}> {
  try {
    const supabase = await createServerClient();

    // Check if user has already received welcome bonus
    const { data, error } = await supabase
      .from("point_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("transaction_type", "welcome_bonus")
      .maybeSingle();

    if (error) {
      console.error("Error checking welcome bonus:", error);
      return {
        success: false,
        awarded: false,
        error: "Failed to check welcome bonus status",
      };
    }

    // If user already has welcome bonus, return early
    if (data) {
      return { success: true, awarded: false };
    }

    // Award welcome bonus
    const result = await awardPoints(
      userId,
      "welcome_bonus",
      `welcome_${userId}`,
      "login",
      {
        first_login: new Date().toISOString(),
      }
    );

    return {
      success: result.success,
      awarded: result.success,
      error: result.error,
      transaction: result.transaction,
    };
  } catch (error) {
    console.error("Unexpected error checking welcome bonus:", error);
    return {
      success: false,
      awarded: false,
      error: "An unexpected error occurred",
    };
  }
}

// Check and award daily login bonus if user hasn't received it in the last 24 hours
export async function checkAndAwardDailyLoginBonus(userId: string): Promise<{
  success: boolean;
  awarded: boolean;
  error?: string;
  transaction?: PointTransaction;
  streak?: number;
  nextEligibleTime?: string;
  timeRemaining?: number;
}> {
  try {
    const supabase = await createServerClient();

    // Check if user has received a login bonus in the last 24 hours
    const eligibilityCheck = await hasReceivedLoginBonusLast24Hours(userId);

    // If user has received a bonus in the last 24 hours, return early with next eligible time
    if (eligibilityCheck.received) {
      return {
        success: true,
        awarded: false,
        nextEligibleTime: eligibilityCheck.nextEligibleTime,
        timeRemaining: eligibilityCheck.timeRemaining,
      };
    }

    // Calculate streak
    let streak = 1;

    // Get the most recent daily login bonus
    const { data: lastLoginData } = await supabase
      .from("point_transactions")
      .select("created_at, metadata")
      .eq("user_id", userId)
      .eq("transaction_type", "daily_login")
      .order("created_at", { ascending: false })
      .limit(1);

    if (lastLoginData && lastLoginData.length > 0) {
      const lastLoginTime = new Date(lastLoginData[0].created_at).getTime();
      const currentTime = new Date().getTime();
      const timeSinceLastLogin = currentTime - lastLoginTime;

      // Check if last login was within 48 hours (24 hours for eligibility + 24 hours for streak)
      if (timeSinceLastLogin < 48 * 60 * 60 * 1000) {
        // Continue streak if previous metadata has streak info
        if (lastLoginData[0].metadata && lastLoginData[0].metadata.streak) {
          streak = lastLoginData[0].metadata.streak + 1;
        }
      }
    }

    // Award daily login bonus
    const now = new Date();
    const result = await awardPoints(
      userId,
      "daily_login",
      `daily_${userId}_${now.getTime()}`,
      "login",
      {
        login_time: now.toISOString(),
        streak,
        next_eligible_time: new Date(
          now.getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
      }
    );

    return {
      success: result.success,
      awarded: result.success,
      error: result.error,
      transaction: result.transaction,
      streak,
      nextEligibleTime: new Date(
        now.getTime() + 24 * 60 * 60 * 1000
      ).toISOString(),
      timeRemaining: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };
  } catch (error) {
    console.error("Unexpected error checking daily login bonus:", error);
    return {
      success: false,
      awarded: false,
      error: "An unexpected error occurred",
    };
  }
}

// Check and award all bonuses (welcome and daily login)
export async function checkAndAwardAllBonuses(userId: string): Promise<{
  success: boolean;
  welcomeBonus: { awarded: boolean; transaction?: PointTransaction };
  dailyLoginBonus: {
    awarded: boolean;
    transaction?: PointTransaction;
    streak?: number;
    nextEligibleTime?: string;
    timeRemaining?: number;
  };
  error?: string;
}> {
  try {
    // Check welcome bonus
    const welcomeResult = await checkAndAwardWelcomeBonus(userId);

    // Check daily login bonus
    const dailyLoginResult = await checkAndAwardDailyLoginBonus(userId);

    return {
      success: welcomeResult.success && dailyLoginResult.success,
      welcomeBonus: {
        awarded: welcomeResult.awarded,
        transaction: welcomeResult.transaction,
      },
      dailyLoginBonus: {
        awarded: dailyLoginResult.awarded,
        transaction: dailyLoginResult.transaction,
        streak: dailyLoginResult.streak,
        nextEligibleTime: dailyLoginResult.nextEligibleTime,
        timeRemaining: dailyLoginResult.timeRemaining,
      },
      error: welcomeResult.error || dailyLoginResult.error,
    };
  } catch (error) {
    console.error("Unexpected error checking all bonuses:", error);
    return {
      success: false,
      welcomeBonus: { awarded: false },
      dailyLoginBonus: { awarded: false },
      error: "An unexpected error occurred",
    };
  }
}

// Add this new function to revoke points
export async function revokePoints(
  userId: string,
  transactionType: string,
  referenceId: string,
  reason = "Admin action"
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();

    // Find the original transaction
    const { data: transactions, error: fetchError } = await supabase
      .from("point_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("transaction_type", transactionType)
      .eq("reference_id", referenceId);

    if (fetchError) {
      console.error("Error fetching point transactions:", fetchError);
      return { success: false, error: "Failed to find original transaction" };
    }

    if (!transactions || transactions.length === 0) {
      console.warn("No transactions found to revoke");
      return { success: true }; // Nothing to revoke
    }

    // Get the total points awarded in these transactions
    let totalExp = 0;
    let totalCoins = 0;

    transactions.forEach((transaction) => {
      totalExp += transaction.exp_earned || 0;
      totalCoins += transaction.coins_earned || 0;
    });

    // Create a reversal transaction
    const { error: transactionError } = await supabase
      .from("point_transactions")
      .insert({
        user_id: userId,
        transaction_type: `${transactionType}_revoke`,
        exp_earned: -totalExp, // Negative to indicate reversal
        coins_earned: -totalCoins, // Negative to indicate reversal
        reference_id: referenceId,
        reference_type: "revoke",
        metadata: {
          reason,
          original_transactions: transactions.map((t) => t.id),
          revoked_at: new Date().toISOString(),
        },
      });

    if (transactionError) {
      console.error("Error logging point revocation:", transactionError);
      return { success: false, error: "Failed to log transaction" };
    }

    // Update user's totals
    // Get current user values first
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("kor_coins, exp")
      .eq("id", userId)
      .single();

    if (getUserError) {
      console.error("Error getting user data:", getUserError);
      return { success: false, error: "Failed to get user data" };
    }

    // Calculate new values (ensure they don't go below 0)
    const newExp = Math.max(0, (userData?.exp || 0) - totalExp);
    const newKorCoins = Math.max(0, (userData?.kor_coins || 0) - totalCoins);

    // Update with new values
    const { error: updateError } = await supabase
      .from("users")
      .update({
        exp: newExp,
        kor_coins: newKorCoins,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user points:", updateError);
      return { success: false, error: "Failed to update user points" };
    }

    // Revalidate the user profile page
    revalidatePath(`/profile/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Unexpected error revoking points:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
