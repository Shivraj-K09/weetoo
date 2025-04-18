"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/index";

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authListenerRef = useRef<any>(null);

  useEffect(() => {
    // Flag to prevent state updates after unmount
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Use getSession without refreshing to avoid cookie modification
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session && isMounted) {
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (userData && isMounted) {
              setUser(userData);
            }
          } catch (e) {
            console.error("Error fetching user data:", e);
          }
        }
      } catch (e) {
        console.error("Error checking auth:", e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth listener without auto-refresh
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;

          if (event === "SIGNED_IN" && session) {
            try {
              const { data: userData } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (userData && isMounted) {
                setUser(userData);
              }
            } catch (e) {
              console.error("Error fetching user data on auth change:", e);
            } finally {
              if (isMounted) {
                setIsLoading(false);
              }
            }
          } else if (event === "SIGNED_OUT") {
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        }
      );

      // Store the auth listener in a ref for proper cleanup
      authListenerRef.current = authListener;
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      if (isMounted) {
        setIsLoading(false);
      }
    }

    // Cleanup function - critical for preventing navigation issues
    return () => {
      isMounted = false;

      // Properly clean up the auth listener
      if (authListenerRef.current?.subscription) {
        try {
          authListenerRef.current.subscription.unsubscribe();
        } catch (e) {
          console.error("Error unsubscribing from auth listener:", e);
        }
      }
      authListenerRef.current = null;
    };
  }, []);

  return { user, isLoading };
}
