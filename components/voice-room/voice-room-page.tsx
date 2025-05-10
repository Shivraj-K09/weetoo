"use client";

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  resetSupabaseClient,
  forceResetSupabaseClient,
  clearAllToasts,
} from "@/lib/supabase/utils";
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
import { VoiceChannel } from "@/components/voice-room/voice-room-channel";
import { AutoJoinRoom } from "@/components/room/auto-join-room";
import {
  fetchWithCache,
  clearCache,
  preloadAssets,
} from "@/utils/data-optimization";

// Define the props interface for VoiceRoomPage
interface VoiceRoomPageProps {
  roomData: any;
  initialParticipants?: any[];
  initialTradingRecords?: any;
}

// Lazy load non-critical components
// Prioritize loading of TradingMarketPlace
const TradingMarketPlace = lazy(() =>
  import("@/components/room/trading-market-place").then((mod) => ({
    default: mod.TradingMarketPlace,
  }))
);
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

// Add error boundary and fallback UI
export default function VoiceRoomPage({
  roomData,
  initialParticipants = [],
  initialTradingRecords = null,
}: VoiceRoomPageProps) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;
  const authCheckedRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;
  const cleanupDoneRef = useRef(false);
  const roomInitializedRef = useRef(false);
  const dataLoadedRef = useRef({
    auth: false,
    room: false,
    price: false,
  });

  // Preload critical assets
  useEffect(() => {
    preloadAssets();
  }, []);

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [initialRender, setInitialRender] = useState(true);

  // Extract room ID from the URL - properly handle UUID format
  // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
  const roomId =
    roomData?.id || (roomNameParam ? roomNameParam.substring(0, 36) : "");

  // State for the user
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use custom hooks
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

  // Effect to handle initial render state
  useEffect(() => {
    // After a short delay, set initialRender to false to allow lazy components to load
    const timer = setTimeout(() => {
      setInitialRender(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Function to clean up resources when component unmounts or when switching rooms
  const cleanupResources = useCallback(() => {
    if (cleanupDoneRef.current) return;

    console.log("[VOICE ROOM] Cleaning up resources for room:", roomId);

    try {
      // Remove all Supabase channels
      supabase.removeAllChannels();

      // Clear any room-specific localStorage items
      if (typeof window !== "undefined") {
        // Clear room-specific items from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.includes(roomId) ||
              key.includes("room-") ||
              key.includes("trading-"))
          ) {
            keysToRemove.push(key);
          }
        }

        // Remove the collected keys
        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });

        // Clear all toast notifications
        clearAllToasts();
      }

      // Reset Supabase client
      resetSupabaseClient();

      // Clear data cache
      clearCache();

      cleanupDoneRef.current = true;
      console.log("[VOICE ROOM] Resources cleaned up successfully");
    } catch (error) {
      console.error("[VOICE ROOM] Error cleaning up resources:", error);
    }
  }, [roomId]);

  // Initialize room on first load
  useEffect(() => {
    if (roomInitializedRef.current) return;

    console.log("[VOICE ROOM] Initializing room:", roomId);

    // Reset cleanup flag
    cleanupDoneRef.current = false;

    // Force reset Supabase client to ensure clean state
    forceResetSupabaseClient().then(() => {
      console.log("[VOICE ROOM] Supabase client reset for new room");
    });

    // Mark room as initialized
    roomInitializedRef.current = true;

    // Clean up when component unmounts
    return () => {
      cleanupResources();
    };
  }, [roomId, cleanupResources]);

  // Add timeout for loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading || authLoading) {
        console.error("[VOICE ROOM] Loading timeout reached");
        setLoadTimeout(true);
      }
    }, 20000); // 20 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, authLoading]);

  // Function to retry authentication
  const retryAuth = useCallback(async () => {
    try {
      setRetryCount((prev) => prev + 1);
      setLoadTimeout(false);
      setLoadError(null);
      setAuthLoading(true);

      console.log(
        `[VOICE ROOM] Retrying authentication (attempt ${retryCount + 1})`
      );

      // Force reset Supabase connections
      await forceResetSupabaseClient();

      // Force refresh the auth session
      await supabase.auth.refreshSession();

      // Reconnect to Supabase
      supabase.channel("system:reconnect").subscribe();

      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        throw new Error("No session found after refresh");
      }

      // Fetch user data with caching
      const userData = await fetchWithCache(
        `user:${session.user.id}`,
        async () => {
          const { data, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;
          return data;
        },
        30000 // 30 second TTL for user data
      );

      console.log("[VOICE ROOM] Auth retry successful, user:", userData.id);
      setUser(userData);
      setAuthLoading(false);
      dataLoadedRef.current.auth = true;

      // Reload the page if we're on the third retry
      if (retryCount >= 2) {
        window.location.reload();
      }
    } catch (error) {
      console.error("[VOICE ROOM] Auth retry failed:", error);
      setAuthLoading(false);
      setLoadError(
        `Authentication failed. Please try refreshing the page. (Error: ${error instanceof Error ? error.message : "Unknown error"})`
      );
    }
  }, [retryCount]);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        console.log("[VOICE ROOM] Checking authentication status...");

        // Force refresh the auth session
        await supabase.auth.refreshSession();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[VOICE ROOM] Session error:", sessionError);
          setLoadError("Authentication error. Please try refreshing the page.");
          return;
        }

        if (session) {
          console.log("[VOICE ROOM] Session found, fetching user data...");

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

          console.log(
            "[VOICE ROOM] User data fetched successfully:",
            userData.id
          );
          setUser(userData);
          dataLoadedRef.current.auth = true;

          // If we're in a voice room and this user is the owner, ensure they're added as a participant
          if (roomData && userData.id === roomData.owner_id) {
            console.log(
              "[VOICE ROOM] User is room owner, ensuring they're in participants list"
            );

            // Check if user is already in participants
            const { data: roomCheck, error: roomError } = await supabase
              .from("trading_rooms")
              .select("participants")
              .eq("id", roomId)
              .single();

            if (roomError) {
              console.error(
                "[VOICE ROOM] Error checking room participants:",
                roomError
              );
            } else if (roomCheck && Array.isArray(roomCheck.participants)) {
              if (!roomCheck.participants.includes(userData.id)) {
                console.log("[VOICE ROOM] Adding owner to participants list");

                // Add user to participants if not already there
                const updatedParticipants = [
                  ...roomCheck.participants,
                  userData.id,
                ];
                await supabase
                  .from("trading_rooms")
                  .update({ participants: updatedParticipants })
                  .eq("id", roomId);
              }
            }
          }
        } else {
          console.log("[VOICE ROOM] No session found");
          setLoadError("You must be logged in to access this room.");
        }
      } catch (error) {
        console.error("[VOICE ROOM] Error checking auth:", error);
        setLoadError("Authentication error. Please try refreshing the page.");
      } finally {
        setAuthLoading(false);
        authCheckedRef.current = true;
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[VOICE ROOM] Auth state changed:", event);

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

          if (userData) {
            console.log("[VOICE ROOM] User data updated after auth change");
            setUser(userData);
            dataLoadedRef.current.auth = true;
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [roomId, roomData]);

  const currentUserId = user?.id;

  // Add cleanup code to the useEffect that sets up subscriptions
  const { connectionStatus, isConnected, isConnecting } =
    usePersistentConnection("voice-room", roomId);

  useEffect(() => {
    // Set up real-time subscription for room updates
    const roomSubscription = supabase
      .channel(`voice-room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("[VOICE ROOM] Received room update:", payload);
          // No need to manually call fetchParticipants as the hook will handle this
          // when roomDetails is updated
        }
      )
      .subscribe((status) => {
        console.log(
          `[VOICE ROOM] Subscription status for voice-room:${roomId}:`,
          status
        );

        // If subscription fails, increment connection attempts
        if (status === "SUBSCRIBED") {
          connectionAttemptsRef.current = 0;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          connectionAttemptsRef.current += 1;

          // If we've tried too many times, show an error
          if (connectionAttemptsRef.current >= maxConnectionAttempts) {
            console.error(
              `[VOICE ROOM] Failed to connect after ${maxConnectionAttempts} attempts`
            );
            setLoadError(
              "Failed to establish a real-time connection. Please refresh the page."
            );
          } else {
            // Try to reconnect
            console.log(
              `[VOICE ROOM] Reconnecting (attempt ${connectionAttemptsRef.current})...`
            );
            supabase.removeChannel(roomSubscription);

            // Small delay before reconnecting
            setTimeout(() => {
              supabase
                .channel(
                  `voice-room:${roomId}-retry-${connectionAttemptsRef.current}`
                )
                .on(
                  "postgres_changes",
                  {
                    event: "UPDATE",
                    schema: "public",
                    table: "trading_rooms",
                    filter: `id=eq.${roomId}`,
                  },
                  async (payload) => {
                    console.log(
                      "[VOICE ROOM] Received room update (retry):",
                      payload
                    );
                  }
                )
                .subscribe();
            }, 1000);
          }
        }
      });

    // Add window unload event listener for better cleanup
    const handleUnload = () => {
      console.log("[VOICE ROOM] Window unloading, cleaning up subscriptions");
      cleanupResources();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      console.log("[VOICE ROOM] Cleaning up room subscriptions");
      window.removeEventListener("beforeunload", handleUnload);
      supabase.removeChannel(roomSubscription);
    };
  }, [
    roomId,
    router,
    roomData,
    fetchParticipants,
    currentUserId,
    cleanupResources,
  ]);

  // Check if warning should be shown
  useEffect(() => {
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
      checkWarningDismissed();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle warning confirmation
  const handleWarningConfirm = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Handle room closure
  const handleCloseRoom = useCallback(async () => {
    try {
      if (!roomDetails) {
        toast.error("Room details not available");
        return;
      }

      // Call the server action to delete the room
      const result = await deleteRoom(roomDetails.id);

      if (result.success) {
        // Clean up resources before closing
        cleanupResources();

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
  }, [roomDetails, router, cleanupResources]);

  // Handle symbol change
  const handleSymbolChange = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
    },
    [setSelectedSymbol]
  );

  // Handle close room click
  const handleCloseRoomClick = useCallback(() => {
    setShowCloseRoomDialog(true);
  }, []);

  // Handle cancel close room
  const handleCancelCloseRoom = useCallback(() => {
    setShowCloseRoomDialog(false);
  }, []);

  // Show error UI if timeout or error occurred
  if (loadTimeout) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-white mb-4">Loading timeout reached</p>
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
            className="bg-[#E74C3C] hover:bg-[#E74C3C]/90"
          >
            Refresh Page
          </Button>
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-white mb-4">Error Loading Room</p>
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
            className="bg-[#E74C3C] hover:bg-[#E74C3C]/90"
          >
            Refresh Page
          </Button>
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return <RoomSkeleton isVoiceRoom={true} />;
  }

  if (!roomDetails) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-white mb-4">Room not found</p>
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
    "[VOICE ROOM] User ID:",
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
            />

            {/* Auto-join component to ensure user is added to participants */}
            {user && roomDetails && (
              <AutoJoinRoom roomId={roomDetails.id} userId={user.id} />
            )}

            {/* ADD THIS BLOCK - Warning message for non-hosts */}
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

            {/* Voice Channel - Moved here from room-header.tsx */}
            {roomDetails.room_category === "voice" && (
              <div className="bg-[#212631] rounded-md p-3 border border-[#3f445c]">
                <VoiceChannel
                  roomId={roomDetails.id}
                  isOwner={isHost}
                  ownerId={roomDetails.owner_id}
                />
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
