"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Post } from "@/types";

// Get all posts for admin (including pending ones)
export async function getAdminPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      return [];
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      console.error("User is not authorized to access admin posts");
      return [];
    }

    // Fetch all posts with user information
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          avatar_url,
          email
        ),
        moderator:moderated_by (
          id,
          first_name,
          last_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin posts:", error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error("Unexpected error fetching admin posts:", error);
    return [];
  }
}

// Get pending posts that need review
export async function getPendingPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      return [];
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      console.error("User is not authorized to access pending posts");
      return [];
    }

    // Fetch pending posts with user information
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          avatar_url,
          email
        )
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending posts:", error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error("Unexpected error fetching pending posts:", error);
    return [];
  }
}

// Approve a post
export async function approvePost(postId: string) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No authenticated user found" };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      return { error: "You are not authorized to approve posts" };
    }

    // Get post data to check if points were already awarded
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id, points_awarded, title")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("Error fetching post:", postError);
      return { error: "Post not found" };
    }

    // Update post status to approved
    const { error } = await supabase
      .from("posts")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
        points_awarded: post.points_awarded, // Keep existing value
      })
      .eq("id", postId);

    if (error) {
      console.error("Error approving post:", error);
      return { error: error.message };
    }

    // Award points if not already awarded
    let pointsAwarded = false;
    if (!post.points_awarded) {
      // Award points to the post author
      await awardPoints(post.user_id, "post_create", postId, "post", {
        post_title: post.title,
      });

      // Update the points_awarded flag
      await supabase
        .from("posts")
        .update({ points_awarded: true })
        .eq("id", postId);
      pointsAwarded = true;
    }

    // Revalidate paths
    revalidatePath("/admin/manage-posts");
    revalidatePath("/free-board");

    return {
      success: true,
      message: "Post approved successfully",
      pointsAwarded,
    };
  } catch (error: any) {
    console.error("Unexpected error approving post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Reject a post
export async function rejectPost(postId: string) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No authenticated user found" };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      return { error: "You are not authorized to reject posts" };
    }

    // Update post status to rejected
    const { error } = await supabase
      .from("posts")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString(),
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error rejecting post:", error);
      return { error: error.message };
    }

    // Revalidate paths
    revalidatePath("/admin/manage-posts");
    revalidatePath("/free-board");

    return { success: true, message: "Post rejected successfully" };
  } catch (error: any) {
    console.error("Unexpected error rejecting post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Hide/unhide a post
export async function togglePostVisibility(postId: string, isVisible: boolean) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No authenticated user found" };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      return { error: "You are not authorized to change post visibility" };
    }

    // Update post status
    const newStatus = isVisible ? "approved" : "hidden";
    const { error } = await supabase
      .from("posts")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error toggling post visibility:", error);
      return { error: error.message };
    }

    // Revalidate paths
    revalidatePath("/admin/manage-posts");
    revalidatePath("/free-board");

    return {
      success: true,
      message: isVisible ? "Post is now visible" : "Post is now hidden",
    };
  } catch (error: any) {
    console.error("Unexpected error toggling post visibility:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Delete a post
export async function deletePost(postId: string) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No authenticated user found" };
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      return { error: "You are not authorized to delete posts" };
    }

    // Update post status to deleted
    const { error } = await supabase
      .from("posts")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
        moderated_by: user.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return { error: error.message };
    }

    // Revalidate paths
    revalidatePath("/admin/manage-posts");
    revalidatePath("/free-board");

    return { success: true, message: "Post deleted successfully" };
  } catch (error: any) {
    console.error("Unexpected error deleting post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Define the PointTransaction type
export interface PointTransaction {
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
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    uid: string | null;
  };
}

// Get all point transactions for admin - using a manual approach without relying on foreign keys
export async function getPointTransactions(): Promise<PointTransaction[]> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      return [];
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      console.error("User is not authorized to access point transactions");
      return [];
    }

    // 1. Fetch all point transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("point_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching point transactions:", transactionsError);
      return [];
    }

    console.log("Fetched transactions:", transactions); // Add this log to debug

    // 2. Get unique user IDs from transactions
    const userIds = [...new Set(transactions.map((t) => t.user_id))];

    // 3. Fetch user data for these IDs
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar_url, uid")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      // Continue with transactions but without user data
    }

    // 4. Create a map of user data by ID for quick lookup
    const userMap = (users || []).reduce(
      (map, user) => {
        map[user.id] = user;
        return map;
      },
      {} as Record<string, any>
    );

    // 5. Combine transaction data with user data
    const transactionsWithUsers = transactions.map((transaction) => ({
      ...transaction,
      user: userMap[transaction.user_id] || null,
    }));

    console.log("Transactions with users:", transactionsWithUsers); // Add this log to debug

    return transactionsWithUsers as PointTransaction[];
  } catch (error) {
    console.error("Unexpected error fetching point transactions:", error);
    return [];
  }
}

// Get a single point transaction by ID - using a manual approach
export async function getPointTransactionById(
  id: string
): Promise<PointTransaction | null> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user found");
      return null;
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      console.error("User is not authorized to access point transactions");
      return null;
    }

    // 1. Fetch the point transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("point_transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (transactionError) {
      console.error("Error fetching point transaction:", transactionError);
      return null;
    }

    // 2. Fetch the associated user
    const { data: userData2, error: userData2Error } = await supabase
      .from("users")
      .select("id, first_name, last_name, avatar_url, uid")
      .eq("id", transaction.user_id)
      .single();

    if (userData2Error) {
      console.error("Error fetching user data:", userData2Error);
      // Continue with transaction but without user data
    }

    // 3. Combine transaction with user data
    const transactionWithUser = {
      ...transaction,
      user: userData2 || null,
    };

    return transactionWithUser as PointTransaction;
  } catch (error) {
    console.error("Unexpected error fetching point transaction:", error);
    return null;
  }
}

// Import the awardPoints function from point-system-actions
import { awardPoints } from "./point-system-actions";
