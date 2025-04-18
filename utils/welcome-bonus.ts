import { toast } from "sonner";

export function checkAndShowWelcomeBonusNotification() {
  // Check both possible keys for backward compatibility
  const showWelcomeBonus = sessionStorage.getItem("showWelcomeBonus");
  const checkWelcomeBonus = sessionStorage.getItem("checkWelcomeBonus");

  if (showWelcomeBonus === "true" || checkWelcomeBonus === "true") {
    // Display the toast with higher duration and priority
    toast.success(
      "Welcome! You've received 5,000 Kor_coins as a welcome bonus!",
      {
        duration: 6000,
        position: "top-center",
        id: "welcome-bonus-toast", // Unique ID to prevent duplicates
      }
    );

    // Clear both flags
    sessionStorage.removeItem("showWelcomeBonus");
    sessionStorage.removeItem("checkWelcomeBonus");

    // Return true if notification was shown
    return true;
  }

  return false;
}
