import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return false;
    }

    return profile.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile.role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if the current user is the owner of a resource or an admin
 */
export async function isOwnerOrAdmin(resourceUserId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    // If user is the owner, return true immediately
    if (user.id === resourceUserId) {
      return true;
    }

    // Otherwise, check if user is an admin
    return await isAdmin();
  } catch (error) {
    console.error("Error checking owner or admin status:", error);
    return false;
  }
}
