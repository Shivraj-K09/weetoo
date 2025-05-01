/**
 * Utility function to update the virtual currency display in the UI
 * without waiting for the real-time subscription
 */
export function updateVirtualCurrencyDisplay(roomId: string): void {
  try {
    // Dispatch a custom event to notify components about the update
    const event = new CustomEvent("virtual-currency-update", {
      detail: { roomId },
    });
    window.dispatchEvent(event);

    // Force a refresh of the virtual currency display
    const virtualCurrencyElements = document.querySelectorAll(
      ".virtual-currency-display"
    );
    if (virtualCurrencyElements.length > 0) {
      // Add a class to indicate that the currency is being updated
      virtualCurrencyElements.forEach((el) => {
        el.classList.add("updating");
        // Remove the class after a short delay to allow for animation
        setTimeout(() => el.classList.remove("updating"), 1000);
      });
    }
  } catch (error) {
    console.error("Error updating virtual currency display:", error);
  }
}

/**
 * Utility function to notify that a position has been closed
 */
export function notifyPositionClosed(
  roomId: string,
  positionId?: string
): void {
  try {
    const event = new CustomEvent("position-closed", {
      detail: { roomId, positionId },
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error notifying position closed:", error);
  }
}

/**
 * Utility function to notify that a new position has been created
 */
export function notifyPositionCreated(
  roomId: string,
  positionId: string
): void {
  try {
    const event = new CustomEvent("new-position-created", {
      detail: { roomId, positionId },
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error notifying new position created:", error);
  }
}

/**
 * Utility function to notify that funding fees have been applied
 */
export function notifyFundingApplied(roomId: string): void {
  try {
    const event = new CustomEvent("funding-applied", {
      detail: { roomId },
    });
    window.dispatchEvent(event);

    // Also trigger a virtual currency update since funding affects balances
    updateVirtualCurrencyDisplay(roomId);
  } catch (error) {
    console.error("Error notifying funding applied:", error);
  }
}

/**
 * Utility function to update a user's virtual currency balance
 * This is a server-side function that updates the database
 */
export async function updateVirtualCurrency(
  roomId: string,
  userId: string,
  amount: number,
  description = "Virtual currency update"
): Promise<boolean> {
  try {
    // This is a placeholder for the actual implementation
    // In a real implementation, you would update the database here
    console.log(
      `[updateVirtualCurrency] Updating virtual currency for user ${userId} in room ${roomId}: ${amount} (${description})`
    );

    // After updating the database, trigger the UI update
    // Note: This won't work server-side, but is included for completeness
    if (typeof window !== "undefined") {
      updateVirtualCurrencyDisplay(roomId);
    }

    return true;
  } catch (error) {
    console.error("Error updating virtual currency:", error);
    return false;
  }
}
