import { supabase } from "./client";

// Add a helper function to reset the Supabase client
// Updated to be more conservative and not log users out
export function resetSupabaseClient() {
  try {
    console.log("[SUPABASE] Starting client reset");

    // Remove all channels
    supabase.removeAllChannels();
    console.log("[SUPABASE] All channels removed");

    // Create a new channel to force reconnection
    const reconnectChannel = supabase.channel("system:reconnect");
    reconnectChannel.subscribe((status) => {
      console.log("[SUPABASE] Reconnection status:", status);

      // If subscription is successful, we're good to go
      if (status === "SUBSCRIBED") {
        console.log("[SUPABASE] Successfully reconnected");

        // Remove the channel after successful reconnection
        setTimeout(() => {
          supabase.removeChannel(reconnectChannel);
        }, 1000);
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
// DO NOT USE THIS FUNCTION - it's kept for reference only
export async function reinitializeSupabaseClient() {
  try {
    console.log("[SUPABASE] Reinitializing client");

    // First, remove all channels
    supabase.removeAllChannels();

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
  } catch (error) {
    console.error("[SUPABASE] Failed to reinitialize Supabase client:", error);
    return false;
  }
}

// Add a new function to completely reset the client
// DO NOT USE THIS FUNCTION - it's kept for reference only
export async function forceResetSupabaseClient() {
  try {
    console.log("[SUPABASE] Force resetting client");

    // Remove all channels
    supabase.removeAllChannels();

    // Create a new channel to force reconnection
    const reconnectChannel = supabase.channel("system:force-reconnect");
    reconnectChannel.subscribe((status) => {
      console.log("[SUPABASE] Force reconnect status:", status);
      if (status === "SUBSCRIBED") {
        // Remove the channel once we're successfully reconnected
        setTimeout(() => supabase.removeChannel(reconnectChannel), 1000);
      }
    });

    console.log("[SUPABASE] Client force reset successful");
    return true;
  } catch (error) {
    console.error("[SUPABASE] Force reset failed:", error);

    // Even if there's an error, try to create a new channel to force reconnection
    supabase.channel("error-reconnect").subscribe();

    return false;
  }
}

// Add a function to keep connections alive during page visibility changes
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

// Add a new function to clear all toast notifications
// Add this new function:

export function clearAllToasts() {
  if (typeof window !== "undefined") {
    // This is a hack to access the toast dismiss function if it's available
    // It assumes you're using a toast library that attaches to window
    if (
      "toast" in window &&
      typeof (window as any).toast?.dismiss === "function"
    ) {
      (window as any).toast.dismiss();
    }
    // For sonner toast specifically
    if (
      "Sonner" in window &&
      typeof (window as any).Sonner?.dismiss === "function"
    ) {
      (window as any).Sonner.dismiss();
    }
  }
}
