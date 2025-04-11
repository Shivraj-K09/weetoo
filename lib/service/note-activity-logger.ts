import { logActivity } from "./activity-logger";

export async function logNoteCreation(
  adminId: string,
  noteId: string,
  targetAdmin: string
) {
  return logActivity({
    action: "admin_note_create",
    actionLabel: "Note Create",
    adminId,
    target: `Admin: ${targetAdmin}`,
    details: `Created administration note for admin "${targetAdmin}".`,
    severity: "low",
    targetId: noteId,
    targetType: "admin_note",
  });
}

export async function logNoteUpdate(
  adminId: string,
  noteId: string,
  targetAdmin: string
) {
  return logActivity({
    action: "admin_note_update",
    actionLabel: "Note Update",
    adminId,
    target: `Admin: ${targetAdmin}`,
    details: `Updated administration note for admin "${targetAdmin}".`,
    severity: "low",
    targetId: noteId,
    targetType: "admin_note",
  });
}

export async function logNoteDeletion(
  adminId: string,
  noteId: string,
  targetAdmin: string
) {
  return logActivity({
    action: "admin_note_delete",
    actionLabel: "Note Delete",
    adminId,
    target: `Admin: ${targetAdmin}`,
    details: `Deleted administration note for admin "${targetAdmin}".`,
    severity: "low",
    targetId: noteId,
    targetType: "admin_note",
  });
}
