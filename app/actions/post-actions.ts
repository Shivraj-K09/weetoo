"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Post } from "@/types";
import { checkDailyLimit } from "./point-system-actions";
import { awardPoints } from "./point-system-actions";

// Fetch all posts
export async function getPosts(): Promise<Post[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name
        )
      `
      )
      .eq("status", "approved") // Only fetch approved posts
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error("Unexpected error fetching posts:", error);
    return [];
  }
}

// Fetch top viewed posts
export async function getTopViewedPosts(count: number): Promise<Post[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name
        )
      `
      )
      .eq("status", "approved") // Only fetch approved posts
      .order("view_count", { ascending: false })
      .limit(count);

    if (error) {
      console.error("Error fetching top viewed posts:", error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error("Unexpected error fetching top viewed posts:", error);
    return [];
  }
}

// Fetch a single post by ID without incrementing view count
export async function getPost(id: string): Promise<Post | null> {
  try {
    const supabase = await createClient();

    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return null;
    }

    return post as Post;
  } catch (error) {
    console.error("Unexpected error fetching post:", error);
    return null;
  }
}

// Separate action to increment view count - this will be called from the client
export async function incrementPostView(postId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Get the current user - using getUser() for security
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    // Get the post to check if the current user is the author
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id, view_count")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error("Error fetching post for view increment:", postError);
      return;
    }

    // Don't count views from the post author
    if (user && user.id === post.user_id) {
      return;
    }

    // Check if this user/browser has already viewed this post recently
    const cookieStore = await cookies();
    const viewedPostsCookie = cookieStore.get(`viewed_post_${postId}`);

    if (viewedPostsCookie) {
      return;
    }

    // Set a cookie that expires in 1 hour to prevent counting multiple views
    cookieStore.set(`viewed_post_${postId}`, "1", {
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    // Increment view count
    const { error: updateError } = await supabase
      .from("posts")
      .update({ view_count: post.view_count + 1 })
      .eq("id", postId);

    if (updateError) {
      console.error("Error updating view count:", updateError);
    }
  } catch (error) {
    console.error("Unexpected error incrementing post view:", error);
  }
}

// Create a new post with auto-approval
export async function createPost(formData: FormData) {
  console.log("Server action: createPost called");

  try {
    const supabase = await createClient();

    // Get the current user - using getUser() for security
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("No authenticated user found:", userError);
      return { error: "You must be logged in to create a post" };
    }

    const user = userData.user;
    console.log("User authenticated:", user.id);

    // Check if user has reached daily post limit
    const canPost = await checkDailyLimit("posts_created");

    if (!canPost) {
      return { error: "You've reached your daily limit of 20 posts" };
    }

    // Extract form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const tagsString = formData.get("tags") as string;
    const featuredImagesString = formData.get("featuredImages") as string;
    const captchaToken = formData.get("captchaToken") as string;

    // Verify CAPTCHA token if provided
    if (!captchaToken) {
      return { error: "CAPTCHA verification failed. Please try again." };
    }

    // Parse tags and featured images
    const tags = tagsString ? JSON.parse(tagsString) : [];
    const featured_images = featuredImagesString
      ? JSON.parse(featuredImagesString)
      : [];

    console.log("Extracted form data:", {
      title,
      category,
      tags: tags.length,
      images: featured_images.length,
    });

    // Validate required fields
    if (!title || !content || !category) {
      console.error("Missing required fields");
      return { error: "Title, content, and category are required" };
    }

    // Insert the post with status 'pending' so it appears in admin dashboard
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        user_id: user.id,
        category,
        tags,
        featured_images,
        status: "pending", // Set to pending so it appears in admin dashboard
        view_count: 0,
        points_awarded: true, // Mark points as awarded
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating post:", error);
      return { error: error.message };
    }

    console.log("Post created successfully:", post.id);

    // Award points immediately
    const pointResult = await awardPoints(
      user.id,
      "post_create",
      post.id,
      "post",
      { post_title: title, category }
    );

    if (!pointResult.success) {
      console.error("Error awarding points:", pointResult.error);
      // Continue even if points fail - we'll handle this separately
    }

    // Update daily activity count
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Try to update existing record first
    const { data: existingRecord, error: checkError } = await supabase
      .from("daily_activity_limits")
      .select("id, posts_created")
      .eq("user_id", user.id)
      .eq("activity_date", today)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking daily activity record:", checkError);
    }

    if (existingRecord) {
      // Update existing record - don't use RPC, just update directly
      const { error: activityError } = await supabase
        .from("daily_activity_limits")
        .update({
          posts_created: (existingRecord.posts_created || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);

      if (activityError) {
        console.error("Error updating daily activity:", activityError);
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("daily_activity_limits")
        .insert({
          user_id: user.id,
          activity_date: today,
          posts_created: 1,
        });

      if (insertError) {
        console.error("Error creating daily activity record:", insertError);
      }
    }

    // Log admin activity for auto-approval
    try {
      // Insert directly into admin_activity_log table
      const { error: logError } = await supabase
        .from("admin_activity_log")
        .insert({
          action: "post_auto_approve",
          action_label: "Post Auto-Approved",
          admin_id: null, // Set to null for system actions
          target: `Post: ${title}`,
          details: `Post ID: ${post.id} was automatically approved by the system. Category: ${category}. User ID: ${user.id}`,
          severity: "low",
          target_id: post.id,
          target_type: "post",
          timestamp: new Date().toISOString(), // Explicitly set timestamp
        });

      if (logError) {
        console.error(
          "Error logging auto-approval to admin_activity_log:",
          logError
        );
      }
    } catch (logError) {
      console.error("Error logging auto-approval:", logError);
    }

    // Revalidate the free board page
    revalidatePath("/free-board");

    // Return success
    return {
      success: true,
      message: "Your post has been published successfully!",
      postId: post.id,
    };
  } catch (error: any) {
    console.error("Unexpected error creating post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Update an existing post
export async function updatePost(formData: FormData) {
  console.log("Server action: updatePost called");

  try {
    const supabase = await createClient();

    // Get the current user - using getUser() for security
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      console.error("No authenticated user found:", userError);
      return { error: "You must be logged in to update a post" };
    }

    const user = userData.user;
    console.log("User authenticated:", user.id);

    // Extract form data
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const tagsString = formData.get("tags") as string;
    const featuredImagesString = formData.get("featuredImages") as string;

    // Parse tags and featured images
    const tags = tagsString ? JSON.parse(tagsString) : [];
    const featured_images = featuredImagesString
      ? JSON.parse(featuredImagesString)
      : [];

    console.log("Extracted form data:", {
      id,
      title,
      category,
      tags: tags.length,
      images: featured_images.length,
    });

    // Validate required fields
    if (!id || !title || !content || !category) {
      console.error("Missing required fields");
      return { error: "ID, title, content, and category are required" };
    }

    // Get the post to check ownership
    const { data: existingPost, error: fetchError } = await supabase
      .from("posts")
      .select("user_id, status, points_awarded")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching post:", fetchError);
      return { error: "Post not found" };
    }

    // Check if user is the author
    if (existingPost.user_id !== user.id) {
      console.error("User is not the author of this post");
      return { error: "You can only edit your own posts" };
    }

    // Update the post
    const { data: post, error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        category,
        tags,
        featured_images,
        updated_at: new Date().toISOString(),
        // If post was already approved, keep it approved
        // If it was pending or rejected, set it back to pending for re-review
        status: existingPost.status === "approved" ? "approved" : "pending",
        // Keep the points_awarded status
        points_awarded: existingPost.points_awarded,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating post:", error);
      return { error: error.message };
    }

    console.log("Post updated successfully:", post.id);

    // Revalidate the free board page and the post page
    revalidatePath("/free-board");
    revalidatePath(`/free-board/${id}`);

    // Return success
    return {
      success: true,
      message: "Your post has been updated successfully.",
      postId: post.id,
    };
  } catch (error: any) {
    console.error("Unexpected error updating post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Delete a post
export async function deletePost(postId: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { error: "You must be logged in to delete a post" };
    }

    const userId = userData.user.id;

    // Check if the user is the author of the post
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.error("Error fetching post:", fetchError);
      return { error: "Post not found" };
    }

    if (post.user_id !== userId) {
      return { error: "You can only delete your own posts" };
    }

    // Update post status to deleted
    const { error } = await supabase
      .from("posts")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error deleting post:", error);
      return { error: error.message };
    }

    // Revalidate paths
    revalidatePath("/free-board");
    revalidatePath(`/free-board/${postId}`);

    return { success: true, message: "Post deleted successfully" };
  } catch (error: any) {
    console.error("Unexpected error deleting post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Add this new function to fetch posts by category
export async function getPostsByCategory(category: string): Promise<Post[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name
        )
      `
      )
      .eq("status", "approved") // Only fetch approved posts
      .eq("category", category) // Filter by category
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${category} posts:`, error);
      return [];
    }

    return data as Post[];
  } catch (error) {
    console.error(`Unexpected error fetching ${category} posts:`, error);
    return [];
  }
}
