import { createBrowserClient } from "@supabase/ssr";

// Global connection state
let isReconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Create a singleton instance with optimized settings
const createOptimizedClient = () => {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Supabase URL or API key is missing. Please check your environment variables."
      );
      throw new Error("Supabase configuration missing");
    }

    return createBrowserClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 20, // Increased from 10 to 20
        },
        heartbeatIntervalMs: 15000, // Reduced from default to 15 seconds
        timeout: 10000, // Reduced timeout to 10 seconds
      },
      global: {
        fetch: (...args) => {
          // Use a custom fetch with shorter timeouts
          const controller = new AbortController();
          const { signal } = controller;

          // Set a timeout of 8 seconds
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          return fetch(args[0], { ...args[1], signal })
            .then((response) => {
              clearTimeout(timeoutId);
              return response;
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              throw error;
            });
        },
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    throw new Error("Failed to initialize Supabase client");
  }
};

// Create the singleton instance
export const supabase = createOptimizedClient();

// Export the createClient function for consistency
export function createClient() {
  return supabase;
}

// Function to ensure we have a valid auth session
export async function ensureAuthSession() {
  try {
    // First try to get the existing session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("[SUPABASE] Error getting session:", sessionError);
      return false;
    }

    if (sessionData.session) {
      // Try to refresh the token
      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("[SUPABASE] Error refreshing session:", refreshError);
        return false;
      }

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("[SUPABASE] Error in ensureAuthSession:", error);
    return false;
  }
}

// Improved reconnectSupabase function with better cleanup
export async function reconnectSupabase() {
  if (isReconnecting) return false;

  try {
    isReconnecting = true;

    // Remove all existing channels to clean up
    supabase.removeAllChannels();

    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();

    // If we have a session, try to refresh it
    if (sessionData.session) {
      try {
        await supabase.auth.refreshSession();
      } catch (err) {
        console.error("[SUPABASE] Exception refreshing session:", err);
      }
    }

    // Create a new test channel to verify connection
    const testChannel = supabase.channel("reconnect-test");

    // Wait for the subscription to complete
    const subscriptionPromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000); // Reduced from 5000ms to 3000ms

      testChannel.subscribe((status) => {
        clearTimeout(timeout);

        if (status === "SUBSCRIBED") {
          resolve(true);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          resolve(false);
        }
      });
    });

    const success = await subscriptionPromise;

    // Clean up the test channel
    supabase.removeChannel(testChannel);

    if (success) {
      // Reset reconnect attempts on success
      reconnectAttempts = 0;
      return true;
    } else {
      // Increment reconnect attempts on failure
      reconnectAttempts++;

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        return false;
      }

      return false;
    }
  } catch (error) {
    console.error("[SUPABASE] Error during reconnect:", error);
    return false;
  } finally {
    isReconnecting = false;
  }
}

// Initialize connection monitoring with optimized intervals
if (typeof window !== "undefined") {
  // Set up visibility change handler
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      await reconnectSupabase();
    }
  });

  // Set up online/offline handlers
  window.addEventListener("online", async () => {
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
  }, 20000); // Reduced from 30 seconds to 20 seconds
}
