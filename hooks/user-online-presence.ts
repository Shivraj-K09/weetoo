"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

export function useOnlinePresence() {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(true);
  const presenceChannelRef = useRef<any>(null);
  const userIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  // Function to clean up presence
  const cleanupPresence = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (presenceChannelRef.current) {
      try {
        // For logged-in users, try to untrack first
        if (userIdRef.current) {
          try {
            presenceChannelRef.current.untrack();
          } catch (e) {
            console.error("Error untracking presence:", e);
          }
        }

        // Always unsubscribe
        presenceChannelRef.current.unsubscribe();
        presenceChannelRef.current = null;
      } catch (error) {
        console.error("Error during presence cleanup:", error);
        presenceChannelRef.current = null;
      }
    }
  };

  // Update the setupPresenceChannel function to be more robust with reconnection
  const setupPresenceChannel = async (userId: string | null) => {
    // Clean up any existing presence
    cleanupPresence();

    setIsConnecting(true);
    userIdRef.current = userId;

    // Set a timeout to ensure we don't get stuck in "connecting" state
    connectionTimeoutRef.current = setTimeout(() => {
      if (isConnecting) {
        console.log("Connection timeout - setting fallback count");
        setIsConnecting(false);
        setOnlineUsers(0); // Default to 0
      }
    }, 5000); // 5 second timeout

    try {
      // Use a simpler channel name
      const channelName = "online_users";

      // Create a channel with minimal configuration
      presenceChannelRef.current = supabase.channel(channelName, {
        config: {
          presence: {
            key: userId || "anonymous",
          },
        },
      });

      // Track presence changes
      presenceChannelRef.current
        .on("presence", { event: "sync" }, () => {
          try {
            const presenceState = presenceChannelRef.current.presenceState();

            // Count logged-in users only
            let loggedInCount = 0;

            // Go through each presence entry
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                if (presence.is_logged_in) {
                  loggedInCount++;
                }
              });
            });

            console.log("Presence sync - logged-in users:", loggedInCount);

            setOnlineUsers(loggedInCount);
            setIsOnline(!!userId);
            setIsConnecting(false);

            // Reset retry count on successful sync
            retryCountRef.current = 0;

            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
              connectionTimeoutRef.current = null;
            }
          } catch (error) {
            console.error("Error processing presence sync:", error);
            setIsConnecting(false);
            setOnlineUsers(0); // Default to 0 on error
          }
        })
        .on("presence", { event: "join" }, () => {
          // Someone joined, refresh the count
          try {
            const presenceState = presenceChannelRef.current.presenceState();
            let loggedInCount = 0;
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                if (presence.is_logged_in) {
                  loggedInCount++;
                }
              });
            });
            setOnlineUsers(loggedInCount);
          } catch (error) {
            console.error("Error processing presence join:", error);
          }
        })
        .on("presence", { event: "leave" }, () => {
          // Someone left, refresh the count
          try {
            const presenceState = presenceChannelRef.current.presenceState();
            let loggedInCount = 0;
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((presence: any) => {
                if (presence.is_logged_in) {
                  loggedInCount++;
                }
              });
            });
            setOnlineUsers(loggedInCount);
          } catch (error) {
            console.error("Error processing presence leave:", error);
          }
        })
        .subscribe(async (status: string) => {
          console.log("Presence channel status:", status);

          if (status === "SUBSCRIBED") {
            try {
              // Track user's presence with minimal data
              await presenceChannelRef.current.track({
                is_logged_in: !!userId,
              });

              // Set up heartbeat for all users
              heartbeatIntervalRef.current = setInterval(async () => {
                if (presenceChannelRef.current) {
                  try {
                    await presenceChannelRef.current.track({
                      is_logged_in: !!userId,
                    });
                  } catch (error) {
                    console.error("Error sending heartbeat:", error);
                    // Try to reconnect on heartbeat error
                    setupPresenceChannel(userId);
                  }
                }
              }, 30000); // Send heartbeat every 30 seconds
            } catch (error) {
              console.error("Error tracking presence:", error);
              setIsConnecting(false);
              setOnlineUsers(0);
            }
          } else if (status === "CHANNEL_ERROR") {
            console.error("Channel error");
            setIsConnecting(false);
            setOnlineUsers(0);

            // Retry logic with exponential backoff
            if (retryCountRef.current < 5) {
              const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000);
              console.log(
                `Retrying presence connection in ${delay}ms (attempt ${
                  retryCountRef.current + 1
                })`
              );

              retryTimeoutRef.current = setTimeout(() => {
                retryCountRef.current++;
                setupPresenceChannel(userId);
              }, delay);
            }
          } else if (status === "TIMED_OUT") {
            console.error("Channel connection timed out");
            setIsConnecting(false);
            setOnlineUsers(0);

            // Retry immediately on timeout
            retryTimeoutRef.current = setTimeout(() => {
              setupPresenceChannel(userId);
            }, 2000);
          } else if (status === "CLOSED") {
            console.log("Presence channel closed, attempting to reconnect");

            // Retry with a short delay
            retryTimeoutRef.current = setTimeout(() => {
              setupPresenceChannel(userId);
            }, 2000);
          }
        });
    } catch (error) {
      console.error("Error setting up presence channel:", error);
      setIsConnecting(false);
      setOnlineUsers(0);

      // Retry after error
      retryTimeoutRef.current = setTimeout(() => {
        setupPresenceChannel(userId);
      }, 5000);
    }
  };

  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window === "undefined") return;

    const initializePresence = async () => {
      try {
        // Check if user is logged in
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id || null;

        // Set up presence channel with the user ID (or null for anonymous)
        await setupPresenceChannel(userId);
      } catch (error) {
        console.error("Error in initializePresence:", error);
        setIsConnecting(false);
        setOnlineUsers(0);
      }
    };

    initializePresence();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);

        try {
          if (event === "SIGNED_IN" && session?.user?.id) {
            await setupPresenceChannel(session.user.id);
          } else if (event === "SIGNED_OUT") {
            await setupPresenceChannel(null);
          }
        } catch (error) {
          console.error("Error handling auth state change:", error);
          setIsConnecting(false);
          setOnlineUsers(0);
        }
      }
    );

    // Handle page unload to properly clean up presence
    const handleBeforeUnload = () => {
      cleanupPresence();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (authListener) {
        authListener.subscription.unsubscribe();
      }

      cleanupPresence();
    };
  }, []);

  // Add this new effect to handle visibility changes
  // Add this after the other useEffect hooks
  useEffect(() => {
    // Only run this effect in the browser
    if (typeof window === "undefined") return;

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab is now visible, checking presence connection");

        // Check if we need to reconnect
        if (presenceChannelRef.current) {
          try {
            // Try to check if the channel is still alive
            const status = presenceChannelRef.current.state;
            console.log("Current presence channel status:", status);

            if (status !== "SUBSCRIBED") {
              console.log(
                "Presence channel not in SUBSCRIBED state, reconnecting"
              );
              setupPresenceChannel(userIdRef.current);
            } else {
              // Even if it's subscribed, send a heartbeat to ensure it's working
              presenceChannelRef.current.track({
                is_logged_in: !!userIdRef.current,
              });
            }
          } catch (error) {
            console.error("Error checking presence channel status:", error);
            // If there's any error, just reconnect
            setupPresenceChannel(userIdRef.current);
          }
        } else {
          // No channel reference, create a new one
          console.log(
            "No presence channel reference, creating new subscription"
          );
          setupPresenceChannel(userIdRef.current);
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { onlineUsers, isOnline, isConnecting };
}
