"use client";

import { useEffect } from "react";
import { useUserActions } from "@/lib/store/user-store";

// This component initializes the user store by fetching the session
// and setting up the auth state change listener.
// It should wrap the main content of your application in the root layout.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUserSession, listenToAuthState } = useUserActions();

  useEffect(() => {
    // Fetch the initial user session when the component mounts.
    fetchUserSession();

    // Set up the listener for auth state changes (e.g., sign in, sign out).
    // The listenToAuthState action should return an unsubscribe function.
    const unsubscribe = listenToAuthState();

    // Cleanup function: Unsubscribe from the listener when the component unmounts.
    return () => {
      unsubscribe();
    };
    // Ensure actions are stable references or add them to dependency array if needed.
    // Zustand actions are typically stable, so an empty array might suffice,
    // but including them is safer if their references could change.
  }, [fetchUserSession, listenToAuthState]);

  // Render the children wrapped by this provider
  return <>{children}</>;
}
