/**
 * Synchronous utility function to get the virtual currency balance for a room
 * This is used for UI rendering where we need a default value immediately
 * @param roomId The room ID
 * @param defaultValue The default value to return (default: 10000)
 * @returns The virtual currency balance as a number
 */
export function getVirtualCurrencyBalance(
  roomId: string,
  defaultValue = 10000
): number {
  try {
    // Try to get from localStorage first for client-side rendering
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(`virtual-currency-${roomId}`);
      if (storedValue) {
        const parsed = Number.parseFloat(storedValue);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.error(
      "[getVirtualCurrencyBalance] Error accessing localStorage:",
      error
    );
  }

  // Return default value if localStorage is not available or value is not found
  return defaultValue;
}

/**
 * Asynchronous utility function to get detailed virtual currency balance for a room
 * This makes an actual API call to get the latest balance information
 * @param roomId The room ID
 * @returns Promise with detailed balance information
 */
export async function getVirtualCurrencyBalanceAsync(roomId: string): Promise<{
  availableBalance: number;
  totalBalance: number;
  lockedBalance: number;
}> {
  try {
    // Make API call to get balance information
    const response = await fetch(
      `/api/virtual-currency/balance?roomId=${encodeURIComponent(roomId)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Store in localStorage for synchronous access later
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `virtual-currency-${roomId}`,
        String(data.availableBalance)
      );
    }

    // Return the balance information
    return {
      availableBalance: data.availableBalance,
      totalBalance: data.totalBalance,
      lockedBalance: data.lockedBalance,
    };
  } catch (error) {
    console.error("[getVirtualCurrencyBalanceAsync] Unexpected error:", error);
    return {
      availableBalance: 10000,
      totalBalance: 10000,
      lockedBalance: 0,
    };
  }
}
