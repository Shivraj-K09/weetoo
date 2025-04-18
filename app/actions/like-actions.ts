"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkDailyLimit, awardPoints } from "./point-system-actions";

// Toggle like status (like or unlike)
export async function togglePostLike(postId: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: "You must be logged in to like posts" };
    }

    const userId = userData.user.id;

    // First, check if the user is the post owner
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("Error fetching post:", postError);
      return { error: "Failed to fetch post details" };
    }

    // Prevent post owners from liking their own posts
    if (post.user_id === userId) {
      return { error: "You cannot like your own post" };
    }

    // Check if the user has already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" which is expected if the user hasn't liked the post
      console.error("Error checking like status:", checkError);
      return { error: "Failed to check like status" };
    }

    let result;

    // If the user has already liked the post, remove the like
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (unlikeError) {
        console.error("Error unliking post:", unlikeError);
        return { error: "Failed to unlike post" };
      }

      result = { liked: false, message: "Post unliked successfully" };
    }
    // Otherwise, add a new like
    else {
      // Check if user has reached daily like limit
      const canLike = await checkDailyLimit("posts_liked");

      if (!canLike) {
        return { error: "You've reached your daily limit of 10 likes" };
      }

      const { error: likeError } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: userId,
      });

      if (likeError) {
        console.error("Error liking post:", likeError);
        return { error: "Failed to like post" };
      }

      // Award points for liking
      const { data: postData } = await supabase
        .from("posts")
        .select("title")
        .eq("id", postId)
        .single();

      const postTitle = postData?.title || "Unknown post";

      await awardPoints(userId, "post_like", postId, "like", {
        post_title: postTitle,
      });

      result = { liked: true, message: "Post liked successfully" };
    }

    // Revalidate the post page to update the UI
    revalidatePath(`/free-board/${postId}`);

    return result;
  } catch (error: any) {
    console.error("Unexpected error toggling post like:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Get the number of likes for a post
export async function getPostLikeCount(postId: string): Promise<number> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("post_likes")
      .select("*", { count: "exact" })
      .eq("post_id", postId);

    if (error) {
      console.error("Error fetching like count:", error);
      return 0;
    }

    return data.length;
  } catch (error) {
    console.error("Unexpected error fetching like count:", error);
    return 0;
  }
}

// Check if a user has liked a post
export async function hasUserLikedPost(postId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return false;
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking if user liked post:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Unexpected error checking if user liked post:", error);
    return false;
  }
}
