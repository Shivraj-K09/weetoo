"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkDailyLimit, awardPoints } from "./point-system-actions";

// Define Share type
export interface Share {
  id: string;
  post_id: string;
  user_id: string;
  share_type: string;
  created_at: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Track a share action
export async function trackShare(postId: string, shareType: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: "You must be logged in to share" };
    }

    const userId = userData.user.id;

    // Check if user has reached daily share limit
    const canShare = await checkDailyLimit("posts_shared");

    if (!canShare) {
      return { error: "You've reached your daily limit of 5 shares" };
    }

    // Record the share
    const { data, error } = await supabase
      .from("post_shares")
      .insert({
        post_id: postId,
        user_id: userId,
        share_type: shareType,
      })
      .select()
      .single();

    if (error) {
      console.error("Error tracking share:", error);
      return { error: error.message };
    }

    // Get post title for metadata
    const { data: postData } = await supabase
      .from("posts")
      .select("title")
      .eq("id", postId)
      .single();

    const postTitle = postData?.title || "Unknown post";

    // Award points for sharing
    await awardPoints(userId, "post_share", postId, "share", {
      post_title: postTitle,
      share_platform: shareType,
    });

    // Revalidate the post page to update the UI
    revalidatePath(`/free-board/${postId}`);

    return { success: true, share: data };
  } catch (error: any) {
    console.error("Unexpected error tracking share:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Get share count for a post
export async function getShareCount(postId: string): Promise<number> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("post_shares")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("Error fetching share count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Unexpected error fetching share count:", error);
    return 0;
  }
}

// Get recent shares for a post
export async function getRecentShares(
  postId: string,
  limit = 5
): Promise<Share[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("post_shares")
      .select(
        `
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent shares:", error);
      return [];
    }

    return data as Share[];
  } catch (error) {
    console.error("Unexpected error fetching recent shares:", error);
    return [];
  }
}

// Check if user has shared a post
export async function hasUserShared(postId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return false;
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("post_shares")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking if user shared post:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Unexpected error checking if user shared post:", error);
    return false;
  }
}
