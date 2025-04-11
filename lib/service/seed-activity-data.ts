import { createClient } from "@/lib/supabase/server";

export async function seedInitialActivityData(adminId: string) {
  const supabase = await createClient();

  // Check if there's already data in the activity log
  const { count, error: countError } = await supabase
    .from("admin_activity_log")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error checking activity log count:", countError);
    return false;
  }

  // If there's already data, don't seed
  if (count && count > 0) {
    return true;
  }

  // Sample activity data
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const activities = [
    {
      action: "user_login",
      action_label: "User Login",
      admin_id: adminId,
      target: "System",
      details: "Admin logged into the system",
      severity: "low",
      timestamp: now.toISOString(),
    },
    {
      action: "settings_change",
      action_label: "Settings Change",
      admin_id: adminId,
      target: "System Settings",
      details: "Updated system settings",
      severity: "medium",
      timestamp: yesterday.toISOString(),
    },
    {
      action: "user_update",
      action_label: "User Update",
      admin_id: adminId,
      target: "User Management",
      details: "Updated user profile information",
      severity: "low",
      timestamp: lastWeek.toISOString(),
    },
  ];

  // Insert sample data
  const { error } = await supabase
    .from("admin_activity_log")
    .insert(activities);

  if (error) {
    console.error("Error seeding activity data:", error);
    return false;
  }

  return true;
}
