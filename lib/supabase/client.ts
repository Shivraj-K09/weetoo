import { createBrowserClient } from "@supabase/ssr";

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

    // Create client with auto-refresh enabled
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
