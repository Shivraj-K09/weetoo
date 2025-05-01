/**
 * Room persistence utilities
 *
 * These functions help maintain state across page refreshes and navigation
 * by storing and retrieving data from localStorage.
 */

// Key prefixes for localStorage
const ROOM_DATA_PREFIX = "room-data-";
const AUTH_STATE_PREFIX = "auth-state-";
const REFRESH_HANDLED_PREFIX = "refresh-handled-";
const REFRESH_DETECTED = "refresh-detected";

/**
 * Save room data to localStorage for recovery
 */
export function saveRoomData(roomId: string, data: any): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${ROOM_DATA_PREFIX}${roomId}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save room data to localStorage:", error);
  }
}

/**
 * Get cached room data from localStorage
 */
export function getCachedRoomData(roomId: string): any {
  if (typeof window === "undefined") return null;

  try {
    const cachedData = localStorage.getItem(`${ROOM_DATA_PREFIX}${roomId}`);
    if (!cachedData) return null;

    const parsed = JSON.parse(cachedData);

    // Check if data is still fresh (less than 5 minutes old)
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - parsed.timestamp > fiveMinutes) {
      localStorage.removeItem(`${ROOM_DATA_PREFIX}${roomId}`);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to get cached room data:", error);
    return null;
  }
}

/**
 * Save auth state to localStorage for recovery
 */
export function saveAuthState(userId: string, data: any): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${AUTH_STATE_PREFIX}${userId}`,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save auth state to localStorage:", error);
  }
}

/**
 * Get cached auth state from localStorage
 */
export function getCachedAuthState(userId: string): any {
  if (typeof window === "undefined") return null;

  try {
    const cachedData = localStorage.getItem(`${AUTH_STATE_PREFIX}${userId}`);
    if (!cachedData) return null;

    const parsed = JSON.parse(cachedData);

    // Check if data is still fresh (less than 30 minutes old)
    const thirtyMinutes = 30 * 60 * 1000;
    if (Date.now() - parsed.timestamp > thirtyMinutes) {
      localStorage.removeItem(`${AUTH_STATE_PREFIX}${userId}`);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Failed to get cached auth state:", error);
    return null;
  }
}

/**
 * Detect if the page was refreshed
 */
export function wasPageRefreshed(): boolean {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false;
  }

  // Check if this is a refresh by looking at performance navigation type
  // or by checking our custom flag
  const wasRefreshed =
    (window.performance && window.performance.navigation.type === 1) ||
    localStorage.getItem(REFRESH_DETECTED) === "true";

  // Set the flag for future checks
  localStorage.setItem(REFRESH_DETECTED, "true");

  // Clear the flag after a short delay
  setTimeout(() => {
    localStorage.removeItem(REFRESH_DETECTED);
  }, 2000);

  return wasRefreshed;
}

/**
 * Mark that we've handled a refresh for a specific room
 */
export function markRefreshHandled(roomId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${REFRESH_HANDLED_PREFIX}${roomId}`,
    Date.now().toString()
  );
}

/**
 * Check if we've already handled a refresh for a specific room
 */
export function hasHandledRefresh(roomId: string): boolean {
  if (typeof window === "undefined") return false;

  const timestamp = localStorage.getItem(`${REFRESH_HANDLED_PREFIX}${roomId}`);
  if (!timestamp) return false;

  // Consider it handled if we marked it within the last 10 seconds
  const tenSeconds = 10 * 1000;
  return Date.now() - Number(timestamp) < tenSeconds;
}

/**
 * Clear the refresh handled flag for a room
 */
export function clearRefreshHandled(roomId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${REFRESH_HANDLED_PREFIX}${roomId}`);
}
