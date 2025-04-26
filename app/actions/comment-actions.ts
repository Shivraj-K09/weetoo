"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkDailyLimit, awardPoints } from "./point-system-actions";

// Define Comment type
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Get comments for a specific post
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("comments")
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
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    return data as Comment[];
  } catch (error) {
    console.error("Unexpected error fetching comments:", error);
    return [];
  }
}

// Add a new comment
export async function addComment(postId: string, content: string) {
  try {
    const supabase = await createServerClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: "You must be logged in to comment" };
    }

    const userId = userData.user.id;

    // Validate content
    if (!content.trim()) {
      return { error: "Comment cannot be empty" };
    }

    // Check if user has reached daily comment limit
    const canComment = await checkDailyLimit("comments_added");

    if (!canComment) {
      return { error: "You've reached your daily limit of 30 comments" };
    }

    // Insert the comment
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return { error: error.message };
    }

    // Get post title for metadata
    const { data: postData } = await supabase
      .from("posts")
      .select("title")
      .eq("id", postId)
      .single();

    const postTitle = postData?.title || "Unknown post";

    // Award points for commenting
    await awardPoints(userId, "comment_add", data.id, "comment", {
      post_id: postId,
      post_title: postTitle,
    });

    // Revalidate the post page to update the UI
    revalidatePath(`/free-board/${postId}`);

    return { success: true, comment: data };
  } catch (error: any) {
    console.error("Unexpected error adding comment:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Delete a comment
export async function deleteComment(commentId: string, postId: string) {
  try {
    const supabase = await createServerClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: "You must be logged in to delete a comment" };
    }

    const userId = userData.user.id;

    // Check if the user is the author of the comment
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (fetchError) {
      console.error("Error fetching comment:", fetchError);
      return { error: "Comment not found" };
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    const isAdmin =
      userRole?.role === "admin" || userRole?.role === "super_admin";

    // Only allow the author or an admin to delete the comment
    if (comment.user_id !== userId && !isAdmin) {
      return { error: "You can only delete your own comments" };
    }

    // Delete the comment
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      return { error: error.message };
    }

    // Revalidate the post page to update the UI
    revalidatePath(`/free-board/${postId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error deleting comment:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Update a comment
export async function updateComment(
  commentId: string,
  content: string,
  postId: string
) {
  try {
    const supabase = await createServerClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: "You must be logged in to update a comment" };
    }

    const userId = userData.user.id;

    // Validate content
    if (!content.trim()) {
      return { error: "Comment cannot be empty" };
    }

    // Check if the user is the author of the comment
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (fetchError) {
      console.error("Error fetching comment:", fetchError);
      return { error: "Comment not found" };
    }

    if (comment.user_id !== userId) {
      return { error: "You can only edit your own comments" };
    }

    // Update the comment
    const { error } = await supabase
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    if (error) {
      console.error("Error updating comment:", error);
      return { error: error.message };
    }

    // Revalidate the post page to update the UI
    revalidatePath(`/free-board/${postId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error updating comment:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Get comment count for a post
export async function getCommentCount(postId: string): Promise<number> {
  try {
    const supabase = await createServerClient();

    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("Error fetching comment count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Unexpected error fetching comment count:", error);
    return 0;
  }
}
