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
export function notifyPositionClosed(roomId: string): void {
  try {
    const event = new CustomEvent("position-closed", {
      detail: { roomId },
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error("Error notifying position closed:", error);
  }
}
