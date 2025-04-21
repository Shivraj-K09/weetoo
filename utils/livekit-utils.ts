/**
 * Formats a participant name for display
 */
export function formatParticipantName(name: string | undefined): string {
  if (!name) return "Unknown User";
  return name;
}

/**
 * Gets initials from a participant name
 */
export function getParticipantInitials(name: string | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Parses participant metadata
 */
export function parseParticipantMetadata(metadata: string | undefined): {
  isOwner: boolean;
} {
  if (!metadata) return { isOwner: false };
  try {
    return JSON.parse(metadata);
  } catch (e) {
    return { isOwner: false };
  }
}
