import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

// Define the structure of the user profile data we expect from the 'users' table
// export type UserProfile = { // Removed redundant declaration
// id: string
// first_name: string
// last_name: string
// email: string // Email might also be directly on the Auth user
// provider_type: string
// kor_coins: number
// avatar_url?: string
// role?: string // This is the important field
// // Add any other fields you have in your public.users table
// }

// Define the state structure for the store
interface UserState {
  user: SupabaseUser | null; // Supabase Auth user
  profile: UserProfile | null; // User profile from your public.users table
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchUserSession: () => Promise<void>;
    clearUserSession: () => void;
    listenToAuthState: () => () => void; // Returns the unsubscribe function
    signOut: () => Promise<void>;
  };
}

// Create the Zustand store
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  isLoggedIn: false,
  isLoading: true, // Start loading initially
  error: null,
  actions: {
    // Action to fetch the current session and profile
    fetchUserSession: async () => {
      // Only set loading to true if there is no user or profile data yet.
      // This prevents the loading flash on background revalidations.
      const currentState = get();
      if (!currentState.user && !currentState.profile) {
        set({ isLoading: true });
      }
      set({ error: null }); // Clear previous errors

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // Fetch user profile from public.users table
          const { data: userProfile, error: profileError } = await supabase
            .from("users") // Ensure 'users' is your correct table name
            .select("*") // Select specific columns if needed: 'id, first_name, last_name, email, provider_type, kor_coins, avatar_url, role'
            .eq("id", session.user.id) // Make sure 'id' is the correct column name
            .single();

          // Check for profile fetch errors, excluding the "not found" error (PGRST116)
          if (profileError && profileError.code !== "PGRST116") {
            // Keep the user logged in with Auth data, but indicate profile error
            set({
              user: session.user,
              profile: null, // Explicitly null profile due to error
              isLoggedIn: true,
              error: `Failed to fetch profile: ${profileError.message}`,
            });
            // Do not set isLoading: false here; let finally handle it.
          } else {
            // Profile fetched successfully OR profile doesn't exist (PGRST116)

            set({
              user: session.user,
              profile: (userProfile as UserProfile) || null, // Set profile or null if it doesn't exist
              isLoggedIn: true,
              error:
                profileError?.code === "PGRST116"
                  ? "User profile not found."
                  : null, // Optional: Informative message if profile missing
            });
            // Do not set isLoading: false here; let finally handle it.
          }
        } else {
          // No active session

          // Call clearUserSession, which will also set isLoading to false
          get().actions.clearUserSession();
          // Need to explicitly set isLoading false here if clearUserSession doesn't guarantee it before finally runs
          // However, clearUserSession *does* set isLoading: false, so this path is covered.
        }
      } catch (error: any) {
        set({
          user: null,
          profile: null,
          isLoggedIn: false,
          error:
            error.message ||
            "An unknown error occurred while fetching the session.",
        });
        // Do not set isLoading: false here; let finally handle it.
      } finally {
        // Ensure isLoading is always set to false after execution attempt
        set({ isLoading: false });
      }
    },

    // Action to clear user data (on logout or session expiry)
    clearUserSession: () => {
      set({
        user: null,
        profile: null,
        isLoggedIn: false,
        isLoading: false, // Ensure loading is false when cleared
        error: null,
      });
    },

    // Action to listen for auth state changes
    listenToAuthState: () => {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event) => {
          // session can be null here

          // Re-fetch the entire session and profile on relevant auth changes for consistency.
          // This simplifies logic and ensures fetchUserSession's loading/error handling is used.
          if (
            event === "SIGNED_IN" ||
            event === "TOKEN_REFRESHED" ||
            event === "USER_UPDATED"
          ) {
            // No need to check for session here, fetchUserSession handles null session
            get().actions.fetchUserSession();
          } else if (event === "SIGNED_OUT") {
            // fetchUserSession will handle the null session case and call clearUserSession.
            // Calling clearUserSession directly might be slightly faster UI update.
            get().actions.clearUserSession();
          }
        }
      );
      // Return the unsubscribe function
      return () => {
        authListener?.subscription.unsubscribe();
      };
    },

    // Action to sign out
    signOut: async () => {
      // Set loading true immediately for responsiveness
      set({ isLoading: true });
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        // Successfully signed out via Supabase.
        // The onAuthStateChange listener (SIGNED_OUT event) should trigger
        // clearUserSession or fetchUserSession (which finds no session),
        // which will set isLoading: false.

        toast.success("Signed out successfully");

        // Also clear admin OTP verification when signing out
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminOtpVerified");
        }
      } catch (error: any) {
        toast.error(`Failed to sign out: ${error.message}`);
        // Explicitly set loading false and error state here in case the listener fails
        // or doesn't fire correctly after an error during signOut.
        set({ isLoading: false, error: error.message });
      }
    },
  },
}));

// Export actions separately for easier usage in components
export const useUserActions = () => useUserStore((state) => state.actions);
