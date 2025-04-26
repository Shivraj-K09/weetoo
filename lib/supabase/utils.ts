import { supabase } from "./client";

// Add a helper function to reset the Supabase client
export function resetSupabaseClient() {
  try {
    console.log("[SUPABASE] Starting client reset");

    // Remove all channels
    supabase.removeAllChannels();
    console.log("[SUPABASE] All channels removed");

    // Refresh the auth session
    supabase.auth
      .refreshSession()
      .then(() => console.log("[SUPABASE] Auth session refreshed"))
      .catch((err) =>
        console.error("[SUPABASE] Error refreshing auth session:", err)
      );

    // Create a new channel to force reconnection
    const reconnectChannel = supabase.channel("system:reconnect");
    reconnectChannel.subscribe((status) => {
      console.log("[SUPABASE] Reconnection status:", status);

      // If subscription is successful, we're good to go
      if (status === "SUBSCRIBED") {
        console.log("[SUPABASE] Successfully reconnected");
      }

      // If there's an error, try one more time
      if (status === "CHANNEL_ERROR") {
        console.log("[SUPABASE] Error reconnecting, trying again");

        // Small delay before trying again
        setTimeout(() => {
          supabase.channel("system:reconnect-retry").subscribe();
        }, 500);
      }
    });

    console.log("[SUPABASE] Client reset completed");
    return true;
  } catch (error) {
    console.error("Failed to reset Supabase client:", error);
    return false;
  }
}

// Add a function to completely reinitialize the Supabase client
// This is a more aggressive reset that can be used if the regular reset fails
export async function reinitializeSupabaseClient() {
  try {
    console.log("[SUPABASE] Reinitializing client");

    // First, remove all channels
    supabase.removeAllChannels();

    // Sign out and back in to force a complete reset
    const { data: session } = await supabase.auth.getSession();

    if (session && session.session) {
      // Store the current session
      const currentSession = session.session;

      // Sign out
      await supabase.auth.signOut({ scope: "local" });

      // Small delay to ensure signout completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Sign back in with the session
      await supabase.auth.setSession({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      });

      // Create a new channel to force reconnection
      const reconnectChannel = supabase.channel("system:reconnect-force");
      reconnectChannel.subscribe((status) => {
        console.log("[SUPABASE] Force reconnection status:", status);
        if (status === "SUBSCRIBED") {
          // Remove the channel once we're successfully reconnected
          setTimeout(() => supabase.removeChannel(reconnectChannel), 1000);
        }
      });

      console.log("[SUPABASE] Client reinitialized successfully");
      return true;
    }

    console.log("[SUPABASE] No session to reinitialize");
    return false;
  } catch (error) {
    console.error("[SUPABASE] Failed to reinitialize Supabase client:", error);
    return false;
  }
}

// Add a new function to completely reset the client
export async function forceResetSupabaseClient() {
  try {
    console.log("[SUPABASE] Force resetting client");

    // Remove all channels
    supabase.removeAllChannels();

    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentSession = sessionData.session;

    if (!currentSession) {
      console.log("[SUPABASE] No active session found");
      return false;
    }

    // Store session data
    const accessToken = currentSession.access_token;
    const refreshToken = currentSession.refresh_token;

    // Sign out completely
    await supabase.auth.signOut({ scope: "global" });

    // Wait for signout to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Attempt to set session directly
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("[SUPABASE] Error resetting session:", error);
      return false;
    }

    console.log("[SUPABASE] Client force reset successful");
    return true;
  } catch (error) {
    console.error("[SUPABASE] Force reset failed:", error);
    return false;
  }
}
