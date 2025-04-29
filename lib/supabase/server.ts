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
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error: unknown) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have opted-in to using cookies.
          console.error(error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options });
        } catch (error: unknown) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have opted-in to using cookies.
          console.error(error);
        }
      },
    },
  });
};

// Add this line to provide createClient as an alias for createServerClient
export const createClient = createServerClient;
