import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Define a constant for the system user ID - same as in auto-approve.ts
const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000"; // Replace with a real admin ID

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const admin = searchParams.get("admin");
  const severity = searchParams.get("severity");
  const timeRange = searchParams.get("timeRange");
  const searchTerm = searchParams.get("searchTerm");

  const supabase = await createClient();

  try {
    console.log("Fetching activity logs with params:", {
      action,
      admin,
      severity,
      timeRange,
      searchTerm,
    });

    let query = supabase
      .from("admin_activity_log")
      .select(
        `
        *,
        admin:admin_id(id, first_name, last_name, email, avatar_url)
      `
      )
      .order("timestamp", { ascending: false });

    // Apply filters if provided
    if (action && action !== "all") {
      query = query.eq("action", action);
    }

    if (admin && admin !== "all") {
      if (admin === "system") {
        // Special case for system actions - look for null admin_id
        query = query.is("admin_id", null);
      } else {
        query = query.eq("admin_id", admin);
      }
    }

    if (severity && severity !== "all") {
      query = query.eq("severity", severity);
    }

    // Apply time range filter
    if (timeRange && timeRange !== "all") {
      const startDate = new Date();

      if (timeRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeRange === "yesterday") {
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
      } else if (timeRange === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      query = query.gte("timestamp", startDate.toISOString());
    }

    // Apply search term if provided
    if (searchTerm) {
      query = query.or(`
        action.ilike.%${searchTerm}%,
        action_label.ilike.%${searchTerm}%,
        target.ilike.%${searchTerm}%,
        details.ilike.%${searchTerm}%
      `);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error fetching activity logs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} activity logs`);

    // Check if there are any auto-approve actions
    const autoApproveActions =
      data?.filter((log) => log.action === "post_auto_approve") || [];
    console.log(`Found ${autoApproveActions.length} auto-approve actions`);

    // If no data, return empty array
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add POST handler for logging activities
export async function POST(request: Request) {
  try {
    const {
      action,
      actionLabel,
      adminId,
      target,
      details,
      severity,
      targetId,
      targetType,
    } = await request.json();

    // Validate required fields
    if (!action || !actionLabel || !target || !details || !severity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert the activity log
    const { error } = await supabase.from("admin_activity_log").insert({
      action,
      action_label: actionLabel,
      admin_id: adminId || SYSTEM_USER_ID, // Use system user ID if adminId is null
      target,
      details,
      severity,
      target_id: targetId,
      target_type: targetType,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging activity:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in activity logger API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
