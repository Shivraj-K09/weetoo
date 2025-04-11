import { logActivity } from "./activity-logger-client";

export async function logPostApproval(
  adminId: string,
  postId: string,
  postTitle: string
) {
  return logActivity({
    action: "post_approve",
    actionLabel: "Post Approve",
    adminId,
    target: `Post: ${postTitle} (${postId})`,
    details: `Approved post "${postTitle}" for public viewing.`,
    severity: "medium",
    targetId: postId,
    targetType: "post",
  });
}

export async function logPostRejection(
  adminId: string,
  postId: string,
  postTitle: string,
  reason = ""
) {
  return logActivity({
    action: "post_reject",
    actionLabel: "Post Reject",
    adminId,
    target: `Post: ${postTitle} (${postId})`,
    details: `Rejected post "${postTitle}".${reason ? ` Reason: ${reason}` : ""}`,
    severity: "medium",
    targetId: postId,
    targetType: "post",
  });
}

export async function logPostDeletion(
  adminId: string,
  postId: string,
  postTitle: string
) {
  return logActivity({
    action: "post_delete",
    actionLabel: "Post Delete",
    adminId,
    target: `Post: ${postTitle} (${postId})`,
    details: `Deleted post "${postTitle}".`,
    severity: "high",
    targetId: postId,
    targetType: "post",
  });
}
