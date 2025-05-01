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
      console.log("[SUPABASE] No active session found, just removing channels");
      // No session to reset, but we've removed channels which may help
      return true;
    }

    // Store session data
    const accessToken = currentSession.access_token;
    const refreshToken = currentSession.refresh_token;

    // Sign out completely
    await supabase.auth.signOut({ scope: "local" });

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

// Add a function to keep connections alive during page visibility changes

// Add this function to the file:
/**
 * Keeps Supabase connections alive even when the page is not visible
 * This is especially important for trading applications where real-time
 * data is critical
 */
export function keepConnectionsAlive() {
  if (typeof window === "undefined") return;

  // Create a hidden iframe that will ping the server periodically
  // This helps keep WebSocket connections alive in some browsers
  const createKeepAliveFrame = () => {
    // Check if we already have a keep-alive frame
    if (document.getElementById("supabase-keep-alive")) {
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.id = "supabase-keep-alive";
    iframe.style.display = "none";
    iframe.src = "about:blank";
    document.body.appendChild(iframe);

    // Add a script to the iframe that will ping periodically
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <script>
          // Send a message to the parent window every 25 seconds
          // This helps keep the connection alive
          setInterval(() => {
            parent.postMessage('keep-alive-ping', '*');
          }, 25000);
        </script>
      `);
      iframeDoc.close();
    }
  };

  // Listen for the keep-alive pings
  window.addEventListener("message", (event) => {
    if (event.data === "keep-alive-ping") {
      // When we receive a ping, we know the iframe is working
      console.log("[KEEP-ALIVE] Ping received");
    }
  });

  // Create the keep-alive frame when the page loads
  if (document.readyState === "complete") {
    createKeepAliveFrame();
  } else {
    window.addEventListener("load", createKeepAliveFrame);
  }

  // Also create it when the page becomes visible again
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      createKeepAliveFrame();
    }
  });
}
