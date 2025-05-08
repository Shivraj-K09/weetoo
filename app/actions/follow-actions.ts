"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  FollowCountResponse,
  FollowListResponse,
  FollowResponse,
  FollowStatusResponse,
  UserProfile,
} from "@/types";

/**
 * Follow a user
 * @param followingId ID of the user to follow
 */
export async function followUser(followingId: string): Promise<FollowResponse> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error in followUser:", authError);
      return {
        success: false,
        error: "You must be logged in to follow users",
      };
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking follow status:", checkError);
      return {
        success: false,
        error: "Failed to check follow status",
      };
    }

    // If already following, return success
    if (existingFollow) {
      return {
        success: true,
        message: "Already following this user",
      };
    }

    // Create the follow relationship
    const { error: insertError } = await supabase.from("user_follows").insert({
      follower_id: user.id,
      following_id: followingId,
    });

    if (insertError) {
      console.error("Error following user:", insertError);
      return {
        success: false,
        error: insertError.message,
      };
    }

    return {
      success: true,
      message: "Successfully followed user",
    };
  } catch (error) {
    console.error("Unexpected error in followUser:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Unfollow a user
 * @param followingId ID of the user to unfollow
 */
export async function unfollowUser(
  followingId: string
): Promise<FollowResponse> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error in unfollowUser:", authError);
      return {
        success: false,
        error: "You must be logged in to unfollow users",
      };
    }

    // Delete the follow relationship
    const { error: deleteError } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", followingId);

    if (deleteError) {
      console.error("Error unfollowing user:", deleteError);
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return {
      success: true,
      message: "Successfully unfollowed user",
    };
  } catch (error) {
    console.error("Unexpected error in unfollowUser:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Check if the current user is following a specific user
 * @param followingId ID of the user to check
 */
export async function getFollowStatus(
  followingId: string
): Promise<FollowStatusResponse> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error in getFollowStatus:", authError);
      return {
        success: false,
        error: "You must be logged in to check follow status",
        isFollowing: false,
      };
    }

    // Check if following
    const { data, error: checkError } = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", followingId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking follow status:", checkError);
      return {
        success: false,
        error: "Failed to check follow status",
        isFollowing: false,
      };
    }

    return {
      success: true,
      isFollowing: !!data,
    };
  } catch (error) {
    console.error("Unexpected error in getFollowStatus:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      isFollowing: false,
    };
  }
}

/**
 * Get the number of followers for a user
 * @param userId ID of the user to get follower count for
 */
export async function getFollowerCount(
  userId: string
): Promise<FollowCountResponse> {
  try {
    const supabase = await createClient();

    // Count followers
    const { count, error } = await supabase
      .from("user_follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userId);

    if (error) {
      console.error("Error getting follower count:", error);
      return {
        success: false,
        error: "Failed to get follower count",
        count: 0,
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getFollowerCount:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      count: 0,
    };
  }
}

/**
 * Get the number of users a user is following
 * @param userId ID of the user to get following count for
 */
export async function getFollowingCount(
  userId: string
): Promise<FollowCountResponse> {
  try {
    const supabase = await createClient();

    // Count following
    const { count, error } = await supabase
      .from("user_follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (error) {
      console.error("Error getting following count:", error);
      return {
        success: false,
        error: "Failed to get following count",
        count: 0,
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getFollowingCount:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      count: 0,
    };
  }
}

/**
 * Get a list of users following a specific user
 * @param userId ID of the user to get followers for
 * @param limit Maximum number of followers to return
 * @param page Page number for pagination
 */
export async function getFollowers(
  userId: string,
  limit = 10,
  page = 1
): Promise<FollowListResponse> {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // First, get the follow relationships
    const {
      data: followData,
      error: followError,
      count,
    } = await supabase
      .from("user_follows")
      .select("id, follower_id, created_at", { count: "exact" })
      .eq("following_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (followError) {
      console.error("Error getting followers:", followError);
      return {
        success: false,
        error: "Failed to get followers",
        users: [],
        count: 0,
      };
    }

    if (!followData || followData.length === 0) {
      return {
        success: true,
        users: [],
        count: 0,
      };
    }

    // Get the follower IDs
    const followerIds = followData.map((item) => item.follower_id);

    // Then, get the user details for these followers
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, avatar_url, kor_coins")
      .in("id", followerIds);

    if (userError) {
      console.error("Error getting follower details:", userError);
      return {
        success: false,
        error: "Failed to get follower details",
        users: [],
        count: 0,
      };
    }

    // Create a map of user data by ID for easy lookup
    const userMap = new Map();
    userData?.forEach((user) => {
      userMap.set(user.id, user);
    });

    // Combine the data
    const followers = followData
      .map((follow) => {
        const user = userMap.get(follow.follower_id);
        return user
          ? {
              ...user,
              follow_date: follow.created_at,
            }
          : null;
      })
      .filter(Boolean) as (UserProfile & { follow_date: string })[];

    return {
      success: true,
      users: followers,
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getFollowers:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      users: [],
      count: 0,
    };
  }
}

/**
 * Get a list of users a specific user is following
 * @param userId ID of the user to get following for
 * @param limit Maximum number of following to return
 * @param page Page number for pagination
 */
export async function getFollowing(
  userId: string,
  limit = 10,
  page = 1
): Promise<FollowListResponse> {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    // First, get the follow relationships
    const {
      data: followData,
      error: followError,
      count,
    } = await supabase
      .from("user_follows")
      .select("id, following_id, created_at", { count: "exact" })
      .eq("follower_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (followError) {
      console.error("Error getting following:", followError);
      return {
        success: false,
        error: "Failed to get following",
        users: [],
        count: 0,
      };
    }

    if (!followData || followData.length === 0) {
      return {
        success: true,
        users: [],
        count: 0,
      };
    }

    // Get the following IDs
    const followingIds = followData.map((item) => item.following_id);

    // Then, get the user details for these following
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email, avatar_url, kor_coins")
      .in("id", followingIds);

    if (userError) {
      console.error("Error getting following details:", userError);
      return {
        success: false,
        error: "Failed to get following details",
        users: [],
        count: 0,
      };
    }

    // Create a map of user data by ID for easy lookup
    const userMap = new Map();
    userData?.forEach((user) => {
      userMap.set(user.id, user);
    });

    // Combine the data
    const following = followData
      .map((follow) => {
        const user = userMap.get(follow.following_id);
        return user
          ? {
              ...user,
              follow_date: follow.created_at,
            }
          : null;
      })
      .filter(Boolean) as (UserProfile & { follow_date: string })[];

    return {
      success: true,
      users: following,
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getFollowing:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      users: [],
      count: 0,
    };
  }
}
