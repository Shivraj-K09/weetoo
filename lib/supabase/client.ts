import { createBrowserClient } from "@supabase/ssr";

// Enhanced createClient function with error handling
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

    return createBrowserClient(supabaseUrl, supabaseKey);
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
