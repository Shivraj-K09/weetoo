// Client-side activity logger service

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
  | "post_hide"
  | "post_show"
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

/**
 * Client-side function to log admin activities
 */
export async function logActivity(params: LogActivityParams): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/activity-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error("Failed to log activity:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error logging activity:", error);
    return false;
  }
}

// Pre-defined logging functions for common actions

export async function logUserAction(
  action:
    | "user_create"
    | "user_update"
    | "user_delete"
    | "user_suspend"
    | "user_warning"
    | "user_message",
  adminId: string,
  userId: string,
  userName: string,
  details: string,
  severity: ActivitySeverity = "medium",
  uid?: string // Add optional UID parameter
) {
  const actionLabels: Record<string, string> = {
    user_create: "User Create",
    user_update: "User Update",
    user_delete: "User Delete",
    user_suspend: "User Suspend",
    user_warning: "User Warning",
    user_message: "User Message",
  };

  return logActivity({
    action,
    actionLabel: actionLabels[action],
    adminId,
    target: `User: ${userName} (${uid || userId})`, // Use UID if provided, otherwise fall back to ID
    details,
    severity,
    targetId: userId,
    targetType: "user",
  });
}

export async function logNoteAction(
  action: "admin_note_create" | "admin_note_update" | "admin_note_delete",
  adminId: string,
  noteId: string,
  targetAdmin: string,
  details?: string
) {
  const actionLabels: Record<string, string> = {
    admin_note_create: "Note Create",
    admin_note_update: "Note Update",
    admin_note_delete: "Note Delete",
  };

  const defaultDetails: Record<string, string> = {
    admin_note_create: `Created administration note for admin "${targetAdmin}".`,
    admin_note_update: `Updated administration note for admin "${targetAdmin}".`,
    admin_note_delete: `Deleted administration note for admin "${targetAdmin}".`,
  };

  return logActivity({
    action,
    actionLabel: actionLabels[action],
    adminId,
    target: `Admin: ${targetAdmin}`,
    details: details || defaultDetails[action],
    severity: "low",
    targetId: noteId,
    targetType: "admin_note",
  });
}

export async function logPostAction(
  action:
    | "post_approve"
    | "post_reject"
    | "post_delete"
    | "post_hide"
    | "post_show",
  adminId: string,
  postId: string,
  postTitle: string,
  details?: string
) {
  const actionLabels: Record<string, string> = {
    post_approve: "Post Approve",
    post_reject: "Post Reject",
    post_delete: "Post Delete",
    post_hide: "Post Hide",
    post_show: "Post Show",
  };

  const defaultDetails: Record<string, string> = {
    post_approve: `Approved post "${postTitle}" for public viewing.`,
    post_reject: `Rejected post "${postTitle}".`,
    post_delete: `Deleted post "${postTitle}".`,
    post_hide: `Hidden post "${postTitle}" from public view.`,
    post_show: `Made post "${postTitle}" visible to the public.`,
  };

  const severityMap: Record<string, ActivitySeverity> = {
    post_approve: "medium",
    post_reject: "medium",
    post_delete: "high",
    post_hide: "medium",
    post_show: "medium",
  };

  return logActivity({
    action,
    actionLabel: actionLabels[action],
    adminId,
    target: `Post: ${postTitle} (${postId})`,
    details: details || defaultDetails[action],
    severity: severityMap[action],
    targetId: postId,
    targetType: "post",
  });
}
