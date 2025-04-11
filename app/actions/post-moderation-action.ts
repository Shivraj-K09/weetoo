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

    // Update post status to approved
    const { error } = await supabase
      .from("posts")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", postId);

    if (error) {
      console.error("Error approving post:", error);
      return { error: error.message };
    }

    // Revalidate paths
    revalidatePath("/admin/manage-posts");
    revalidatePath("/free-board");

    return { success: true, message: "Post approved successfully" };
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
      .update({ status: "rejected", updated_at: new Date().toISOString() })
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
      .update({ status: newStatus, updated_at: new Date().toISOString() })
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
      .update({ status: "deleted", updated_at: new Date().toISOString() })
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
