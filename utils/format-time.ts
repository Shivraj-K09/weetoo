/**
 * Formats a date to show how much time is left until the next bonus
 * @param nextBonusTime ISO string of the next bonus time
 * @returns Formatted string like "23 hours, 45 minutes"
 */
export function formatTimeUntilNextBonus(nextBonusTime: string): string {
  const now = new Date();
  const bonusTime = new Date(nextBonusTime);

  // Calculate the difference in milliseconds
  const diffMs = bonusTime.getTime() - now.getTime();

  // If the time has already passed
  if (diffMs <= 0) {
    return "Available now";
  }

  // Convert to hours and minutes
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""}, ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  } else {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }
}
