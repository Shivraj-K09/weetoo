import { logActivity } from "./activity-logger";

export async function logUserWarning(
  adminId: string,
  userId: string,
  userName: string,
  reason: string
) {
  return logActivity({
    action: "user_warning",
    actionLabel: "User Warning",
    adminId,
    target: `User: ${userName} (${userId})`,
    details: `Issued warning to user "${userName}". Reason: ${reason}`,
    severity: "medium",
    targetId: userId,
    targetType: "user",
  });
}

export async function logUserSuspension(
  adminId: string,
  userId: string,
  userName: string,
  duration: string,
  reason: string
) {
  return logActivity({
    action: "user_suspend",
    actionLabel: "User Suspend",
    adminId,
    target: `User: ${userName} (${userId})`,
    details: `Suspended user "${userName}" for ${duration}. Reason: ${reason}`,
    severity: "high",
    targetId: userId,
    targetType: "user",
  });
}

export async function logUserMessage(
  adminId: string,
  userId: string,
  userName: string,
  subject: string
) {
  return logActivity({
    action: "user_message",
    actionLabel: "User Message",
    adminId,
    target: `User: ${userName} (${userId})`,
    details: `Sent message to user "${userName}". Subject: ${subject}`,
    severity: "low",
    targetId: userId,
    targetType: "user",
  });
}

export async function logUserUpdate(
  adminId: string,
  userId: string,
  userName: string,
  changes: string
) {
  return logActivity({
    action: "user_update",
    actionLabel: "User Update",
    adminId,
    target: `User: ${userName} (${userId})`,
    details: `Updated user "${userName}". Changes: ${changes}`,
    severity: "medium",
    targetId: userId,
    targetType: "user",
  });
}
