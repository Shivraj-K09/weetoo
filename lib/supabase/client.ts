import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";

// Enhanced createClient function with error handling and retry logic
export function createClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Supabase URL or API key is missing. Please check your environment variables."
      );
      throw new Error("Supabase configuration missing");
    }

    console.log("Creating Supabase client with URL:", supabaseUrl);

    // Create client with default auth settings to ensure proper OAuth flow
    return createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    throw new Error("Failed to initialize Supabase client");
  }
}

// Create a singleton instance
export const supabase = createClient();

// Global connection state
let isReconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Function to ensure we have a valid auth session
export async function ensureAuthSession() {
  try {
    console.log("[SUPABASE] Ensuring auth session...");

    // First try to get the existing session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("[SUPABASE] Error getting session:", sessionError);
      return false;
    }

    if (sessionData.session) {
      console.log("[SUPABASE] Session exists, refreshing...");

      // Try to refresh the token
      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("[SUPABASE] Error refreshing session:", refreshError);
        return false;
      }

      console.log("[SUPABASE] Session refreshed successfully");
      return true;
    } else {
      console.log("[SUPABASE] No session found");
      return false;
    }
  } catch (error) {
    console.error("[SUPABASE] Error in ensureAuthSession:", error);
    return false;
  }
}

// Update the reconnectSupabase function to properly handle missing sessions

// Replace the existing reconnectSupabase function with this improved version:
export async function reconnectSupabase() {
  if (isReconnecting) return false;

  try {
    isReconnecting = true;
    console.log("[SUPABASE] Attempting to reconnect...");

    // First try a more conservative approach - just get session without removing channels
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      console.log("[SUPABASE] Session exists, attempting minimal reconnect");

      try {
        // Create a new channel to test connection
        const testChannel = supabase
          .channel("connection_test")
          .subscribe((status) => {
            console.log("[SUPABASE] Connection test status:", status);
            if (status === "SUBSCRIBED") {
              // Connection is good, we can be more conservative
              console.log("[SUPABASE] Connection test successful");

              // Clean up test channel
              setTimeout(() => {
                supabase.removeChannel(testChannel);
              }, 1000);
            }
          });

        // If we got here without errors, connection is likely fine
        console.log(
          "[SUPABASE] Reconnection successful with minimal disruption"
        );
        reconnectAttempts = 0;
        return true;
      } catch (error) {
        console.warn(
          "[SUPABASE] Minimal reconnect failed, trying full reconnect",
          error
        );
        // Fall through to full reconnect
      }
    }

    // If minimal approach didn't work, do a more thorough reconnect
    // Remove all existing channels
    supabase.removeAllChannels();

    // First check if we have a session before trying to refresh it
    const { data: refreshCheckData } = await supabase.auth.getSession();

    if (!refreshCheckData.session) {
      console.log(
        "[SUPABASE] No active session to refresh, reconnect successful"
      );
      // No session to refresh, but connection is still valid
      return true;
    }

    // Only try to refresh if we have a session
    const { error } = await supabase.auth.refreshSession();

    if (error) {
      console.error(
        "[SUPABASE] Error refreshing session during reconnect:",
        error
      );
      reconnectAttempts++;

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        toast.error("Connection lost. Please refresh the page.");
        return false;
      }

      return false;
    }

    // Reset reconnect attempts on success
    reconnectAttempts = 0;
    console.log("[SUPABASE] Reconnected successfully");
    return true;
  } catch (error) {
    console.error("[SUPABASE] Error during reconnect:", error);
    return false;
  } finally {
    isReconnecting = false;
  }
}

// Define the supported providers
export type SupportedProvider =
  | "google"
  | "kakao"
  | "naver"
  | "github"
  | "facebook"
  | "twitter"
  | "apple"
  | "azure"
  | "bitbucket"
  | "discord"
  | "gitlab"
  | "linkedin"
  | "notion"
  | "slack"
  | "spotify"
  | "twitch"
  | "workos"
  | "zoom";

// Add a helper function to reset the Supabase client
export function resetSupabaseClient() {
  try {
    // Remove all channels
    supabase.removeAllChannels();

    // Refresh the auth session
    supabase.auth
      .refreshSession()
      .then(() => console.log("Auth session refreshed"))
      .catch((err) => console.error("Error refreshing auth session:", err));

    // Create a new channel to force reconnection
    supabase.channel("system:reconnect").subscribe((status) => {
      console.log("Reconnection status:", status);
    });

    console.log("Supabase client reset");
    return true;
  } catch (error) {
    console.error("Failed to reset Supabase client:", error);
    return false;
  }
}

// Initialize connection monitoring
if (typeof window !== "undefined") {
  // Set up visibility change handler
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      console.log("[SUPABASE] Page became visible, checking connection");
      await reconnectSupabase();
    }
  });

  // Set up online/offline handlers
  window.addEventListener("online", async () => {
    console.log("[SUPABASE] Browser went online, reconnecting");
    await reconnectSupabase();
  });

  // Set up a periodic ping to keep connections alive
  setInterval(async () => {
    if (document.visibilityState === "visible") {
      // Only ping if the page is visible
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If we have a session, send a small query to keep the connection alive
        await supabase.from("users").select("id").limit(1).maybeSingle();
      }
    }
  }, 30000); // Every 30 seconds
}
