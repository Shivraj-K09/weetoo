import { createServerClient } from "@/lib/supabase/server";

type ActivityAction =
  | "user_create"
  | "user_update"
  | "user_delete"
  | "user_suspend"
  | "user_warning"
  | "user_message"
  | "post_approve"
  | "post_reject"
  | "post_delete"
  | "admin_note_create"
  | "admin_note_update"
  | "admin_note_delete"
  | "settings_change";

type ActivitySeverity = "low" | "medium" | "high" | "critical";

interface LogActivityParams {
  action: ActivityAction;
  actionLabel: string;
  adminId: string;
  target: string;
  details: string;
  severity: ActivitySeverity;
  targetId?: string;
  targetType?: string;
}

export async function logActivity({
  action,
  actionLabel,
  adminId,
  target,
  details,
  severity,
  targetId,
  targetType,
}: LogActivityParams) {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase.from("admin_activity_log").insert({
      action,
      action_label: actionLabel,
      admin_id: adminId,
      target,
      details,
      severity,
      target_id: targetId,
      target_type: targetType,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging activity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in activity logger:", error);
    return false;
  }
}
