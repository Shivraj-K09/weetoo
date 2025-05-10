"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin"; // We'll need to create this
import { revalidatePath, unstable_noStore } from "next/cache";
import { cookies } from "next/headers";
import type { Post } from "@/types";
import { checkDailyLimit } from "./point-system-actions";
import { awardPoints } from "./point-system-actions";

// Define a system user ID to use for system actions
const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000"; // This should be replaced with a real admin ID

// Verify reCAPTCHA token
async function verifyRecaptcha(token: string) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("reCAPTCHA secret key is not defined");
      return { success: false, score: 0 };
    }

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      { method: "POST" }
    );

    const data = await response.json();

    return {
      success: data.success,
      score: data.score,
      action: data.action,
      challengeTimestamp: data.challenge_ts,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, score: 0 };
  }
}

// Fetch all posts for the free board
export async function getPosts(category = "free"): Promise<Post[]> {
  unstable_noStore();
  try {
    const supabase = await createClient();

    // Add timeout to the query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000); // 10 second timeout
    });

    const queryPromise = supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("status", "approved") // Only fetch approved posts
      .eq("category", category) // Filter by category
      .order("created_at", { ascending: false })
      .limit(50) // Reduced limit for better performance
      .throwOnError();

    type QueryResult = {
      data: Post[];
      error: any;
    };

    const result = await Promise.race([queryPromise, timeoutPromise])
      .then((result) => result as QueryResult)
      .catch((error) => {
        console.error(`Error fetching ${category} posts:`, error);
        return { data: [], error } as QueryResult;
      });

    if ("error" in result && result.error) {
      console.error(`Error fetching ${category} posts:`, result.error);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error(`Unexpected error fetching ${category} posts:`, error);
    return [];
  }
}

// Fetch top viewed posts for a specific category
export async function getTopViewedPosts(
  count = 6,
  category = "free"
): Promise<Post[]> {
  unstable_noStore();
  try {
    const supabase = await createClient();

    // Add timeout to the query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000); // 10 second timeout
    });

    const queryPromise = supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("status", "approved") // Only fetch approved posts
      .eq("category", category) // Filter by category
      .order("view_count", { ascending: false })
      .limit(count)
      .throwOnError();

    type QueryResult = {
      data: Post[];
      error: any;
    };

    const result = await Promise.race([queryPromise, timeoutPromise])
      .then((result) => result as QueryResult)
      .catch((error) => {
        console.error(`Error fetching top viewed ${category} posts:`, error);
        return { data: [], error } as QueryResult;
      });

    if ("error" in result && result.error) {
      console.error(
        `Error fetching top viewed ${category} posts:`,
        result.error
      );
      return [];
    }

    return result.data;
  } catch (error) {
    console.error(
      `Unexpected error fetching top viewed ${category} posts:`,
      error
    );
    return [];
  }
}

// Fetch a single post by ID without incrementing view count
export async function getPost(id: string): Promise<Post | null> {
  unstable_noStore();
  try {
    const supabase = await createClient();

    // Add timeout to the query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000); // 10 second timeout
    });

    const queryPromise = supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("id", id)
      .single();

    type QueryResult = {
      data: Post | null;
      error: any;
    };

    const result = await Promise.race([queryPromise, timeoutPromise])
      .then((result) => result as QueryResult)
      .catch((error) => {
        console.error("Error fetching post:", error);
        return { data: null, error } as QueryResult;
      });

    if ("error" in result && result.error) {
      console.error("Error fetching post:", result.error);
      return null;
    }

    return result.data;
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

// Helper function to get an admin user ID
async function getAdminUserId(
  supabase: any,
  fallbackUserId: string
): Promise<string> {
  try {
    // Try to get a super_admin user
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "super_admin")
      .limit(1)
      .single();

    if (!adminError && adminUser) {
      return adminUser.id;
    }

    // Try to get an admin user
    const { data: regularAdmin, error: regularAdminError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!regularAdminError && regularAdmin) {
      return regularAdmin.id;
    }

    // If no admin found, use the fallback user ID
    return fallbackUserId;
  } catch (error) {
    console.error("Error finding admin user:", error);
    return fallbackUserId;
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

    // Get reCAPTCHA token - support both old and new token names for backward compatibility
    const recaptchaToken =
      (formData.get("recaptchaToken") as string) ||
      (formData.get("captchaToken") as string);

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      console.error("No reCAPTCHA token provided");
      return { error: "Security verification failed. Please try again." };
    }

    // Verify the token with Google's API
    const recaptchaResult = await verifyRecaptcha(recaptchaToken);

    // Check if verification was successful and score is acceptable
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      console.error("reCAPTCHA verification failed:", recaptchaResult);
      return { error: "Security verification failed. Please try again." };
    }

    console.log(
      "reCAPTCHA verification successful with score:",
      recaptchaResult.score
    );

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

    // Get an admin user ID for logging
    const adminId = await getAdminUserId(supabase, user.id);
    const timestamp = new Date().toISOString();

    // First, insert the post with status 'pending' (this should work with RLS)
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        user_id: user.id,
        category,
        tags,
        featured_images,
        status: "pending", // Set to pending initially to comply with RLS
        view_count: 0,
        points_awarded: false, // Will be set to true after approval
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating post:", error);
      return { error: error.message };
    }

    console.log("Post created successfully with pending status:", post.id);

    // Now, use the admin client to update the post to approved status
    try {
      // Create an admin client that bypasses RLS
      const adminSupabase = await createAdminClient();

      // Update the post to approved status
      const { error: updateError } = await adminSupabase
        .from("posts")
        .update({
          status: "approved",
          moderated_by: adminId,
          moderated_at: timestamp,
          points_awarded: true,
          updated_at: timestamp,
        })
        .eq("id", post.id);

      if (updateError) {
        console.error("Error updating post to approved status:", updateError);
        // Continue anyway, the post is created but will need manual approval
      } else {
        console.log("Post updated to approved status:", post.id);
      }
    } catch (adminError) {
      console.error("Error using admin client:", adminError);
      // Continue anyway, the post is created but will need manual approval
    }

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
      // Update existing record - don't use updated_at to avoid schema cache issues
      const { error: activityError } = await supabase
        .from("daily_activity_limits")
        .update({
          posts_created: (existingRecord.posts_created || 0) + 1,
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
      // Use admin client to bypass RLS for logging
      const adminSupabase = await createAdminClient();

      // Insert into admin_activity_log table with a valid admin_id
      const { error: logError } = await adminSupabase
        .from("admin_activity_log")
        .insert({
          action: "post_auto_approve",
          action_label: "Post Auto-Approved",
          admin_id: adminId, // Use a valid admin ID
          target: `Post: ${title}`,
          details: `Post ID: ${post.id} was automatically approved by the system. Category: ${category}. User ID: ${user.id}`,
          severity: "low",
          target_id: post.id,
          target_type: "post",
          timestamp: timestamp, // Explicitly set timestamp
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

    // Revalidate all necessary paths
    revalidatePath(`/${category}-board`);
    revalidatePath(`/free-board`); // Also revalidate free-board for the community component
    revalidatePath(`/`); // Revalidate home page if it shows posts

    // Force revalidation of the specific board page
    if (category === "free") {
      revalidatePath("/free-board");
    } else if (category === "education") {
      revalidatePath("/education-board");
    } else if (category === "profit") {
      revalidatePath("/profit-board");
    }

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

    // Revalidate all necessary paths
    revalidatePath(`/${category}-board`);
    revalidatePath(`/${category}-board/${id}`);
    revalidatePath(`/free-board`); // Also revalidate free-board for the community component
    revalidatePath(`/`); // Revalidate home page if it shows posts

    // Force revalidation of the specific board page
    if (category === "free") {
      revalidatePath("/free-board");
    } else if (category === "education") {
      revalidatePath("/education-board");
    } else if (category === "profit") {
      revalidatePath("/profit-board");
    }

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
      .select("user_id, category")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.error("Error fetching post:", fetchError);
      return { error: "Post not found" };
    }

    if (post.user_id !== userId) {
      return { error: "You can only delete your own posts" };
    }

    const category = post.category || "free";

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

    // Revalidate all necessary paths
    revalidatePath(`/${category}-board`);
    revalidatePath(`/${category}-board/${postId}`);
    revalidatePath(`/free-board`); // Also revalidate free-board for the community component
    revalidatePath(`/`); // Revalidate home page if it shows posts

    // Force revalidation of the specific board page
    if (category === "free") {
      revalidatePath("/free-board");
    } else if (category === "education") {
      revalidatePath("/education-board");
    } else if (category === "profit") {
      revalidatePath("/profit-board");
    }

    return { success: true, message: "Post deleted successfully" };
  } catch (error: any) {
    console.error("Unexpected error deleting post:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

// Add this new function to fetch posts by category
export async function getPostsByCategory(category: string): Promise<Post[]> {
  unstable_noStore();
  try {
    const supabase = await createClient();

    // Add timeout to the query
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), 10000); // 10 second timeout
    });

    const queryPromise = supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("status", "approved") // Only fetch approved posts
      .eq("category", category) // Filter by category
      .order("created_at", { ascending: false })
      .limit(50) // Reduced limit for better performance
      .throwOnError();

    type QueryResult = {
      data: Post[];
      error: any;
    };

    const result = await Promise.race([queryPromise, timeoutPromise])
      .then((result) => result as QueryResult)
      .catch((error) => {
        console.error(`Error fetching ${category} posts:`, error);
        return { data: [], error } as QueryResult;
      });

    if ("error" in result && result.error) {
      console.error(`Error fetching ${category} posts:`, result.error);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error(`Unexpected error fetching ${category} posts:`, error);
    return [];
  }
}

// Add a new function to force refresh posts data
export async function refreshPostsData(category: string): Promise<boolean> {
  try {
    // Revalidate all necessary paths
    revalidatePath(`/${category}-board`);
    revalidatePath(`/free-board`); // Also revalidate free-board for the community component
    revalidatePath(`/`); // Revalidate home page if it shows posts

    // Force revalidation of the specific board page
    if (category === "free") {
      revalidatePath("/free-board");
    } else if (category === "education") {
      revalidatePath("/education-board");
    } else if (category === "profit") {
      revalidatePath("/profit-board");
    }

    return true;
  } catch (error) {
    console.error(`Error refreshing ${category} posts data:`, error);
    return false;
  }
}
