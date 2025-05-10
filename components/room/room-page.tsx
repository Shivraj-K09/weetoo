"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  supabase,
  ensureAuthSession,
  reconnectSupabase,
} from "@/lib/supabase/client";
import { forceResetSupabaseClient } from "@/lib/supabase/utils";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WarningDialog } from "@/components/room/warning-dialog";
import { CloseRoomDialog } from "@/components/room/close-room-dialog";
import { deleteRoom } from "@/app/actions/delete-room";
import { formatLargeNumber, extractCurrencies } from "@/utils/format-utils";
import { useRoomDetails } from "@/hooks/use-room-details";
import { usePriceData } from "@/hooks/use-price-data";
import { RoomHeader } from "@/components/room/room-header";
import { ParticipantsPanel } from "@/components/room/participants-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { RoomSkeleton } from "@/components/room/room-skeleton";
import { usePersistentConnection } from "@/hooks/use-persistent-connection";
import { AutoJoinRoom } from "@/components/room/auto-join-room";
import {
  fetchWithCache,
  clearCache,
  preloadAssets,
} from "@/utils/data-optimization";
import {
  saveRoomData,
  getCachedRoomData,
  saveAuthState,
  getCachedAuthState,
  wasPageRefreshed,
  markRefreshHandled,
  hasHandledRefresh,
  clearRefreshHandled,
} from "@/utils/room-persistence";

// Lazy load non-critical components
const TradingTabs = lazy(() =>
  import("@/components/room/trading-tabs").then((mod) => ({
    default: mod.TradingTabs,
  }))
);
const PriceInfoBar = lazy(() =>
  import("@/components/room/price-info-bar").then((mod) => ({
    default: mod.PriceInfoBar,
  }))
);
const TradingChart = lazy(() =>
  import("@/components/room/trading-chart").then((mod) => ({
    default: mod.TradingChart,
  }))
);

// Prioritize loading of TradingTabsBottom with a lower priority threshold
const TradingTabsBottom = lazy(() =>
  import("@/components/room/trading-tabs-bottom").then((mod) => ({
    default: mod.TradingTabsBottom,
  }))
);

// Prioritize loading of TradingMarketPlace
const TradingMarketPlace = lazy(() =>
  import("@/components/room/trading-market-place").then((mod) => ({
    default: mod.TradingMarketPlace,
  }))
);

// Define the props interface for RoomPage
interface RoomPageProps {
  roomData: any;
  initialParticipants?: any[];
  initialTradingRecords?: any;
}

// Add error boundary and fallback UI
export default function RoomPage({
  roomData,
  initialParticipants = [],
  initialTradingRecords = null,
}: RoomPageProps) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;
  const authCheckedRef = useRef(false);
  const authRetryCountRef = useRef(0);
  const maxAuthRetries = 5;
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null | NodeJS.Timeout[]>(
    []
  );
  const forceRenderRef = useRef(0);
  const isRefreshRef = useRef(false);
  const mountedRef = useRef(false);
  const initialLoadCompleteRef = useRef(false);
  const dataLoadedRef = useRef({
    auth: false,
    room: false,
    price: false,
  });

  // Preload critical assets
  useEffect(() => {
    preloadAssets();
  }, []);

  // Then add this effect to set it correctly on the client side
  useEffect(() => {
    // Set the refresh state once we're in the browser
    isRefreshRef.current = wasPageRefreshed();
    mountedRef.current = true;

    // Force reset Supabase client on mount to ensure clean state
    forceResetSupabaseClient().then(() => {
      console.log("[ROOM PAGE] Supabase client force reset on mount");
    });

    return () => {
      mountedRef.current = false;

      // Clean up on unmount
      if (loadingTimeoutRef.current) {
        if (Array.isArray(loadingTimeoutRef.current)) {
          (loadingTimeoutRef.current as NodeJS.Timeout[]).forEach((id) =>
            clearTimeout(id)
          );
        } else {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = null;
      }

      // Remove all Supabase channels on unmount
      supabase.removeAllChannels();

      // Clear data cache
      clearCache();
    };
  }, []);

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const [isRecovering, setIsRecovering] = useState(isRefreshRef.current);
  const [initialRender, setInitialRender] = useState(true);

  // Extract room ID from the URL - properly handle UUID format
  // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
  const roomId =
    roomData?.id || (roomNameParam ? roomNameParam.substring(0, 36) : "");

  // Use persistent connection
  const { connectionStatus, isConnected } = usePersistentConnection(
    "room",
    roomId
  );

  // State for the user
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use custom hooks with optimized loading
  const {
    roomDetails,
    isLoading,
    participants,
    ownerName,
    selectedSymbol,
    setSelectedSymbol,
    fetchParticipants,
  } = useRoomDetails(roomData, roomId);

  const { priceData, priceDataLoaded, fundingData, handlePriceUpdate } =
    usePriceData(selectedSymbol);

  // Function to force a component re-render
  const forceComponentUpdate = useCallback(() => {
    if (!mountedRef.current) return;
    forceRenderRef.current += 1;
    setForceRender((prev) => prev + 1);
    console.log(
      "[ROOM PAGE] Forcing component update:",
      forceRenderRef.current
    );
  }, []);

  // Handle page refresh detection with improved recovery
  useEffect(() => {
    if (!mountedRef.current) return;

    if (isRefreshRef.current && !hasHandledRefresh(roomId)) {
      console.log("[ROOM PAGE] Detected page refresh, starting recovery");
      setIsRecovering(true);

      // Mark that we're handling this refresh
      markRefreshHandled(roomId);

      // Try to recover from cached data
      const cachedRoomData = getCachedRoomData(roomId);
      if (cachedRoomData) {
        console.log(
          "[ROOM PAGE] Found cached room data, using for initial render"
        );
      }

      // Force auth session refresh with a more aggressive approach
      const recoverSession = async () => {
        // First try the normal refresh
        const success = await ensureAuthSession();

        if (success) {
          console.log(
            "[ROOM PAGE] Successfully recovered auth session after refresh"
          );
          if (mountedRef.current) {
            setIsRecovering(false);
            forceComponentUpdate();
          }
        } else {
          console.log(
            "[ROOM PAGE] Failed to recover auth session, trying reconnect"
          );
          // Try a more aggressive reconnect
          const reconnectSuccess = await reconnectSupabase();

          if (reconnectSuccess && mountedRef.current) {
            setIsRecovering(false);
            forceComponentUpdate();
          } else if (mountedRef.current) {
            // If still failing, show an error and let the user refresh
            setLoadError("Connection lost. Please refresh the page.");
            setIsRecovering(false);
          }
        }
      };

      recoverSession();
    }

    return () => {
      // Clean up refresh handling when component unmounts
      if (roomId) {
        clearRefreshHandled(roomId);
      }
    };
  }, [roomId, forceComponentUpdate]);

  // Add a function to refresh the room data
  const refreshRoom = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      console.log("[ROOM PAGE] Refreshing room data...");

      // Force reconnect
      await reconnectSupabase();

      // Refresh participants
      await fetchParticipants();

      // Force a component update
      forceComponentUpdate();

      console.log("[ROOM PAGE] Room data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing room:", error);
    }
  }, [fetchParticipants, forceComponentUpdate]);

  // Function to retry authentication with improved error handling
  const retryAuth = useCallback(async () => {
    if (!mountedRef.current) return false;

    console.log("[ROOM PAGE] Retrying authentication...");

    try {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        if (Array.isArray(loadingTimeoutRef.current)) {
          loadingTimeoutRef.current.forEach((id) => clearTimeout(id));
        } else {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = null;
      }

      // Reset loading states
      setAuthLoading(true);
      setLoadError(null);
      setLoadTimeout(false);

      // Force reconnect
      const reconnectSuccess = await reconnectSupabase();
      if (!reconnectSuccess) {
        console.log(
          "[ROOM PAGE] Reconnect failed, trying direct session refresh"
        );
      }

      // Get the current session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("[ROOM PAGE] Error getting session:", sessionError);
        throw new Error("Failed to get authentication session");
      }

      if (!sessionData.session) {
        if (mountedRef.current) {
          setLoadError("You must be logged in to access this room.");
          setAuthLoading(false);
        }
        return false;
      }

      // Fetch user data with caching
      const userData = await fetchWithCache(
        `user:${sessionData.session.user.id}`,
        async () => {
          const { data, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", sessionData.session!.user.id)
            .single();

          if (error) throw error;
          return data;
        },
        30000 // 30 second TTL for user data
      );

      console.log("[ROOM PAGE] Authentication successful:", userData.id);
      if (mountedRef.current) {
        setUser(userData);
        setAuthLoading(false);
        dataLoadedRef.current.auth = true;
      }

      // Save auth state for recovery
      saveAuthState(userData.id, userData);

      // Force a component update to ensure everything re-renders
      forceComponentUpdate();

      return true;
    } catch (error) {
      console.error("[ROOM PAGE] Authentication retry failed:", error);
      if (mountedRef.current) {
        setLoadError("Authentication failed. Please try refreshing the page.");
        setAuthLoading(false);
      }
      return false;
    }
  }, [forceComponentUpdate]);

  // Add timeout for loading with better error recovery - but don't show any toasts
  useEffect(() => {
    if (!mountedRef.current) return;

    // Clear any existing timeout when component re-renders
    if (loadingTimeoutRef.current) {
      if (Array.isArray(loadingTimeoutRef.current)) {
        (loadingTimeoutRef.current as NodeJS.Timeout[]).forEach((id) =>
          clearTimeout(id)
        );
      } else {
        clearTimeout(loadingTimeoutRef.current);
      }
      loadingTimeoutRef.current = null;
    }

    // Set a new timeout - but don't show any UI feedback
    loadingTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      if (isLoading || authLoading) {
        console.warn(
          "[ROOM PAGE] Initial loading period elapsed, attempting recovery..."
        );

        // Try to recover automatically without showing toast
        retryAuth().then((success) => {
          if (!success && mountedRef.current) {
            console.warn(
              "[ROOM PAGE] First recovery attempt failed, continuing..."
            );

            // Set an extended timeout for a second recovery attempt
            const extendedTimeoutId = setTimeout(() => {
              if (!mountedRef.current) return;

              if (isLoading || authLoading) {
                console.error(
                  "[ROOM PAGE] Extended loading timeout reached, final recovery attempt"
                );

                // Final retry with more aggressive approach
                reconnectSupabase().then(async (reconnected) => {
                  if (reconnected && mountedRef.current) {
                    const authSuccess = await retryAuth();
                    if (authSuccess && mountedRef.current) {
                      forceComponentUpdate();
                    } else if (mountedRef.current) {
                      setLoadTimeout(true);
                    }
                  } else if (mountedRef.current) {
                    setLoadTimeout(true);
                  }
                });
              }
            }, 15000); // Additional 15 seconds

            // Store both timeout IDs for cleanup
            loadingTimeoutRef.current = [
              loadingTimeoutRef.current as NodeJS.Timeout,
              extendedTimeoutId,
            ];
          }
        });
      }
    }, 10000); // Initial 10 seconds

    return () => {
      // Clear all timeouts
      if (loadingTimeoutRef.current) {
        if (Array.isArray(loadingTimeoutRef.current)) {
          (loadingTimeoutRef.current as NodeJS.Timeout[]).forEach((id) =>
            clearTimeout(id)
          );
        } else {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = null;
      }
    };
  }, [isLoading, authLoading, retryAuth, forceRender]);

  // Reset Supabase connections when component mounts
  useEffect(() => {
    if (!mountedRef.current) return;

    const resetConnections = async () => {
      console.log("[ROOM PAGE] Resetting Supabase connections");

      // Force a refresh of the auth session
      try {
        await reconnectSupabase();
      } catch (error) {
        console.error("[ROOM PAGE] Error refreshing auth session:", error);
      }
    };

    resetConnections();

    // Set up a periodic check to ensure connection is maintained
    const connectionCheckInterval = setInterval(() => {
      if (!mountedRef.current) return;

      if (!isConnected) {
        console.log(
          "[ROOM PAGE] Connection check failed, attempting reconnect"
        );
        reconnectSupabase();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      // Clean up all channels when component unmounts
      supabase.removeAllChannels();
      clearInterval(connectionCheckInterval);
    };
  }, [isConnected]);

  // Check if user is logged in with improved error handling
  useEffect(() => {
    if (!mountedRef.current) return;

    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        console.log("[AUTH] Checking authentication status...");

        // Try to recover from cached auth state first if this is a refresh
        if (isRefreshRef.current) {
          const cachedSession = await supabase.auth.getSession();
          if (cachedSession.data.session) {
            const userId = cachedSession.data.session.user.id;
            const cachedUserData = getCachedAuthState(userId);

            if (cachedUserData) {
              console.log("[AUTH] Using cached auth state for quick render");
              if (mountedRef.current) {
                setUser(cachedUserData);
              }
              // Don't set authLoading to false yet, still do the full auth check
            }
          }
        }

        // Force refresh the session first
        const refreshResult = await supabase.auth.refreshSession();
        if (refreshResult.error) {
          console.error(
            "[AUTH] Error refreshing session:",
            refreshResult.error
          );

          // If we've tried too many times, give up
          if (authRetryCountRef.current >= maxAuthRetries) {
            if (mountedRef.current) {
              setLoadError(
                "Authentication failed after multiple attempts. Please try refreshing the page."
              );
              setAuthLoading(false);
            }
            return;
          }

          // Otherwise, try again after a delay
          authRetryCountRef.current++;
          setTimeout(checkAuth, 2000);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log("[AUTH] Session found, fetching user data...");

          // Fetch user data with caching
          const userData = await fetchWithCache(
            `user:${session.user.id}`,
            async () => {
              const { data, error } = await supabase
                .from("users")
                .select(
                  "id, first_name, last_name, email, avatar_url, kor_coins"
                )
                .eq("id", session.user.id)
                .single();

              if (error) throw error;
              return data;
            },
            30000 // 30 second TTL for user data
          );

          console.log("[AUTH] User data fetched successfully:", userData.id);
          if (mountedRef.current) {
            setUser(userData);
            setAuthLoading(false);
            initialLoadCompleteRef.current = true;
            dataLoadedRef.current.auth = true;
          }
          authRetryCountRef.current = 0; // Reset counter on success

          // Save auth state for recovery
          saveAuthState(userData.id, userData);
        } else {
          console.log("[AUTH] No session found");

          // If we've tried too many times, show error
          if (authRetryCountRef.current >= maxAuthRetries) {
            if (mountedRef.current) {
              setLoadError("You must be logged in to access this room.");
              setAuthLoading(false);
            }
          } else {
            // Try to sign in again
            authRetryCountRef.current++;
            setTimeout(checkAuth, 2000);
          }
        }
      } catch (error) {
        console.error("[AUTH] Error checking auth:", error);

        // If we've tried too many times, give up
        if (authRetryCountRef.current >= maxAuthRetries) {
          if (mountedRef.current) {
            setLoadError(
              "Authentication error. Please try refreshing the page."
            );
            setAuthLoading(false);
          }
        } else {
          // Otherwise, try again after a delay
          authRetryCountRef.current++;
          setTimeout(checkAuth, 2000);
        }
      } finally {
        authCheckedRef.current = true;
      }
    };

    // Start the auth check process
    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        console.log("[AUTH] Auth state changed:", event);

        if (event === "SIGNED_IN" && session) {
          // Fetch user data on sign in
          const userData = await fetchWithCache(
            `user:${session.user.id}`,
            async () => {
              const { data, error } = await supabase
                .from("users")
                .select(
                  "id, first_name, last_name, email, avatar_url, kor_coins"
                )
                .eq("id", session.user.id)
                .single();

              if (error) throw error;
              return data;
            },
            30000 // 30 second TTL for user data
          );

          if (userData && mountedRef.current) {
            console.log("[AUTH] User data updated after auth change");
            setUser(userData);
            setAuthLoading(false);
            dataLoadedRef.current.auth = true;

            // Save auth state for recovery
            saveAuthState(userData.id, userData);

            // Force component update
            forceComponentUpdate();
          }
        } else if (event === "SIGNED_OUT" && mountedRef.current) {
          setUser(null);
          setAuthLoading(false);
          setLoadError("You must be logged in to access this room.");
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [forceComponentUpdate]);

  const currentUserId = user?.id;

  // Save room data for recovery when it changes
  useEffect(() => {
    if (!mountedRef.current) return;

    if (roomDetails) {
      saveRoomData(roomId, roomDetails);
      dataLoadedRef.current.room = true;
    }
  }, [roomId, roomDetails]);

  // Update data loaded status when price data is loaded
  useEffect(() => {
    if (priceDataLoaded) {
      dataLoadedRef.current.price = true;
    }
  }, [priceDataLoaded]);

  // Effect to handle initial render state
  useEffect(() => {
    // After a short delay, set initialRender to false to allow lazy components to load
    const timer = setTimeout(() => {
      setInitialRender(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;

    // Set up real-time subscription for room updates
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          if (!mountedRef.current) return;

          console.log("Received room update:", payload);
          // Refresh participants and room details
          await fetchParticipants();
        }
      )
      .subscribe((status) => {
        console.log(
          `[ROOM PAGE] Subscription status for room:${roomId}:`,
          status
        );
      });

    // Add window unload event listener for better cleanup
    const handleUnload = () => {
      console.log("Window unloading, cleaning up subscriptions");
      supabase.removeChannel(roomSubscription);
    };

    window.addEventListener("beforeunload", handleUnload);

    // Add visibility change handler to check connection when tab becomes visible
    const handleVisibilityChange = () => {
      if (!mountedRef.current) return;

      if (document.visibilityState === "visible") {
        console.log("[ROOM PAGE] Tab became visible, checking connection");

        // Check if we need to reconnect
        if (!isConnected) {
          console.log(
            "[ROOM PAGE] Connection lost while tab was hidden, reconnecting"
          );
          reconnectSupabase().then((success) => {
            if (success && mountedRef.current) {
              // Refresh data after reconnection
              fetchParticipants();
              forceComponentUpdate();
            }
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (!mountedRef.current) return;

      console.log("Cleaning up room subscriptions");
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      supabase.removeChannel(roomSubscription);
    };
  }, [
    roomId,
    router,
    roomData,
    fetchParticipants,
    currentUserId,
    isConnected,
    forceComponentUpdate,
  ]);

  // Check if warning should be shown
  useEffect(() => {
    if (!mountedRef.current) return;

    const checkWarningDismissed = () => {
      const dismissedTime = localStorage.getItem("trading-warning-dismissed");

      if (!dismissedTime) {
        setShowWarning(true);
        return;
      }

      // Check if 24 hours have passed since last dismissal
      const lastDismissed = Number.parseInt(dismissedTime, 10);
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      if (Date.now() - lastDismissed > twentyFourHoursMs) {
        setShowWarning(true);
        localStorage.removeItem("trading-warning-dismissed");
      }
    };

    // Small delay to ensure the component is mounted
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        checkWarningDismissed();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle warning confirmation
  const handleWarningConfirm = useCallback(() => {
    if (!mountedRef.current) return;
    setShowWarning(false);
  }, []);

  // Handle room closure
  const handleCloseRoom = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      if (!roomDetails) {
        toast.error("Room details not available");
        return;
      }

      // Call the server action to delete the room
      const result = await deleteRoom(roomDetails.id);

      if (result.success) {
        // Close the window
        window.close();

        // As a fallback, redirect to home page if window.close() doesn't work
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        toast.error(`Failed to close room: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error closing room:", error);
      toast.error("An error occurred while closing the room");
    }
  }, [roomDetails, router]);

  // Handle symbol change
  const handleSymbolChange = useCallback(
    (symbol: string) => {
      if (!mountedRef.current) return;
      setSelectedSymbol(symbol);
    },
    [setSelectedSymbol]
  );

  // Handle close room click
  const handleCloseRoomClick = useCallback(() => {
    if (!mountedRef.current) return;
    setShowCloseRoomDialog(true);
  }, []);

  // Handle cancel close room
  const handleCancelCloseRoom = useCallback(() => {
    if (!mountedRef.current) return;
    setShowCloseRoomDialog(false);
  }, []);

  // Show error UI if timeout or error occurred
  if (loadTimeout) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#181a20]">
        <p className="text-white text-xl font-semibold mb-4">
          Loading timeout reached
        </p>
        <p className="text-white/70 mb-6 max-w-md text-center">
          The room is taking too long to load. This might be due to connection
          issues or server problems.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={retryAuth}
            className="bg-[#E74C3C] hover:bg-[#E74C3C]/90"
          >
            Retry Connection
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#3498DB] hover:bg-[#3498DB]/90"
          >
            Refresh Page
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#181a20]">
        <p className="text-white text-xl font-semibold mb-4">
          Error Loading Room
        </p>
        <p className="text-white/70 mb-6 max-w-md text-center">{loadError}</p>
        <div className="flex gap-4">
          <Button
            onClick={retryAuth}
            className="bg-[#E74C3C] hover:bg-[#E74C3C]/90"
          >
            Retry Connection
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#3498DB] hover:bg-[#3498DB]/90"
          >
            Refresh Page
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use RoomSkeleton only if we have no data at all
  if ((isLoading || authLoading) && !roomDetails && !user) {
    return <RoomSkeleton />;
  }

  if (!roomDetails) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#181a20]">
        <p className="text-white text-xl font-semibold mb-4">Room not found</p>
        <p className="text-white/70 mb-6 max-w-md text-center">
          The trading room you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/">
          <Button className="bg-[#E74C3C] hover:bg-[#E74C3C]/90">
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  const isHost = user?.id === roomDetails?.owner_id;
  console.log(
    "[RENDER] User ID:",
    user?.id,
    "Owner ID:",
    roomDetails?.owner_id,
    "Is Host:",
    isHost
  );

  // Convert currentPrice to a number to fix the type error
  const currentPriceNumber =
    typeof priceData?.currentPrice === "string"
      ? Number.parseFloat(priceData.currentPrice)
      : typeof priceData?.currentPrice === "number"
        ? priceData.currentPrice
        : 0;

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      {/* Warning Dialog */}
      <WarningDialog isOpen={showWarning} onConfirm={handleWarningConfirm} />

      {/* Close Room Dialog */}
      <CloseRoomDialog
        isOpen={showCloseRoomDialog}
        onConfirm={handleCloseRoom}
        onCancel={handleCancelCloseRoom}
      />

      <div className="p-4 w-full flex gap-1.5 bg-[#181a20]">
        <div className="h-full text-white rounded-md shadow-sm flex-1 w-full">
          <div className="flex flex-col gap-1.5">
            {/* Room Header */}
            <RoomHeader
              roomDetails={roomDetails}
              ownerName={ownerName}
              participants={participants}
              user={user}
              onCloseRoomClick={handleCloseRoomClick}
              onRefreshRoom={refreshRoom}
            />

            {/* Auto-join component to ensure user is added to participants */}
            {user && roomDetails && (
              <AutoJoinRoom roomId={roomDetails.id} userId={user.id} />
            )}

            {!isHost && (
              <div className="bg-[#212631] rounded-md w-full mb-1.5 px-4 py-2 border border-yellow-500/30 flex items-center justify-center">
                <div className="text-yellow-400 text-sm flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  관전 모드 - 호스트의 거래를 실시간으로 지켜보고 있습니다
                </div>
              </div>
            )}

            {/* Price Info Bar */}
            <div className="bg-[#212631] rounded-md w-full">
              <Suspense
                fallback={
                  <div className="h-16 bg-[#212631] animate-pulse rounded-md"></div>
                }
              >
                {!initialRender && (
                  <PriceInfoBar
                    tradingPairs={roomDetails.trading_pairs}
                    selectedSymbol={
                      selectedSymbol || roomDetails.trading_pairs[0]
                    }
                    priceData={priceData}
                    priceDataLoaded={priceDataLoaded}
                    fundingData={fundingData}
                    onSymbolChange={handleSymbolChange}
                    formatLargeNumber={formatLargeNumber}
                    extractCurrencies={extractCurrencies}
                  />
                )}
              </Suspense>
            </div>

            <div className="flex gap-1.5 w-full">
              {/* Trading Chart */}
              <Suspense
                fallback={
                  <div className="flex-1 h-[45rem] bg-[#212631] animate-pulse rounded-md"></div>
                }
              >
                {!initialRender && (
                  <TradingChart
                    symbol={selectedSymbol || roomDetails.trading_pairs[0]}
                  />
                )}
              </Suspense>

              {/* Tabs */}
              <div className="bg-[#212631] p-1 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
                <Suspense
                  fallback={
                    <div className="h-full bg-[#212631] animate-pulse rounded-md"></div>
                  }
                >
                  {!initialRender && (
                    <TradingTabs
                      symbol={selectedSymbol || roomDetails.trading_pairs[0]}
                      onPriceUpdate={handlePriceUpdate}
                    />
                  )}
                </Suspense>
              </div>

              <Suspense
                fallback={
                  <div className="w-[19rem] h-[45rem] bg-[#212631] rounded-md p-4 border border-[#3f445c]">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-white font-medium">거래</div>
                      <div className="flex space-x-2">
                        <div className="w-20 h-6 bg-[#1a1e27]/50 rounded animate-pulse"></div>
                      </div>
                    </div>

                    {/* Price input skeleton */}
                    <div className="mb-4">
                      <div className="text-xs text-white/70 mb-1">주문가격</div>
                      <div className="h-10 bg-[#1a1e27]/50 rounded animate-pulse"></div>
                    </div>

                    {/* Amount input skeleton */}
                    <div className="mb-4">
                      <div className="text-xs text-white/70 mb-1">주문수량</div>
                      <div className="h-10 bg-[#1a1e27]/50 rounded animate-pulse"></div>
                    </div>

                    {/* Percentage buttons skeleton */}
                    <div className="grid grid-cols-5 gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-8 bg-[#1a1e27]/50 rounded animate-pulse"
                        ></div>
                      ))}
                    </div>

                    {/* Leverage selector skeleton */}
                    <div className="mb-4">
                      <div className="text-xs text-white/70 mb-1">
                        레버리지 설정
                      </div>
                      <div className="h-10 bg-[#1a1e27]/50 rounded animate-pulse"></div>
                    </div>

                    {/* Position info skeleton */}
                    <div className="space-y-2 mb-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <div className="w-24 h-5 bg-[#1a1e27]/50 rounded animate-pulse"></div>
                          <div className="w-24 h-5 bg-[#1a1e27]/50 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="h-10 bg-[#00C879]/30 rounded animate-pulse"></div>
                      <div className="h-10 bg-[#FF5252]/30 rounded animate-pulse"></div>
                    </div>
                  </div>
                }
              >
                <TradingMarketPlace />
              </Suspense>
            </div>

            {/* Increased height to 16rem for the tabs container */}
            <div className="bg-[#212631] w-full h-[16rem] border border-[#3f445c]">
              <Suspense
                fallback={
                  <div className="h-full bg-[#212631] rounded-md p-2 border border-[#3f445c]">
                    <div className="flex space-x-1 border-b border-[#3f445c]">
                      <div className="px-4 py-2 text-sm text-white/70 bg-[#1a1e27]/30 rounded-t-md">
                        거래
                      </div>
                      <div className="px-4 py-2 text-sm text-white/70">
                        포지션
                      </div>
                      <div className="px-4 py-2 text-sm text-white/70">
                        거래내역
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="bg-[#212631] rounded max-w-[290px] w-full border border-[#3f445c] overflow-y-auto no-scrollbar">
                        <div className="flex gap-1.5 w-full p-2">
                          <div className="h-10 w-full bg-[#1a1e27] rounded animate-pulse"></div>
                          <div className="h-10 w-full bg-[#1a1e27] rounded animate-pulse"></div>
                        </div>
                        <div className="h-10 w-full bg-[#1a1e27] rounded m-2 animate-pulse"></div>
                        <div className="h-10 w-full bg-[#1a1e27] rounded m-2 animate-pulse"></div>
                        <div className="h-32 w-full bg-[#1a1e27] rounded m-2 animate-pulse"></div>
                        <div className="grid grid-cols-2 gap-2 p-2">
                          <div className="h-10 w-full bg-[#00C879]/30 rounded animate-pulse"></div>
                          <div className="h-10 w-full bg-[#FF5252]/30 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                {!initialRender && (
                  <TradingTabsBottom
                    roomId={roomDetails.id}
                    isHost={isHost}
                    symbol={selectedSymbol || roomDetails.trading_pairs[0]}
                    currentPrice={currentPriceNumber}
                    virtualCurrency="KOR"
                  />
                )}
              </Suspense>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-[19rem] rounded-md text-white flex flex-col gap-1.5">
          <ParticipantsPanel
            roomDetails={roomDetails}
            participants={participants}
          />
          <ChatPanel
            roomId={roomDetails.id}
            user={user}
            ownerId={roomDetails.owner_id}
          />
        </div>
      </div>
    </div>
  );
}
