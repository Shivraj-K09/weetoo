import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
