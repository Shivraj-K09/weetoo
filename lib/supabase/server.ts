import {
  createServerClient as createServerClientSupabase,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerClient = async (useServiceRole = false) => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase URL or API key is missing. Please check your environment variables."
    );
    throw new Error("Supabase URL and API key are required");
  }

  return createServerClientSupabase(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Only set cookies in server actions or route handlers
        if (typeof window === "undefined") {
          cookieStore.set({ name, value, ...options });
        }
      },
      remove(name: string, options: CookieOptions) {
        // Only remove cookies in server actions or route handlers
        if (typeof window === "undefined") {
          cookieStore.delete({ name, ...options });
        }
      },
    },
  });
};

// Add this line to provide createClient as an alias for createServerClient
export const createClient = createServerClient;
