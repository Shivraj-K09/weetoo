import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// This endpoint will be called periodically to auto-approve pending posts
export async function GET() {
  try {
    console.log("Auto-approve API: Starting auto-approval process");
    const supabase = await createClient();

    // Fetch all pending posts
    const { data: pendingPosts, error: fetchError } = await supabase
      .from("posts")
      .select("id, title, user_id, category")
      .eq("status", "pending");

    if (fetchError) {
      console.error(
        "Auto-approve API: Error fetching pending posts:",
        fetchError
      );
      return NextResponse.json(
        { error: "Failed to fetch pending posts" },
        { status: 500 }
      );
    }

    console.log(
      `Auto-approve API: Found ${pendingPosts?.length || 0} pending posts`
    );

    if (!pendingPosts || pendingPosts.length === 0) {
      return NextResponse.json({ message: "No pending posts to approve" });
    }

    // Auto-approve each pending post
    const approvedPosts = [];
    for (const post of pendingPosts) {
      console.log(
        `Auto-approve API: Processing post ${post.id} - "${post.title}"`
      );

      // Update post status to approved but set moderated_by to NULL
      const { error: updateError } = await supabase
        .from("posts")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
          moderated_by: null, // Set to null instead of using SYSTEM_USER_ID
          moderated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (updateError) {
        console.error(
          `Auto-approve API: Error auto-approving post ${post.id}:`,
          updateError
        );
        continue;
      }

      // Log the auto-approval directly to the admin_activity_log table
      const timestamp = new Date().toISOString();
      console.log(
        `Auto-approve API: Logging activity for post ${post.id} at ${timestamp}`
      );

      const { error: logError } = await supabase
        .from("admin_activity_log")
        .insert({
          action: "post_auto_approve",
          action_label: "Post Auto-Approved",
          admin_id: null, // Set to null for system actions
          target: `Post: ${post.title}`,
          details: `Post ID: ${post.id} was automatically approved by the system. Category: ${post.category}. User ID: ${post.user_id}`,
          severity: "low",
          target_id: post.id,
          target_type: "post",
          timestamp: timestamp, // Explicitly set timestamp
        });

      if (logError) {
        console.error(
          `Auto-approve API: Error logging auto-approval for post ${post.id}:`,
          logError
        );
      } else {
        console.log(
          `Auto-approve API: Successfully logged auto-approval for post ${post.id}`
        );
        approvedPosts.push(post.id);
      }
    }

    console.log(
      `Auto-approve API: Completed. Auto-approved ${approvedPosts.length} posts`
    );
    return NextResponse.json({
      success: true,
      message: `Auto-approved ${approvedPosts.length} posts`,
      approvedPosts,
    });
  } catch (error) {
    console.error("Auto-approve API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
