import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

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
    updateProfile: (profileData: Partial<UserProfile>) => Promise<void>; // New action for profile updates
    checkNicknameAvailability: (nickname: string) => Promise<boolean>; // New action
    changeNickname: (
      newNickname: string
    ) => Promise<{ success: boolean; message: string }>; // New action for nickname change
  };
}

// Cost for changing nickname (after the first free change)
const NICKNAME_CHANGE_COST = 100000;

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

    // New action to update user profile
    updateProfile: async (profileData: Partial<UserProfile>) => {
      const currentState = get();
      const userId = currentState.user?.id;

      if (!userId) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      set({ isLoading: true });

      try {
        // Update the profile in the database
        const { error } = await supabase
          .from("users")
          .update({
            ...profileData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          throw error;
        }

        // Update the local state with the new profile data
        set({
          profile: currentState.profile
            ? { ...currentState.profile, ...profileData }
            : null,
        });

        toast.success("Profile updated successfully");
      } catch (error: any) {
        toast.error(`Failed to update profile: ${error.message}`);
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },

    // Replace the checkNicknameAvailability function with this more efficient version
    checkNicknameAvailability: async (nickname: string) => {
      const currentState = get();
      const userId = currentState.user?.id;

      if (!nickname.trim() || nickname.length < 3) {
        return false;
      }

      try {
        // Direct and efficient query to check nickname existence
        const { count, error } = await supabase
          .from("users")
          .select("nickname", { count: "exact", head: true }) // Using head: true to only count, not return data
          .eq("nickname", nickname)
          .neq("id", userId || "");

        if (error) throw error;

        return count === 0; // Return true if nickname is available
      } catch (error: any) {
        console.error("Error checking nickname:", error);
        throw error; // Propagate error to handle in UI
      }
    },

    // New action to handle nickname changes with coin deduction
    changeNickname: async (newNickname: string) => {
      const currentState = get();
      const userId = currentState.user?.id;
      const profile = currentState.profile;

      if (!userId || !profile) {
        return {
          success: false,
          message: "You must be logged in to change your nickname",
        };
      }

      // Check if nickname is available
      const isAvailable =
        await get().actions.checkNicknameAvailability(newNickname);
      if (!isAvailable) {
        return { success: false, message: "This nickname is already taken" };
      }

      // Check if this is the first nickname change (free) or if user has enough coins
      const isFirstChange =
        !profile.nickname || profile.nickname === profile.email?.split("@")[0];
      const hasEnoughCoins = (profile.kor_coins || 0) >= NICKNAME_CHANGE_COST;

      if (!isFirstChange && !hasEnoughCoins) {
        return {
          success: false,
          message: `You don't have enough coins. Nickname change costs ${NICKNAME_CHANGE_COST.toLocaleString()} coins.`,
        };
      }

      set({ isLoading: true });

      try {
        // Calculate new coin balance if not the first change
        const newCoinBalance = isFirstChange
          ? profile.kor_coins
          : (profile.kor_coins || 0) - NICKNAME_CHANGE_COST;

        // Update the profile in the database
        const { error } = await supabase
          .from("users")
          .update({
            nickname: newNickname,
            kor_coins: newCoinBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) {
          throw error;
        }

        // Update the local state with the new profile data
        set({
          profile: {
            ...profile,
            nickname: newNickname,
            kor_coins: newCoinBalance,
          },
        });

        return {
          success: true,
          message: isFirstChange
            ? "Nickname changed successfully"
            : `Nickname changed successfully. ${NICKNAME_CHANGE_COST.toLocaleString()} coins have been deducted.`,
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Failed to change nickname: ${error.message}`,
        };
      } finally {
        set({ isLoading: false });
      }
    },
  },
}));

// Export actions separately for easier usage in components
export const useUserActions = () => useUserStore((state) => state.actions);
