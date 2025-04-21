import { createClient } from "@/lib/supabase/server";

/**
 * Utility function for logging admin actions directly to the admin_activity_log table
 */
export async function logAdminAction({
  action,
  actionLabel,
  adminId,
  target,
  details,
  severity = "low",
  targetId,
  targetType,
}: {
  action: string;
  actionLabel: string;
  adminId: string | null; // Can be null for system actions
  target: string;
  details: string;
  severity?: "low" | "medium" | "high" | "critical";
  targetId?: string;
  targetType?: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("admin_activity_log").insert({
      action,
      action_label: actionLabel,
      admin_id: adminId, // Can be null for system actions
      target,
      details,
      severity,
      target_id: targetId,
      target_type: targetType,
      timestamp: new Date().toISOString(), // Ensure timestamp is set
    });

    if (error) {
      console.error("Error logging admin action:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error logging admin action:", error);
    return {
      success: false,
      error: error.message || "Failed to log admin action",
    };
  }
}
