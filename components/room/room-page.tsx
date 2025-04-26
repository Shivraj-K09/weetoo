"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TradingMarketPlace } from "@/components/room/trading-market-place";
import { TradingTabs } from "@/components/room/trading-tabs";
import { PriceInfoBar } from "@/components/room/price-info-bar";
import { WarningDialog } from "./warning-dialog";
import { CloseRoomDialog } from "./close-room-dialog";
import { deleteRoom } from "@/app/actions/delete-room";
import { formatLargeNumber, extractCurrencies } from "@/utils/format-utils";
import { useRoomDetails } from "@/hooks/use-room-details";
import { usePriceData } from "@/hooks/use-price-data";
import { RoomHeader } from "@/components/room/room-header";
import { ParticipantsPanel } from "@/components/room/participants-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { TradingChart } from "@/components/room/trading-chart";
import { TradingTabsBottom } from "@/components/room/trading-tabs-bottom";
import { RoomSkeleton } from "@/components/room/room-skeleton";
import { RoomAccessManager } from "./room-access-manager";

// Add error boundary and fallback UI
export default function RoomPage({ roomData }: { roomData: any }) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;
  const authCheckedRef = useRef(false);
  const authRetryCountRef = useRef(0);
  const maxAuthRetries = 3;
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forceRenderRef = useRef(0);

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [forceRender, setForceRender] = useState(0);

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

  // Function to force a component re-render
  const forceComponentUpdate = useCallback(() => {
    forceRenderRef.current += 1;
    setForceRender((prev) => prev + 1);
    console.log(
      "[ROOM PAGE] Forcing component update:",
      forceRenderRef.current
    );
  }, []);

  // Add a function to refresh the room data
  const refreshRoom = useCallback(async () => {
    try {
      toast.loading("Refreshing room data...", { id: "refresh-room" });

      // Reset Supabase connections
      supabase.removeAllChannels();

      // Force refresh the auth session
      await supabase.auth.refreshSession();

      // Refresh participants
      await fetchParticipants();

      // Force a component update
      forceComponentUpdate();

      toast.success("Room data refreshed", { id: "refresh-room" });
    } catch (error) {
      console.error("Error refreshing room:", error);
      toast.error("Failed to refresh room data", { id: "refresh-room" });
    }
  }, [fetchParticipants, forceComponentUpdate]);

  // Function to retry authentication
  const retryAuth = useCallback(async () => {
    console.log("[ROOM PAGE] Retrying authentication...");

    try {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Reset loading states
      setAuthLoading(true);
      setLoadError(null);
      setLoadTimeout(false);

      // Reset Supabase connection
      supabase.removeAllChannels();

      // Force refresh the session
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("[ROOM PAGE] Error refreshing session:", refreshError);
        throw new Error("Failed to refresh authentication session");
      }

      // Get the current session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("[ROOM PAGE] Error getting session:", sessionError);
        throw new Error("Failed to get authentication session");
      }

      if (!sessionData.session) {
        setLoadError("You must be logged in to access this room.");
        setAuthLoading(false);
        return false;
      }

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, avatar_url, kor_coins")
        .eq("id", sessionData.session.user.id)
        .single();

      if (userError) {
        console.error("[ROOM PAGE] Error fetching user data:", userError);
        throw new Error("Failed to load user data");
      }

      console.log("[ROOM PAGE] Authentication successful:", userData.id);
      setUser(userData);
      setAuthLoading(false);

      // Force a component update to ensure everything re-renders
      forceComponentUpdate();

      return true;
    } catch (error) {
      console.error("[ROOM PAGE] Authentication retry failed:", error);
      setLoadError("Authentication failed. Please try refreshing the page.");
      setAuthLoading(false);
      return false;
    }
  }, [forceComponentUpdate]);

  // Add timeout for loading with better error recovery
  useEffect(() => {
    // Clear any existing timeout when component re-renders
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Set a new timeout
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading || authLoading) {
        console.error("[ROOM PAGE] Loading timeout reached after 15 seconds");
        setLoadTimeout(true);

        // Try to recover automatically
        retryAuth().then((success) => {
          if (!success) {
            console.log("[ROOM PAGE] Auto-recovery failed");
          }
        });
      }
    }, 15000); // 15 seconds timeout (reduced from 20)

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, authLoading, retryAuth, forceRender]);

  // Reset Supabase connections when component mounts
  useEffect(() => {
    const resetConnections = async () => {
      console.log("[ROOM PAGE] Resetting Supabase connections");

      // Remove all existing channels
      supabase.removeAllChannels();

      // Force a refresh of the auth session
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("[ROOM PAGE] Error refreshing auth session:", error);
        } else {
          console.log("[ROOM PAGE] Auth session refreshed successfully");
        }
      } catch (error) {
        console.error("[ROOM PAGE] Error refreshing auth session:", error);
      }
    };

    resetConnections();

    return () => {
      // Clean up all channels when component unmounts
      supabase.removeAllChannels();
    };
  }, []);

  // Check if user is logged in with improved error handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        console.log("[AUTH] Checking authentication status...");

        // Force refresh the session first
        const refreshResult = await supabase.auth.refreshSession();
        if (refreshResult.error) {
          console.error(
            "[AUTH] Error refreshing session:",
            refreshResult.error
          );

          // If we've tried too many times, give up
          if (authRetryCountRef.current >= maxAuthRetries) {
            setLoadError(
              "Authentication failed after multiple attempts. Please try refreshing the page."
            );
            setAuthLoading(false);
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

          // Fetch user data
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("[AUTH] Error fetching user data:", error);

            // If we've tried too many times, show error
            if (authRetryCountRef.current >= maxAuthRetries) {
              setLoadError(
                "Failed to load user data. Please try refreshing the page."
              );
              setAuthLoading(false);
            } else {
              // Otherwise, try again
              authRetryCountRef.current++;
              setTimeout(checkAuth, 2000);
            }
            return;
          }

          console.log("[AUTH] User data fetched successfully:", userData.id);
          setUser(userData);
          setAuthLoading(false);
          authRetryCountRef.current = 0; // Reset counter on success
        } else {
          console.log("[AUTH] No session found");

          // If we've tried too many times, show error
          if (authRetryCountRef.current >= maxAuthRetries) {
            setLoadError("You must be logged in to access this room.");
            setAuthLoading(false);
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
          setLoadError("Authentication error. Please try refreshing the page.");
          setAuthLoading(false);
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
        console.log("[AUTH] Auth state changed:", event);

        if (event === "SIGNED_IN" && session) {
          // Fetch user data on sign in
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (!error && userData) {
            console.log("[AUTH] User data updated after auth change");
            setUser(userData);
            setAuthLoading(false);

            // Force component update
            forceComponentUpdate();
          }
        } else if (event === "SIGNED_OUT") {
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

  useEffect(() => {
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
      // Remove any other active channels
      supabase.removeAllChannels();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      console.log("Cleaning up room subscriptions");
      window.removeEventListener("beforeunload", handleUnload);
      supabase.removeChannel(roomSubscription);
    };
  }, [roomId, router, roomData, fetchParticipants, currentUserId]);

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

  if (isLoading || authLoading) {
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

      {/* Room Access Manager */}
      <RoomAccessManager roomId={roomId} />

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

            {/* Price Info Bar */}
            <div className="bg-[#212631] rounded-md w-full">
              <PriceInfoBar
                tradingPairs={roomDetails.trading_pairs}
                selectedSymbol={selectedSymbol || roomDetails.trading_pairs[0]}
                priceData={priceData}
                priceDataLoaded={priceDataLoaded}
                fundingData={fundingData}
                onSymbolChange={handleSymbolChange}
                formatLargeNumber={formatLargeNumber}
                extractCurrencies={extractCurrencies}
              />
            </div>

            <div className="flex gap-1.5 w-full">
              {/* Trading Chart */}
              <TradingChart
                symbol={selectedSymbol || roomDetails.trading_pairs[0]}
              />

              {/* Tabs */}
              <div className="bg-[#212631] p-1 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
                <TradingTabs
                  symbol={selectedSymbol || roomDetails.trading_pairs[0]}
                  onPriceUpdate={handlePriceUpdate}
                />
              </div>

              <TradingMarketPlace />
            </div>

            {/* Increased height to 16rem for the tabs container */}
            <div className="bg-[#212631] w-full h-[22rem] border border-[#3f445c]">
              <TradingTabsBottom
                roomId={roomDetails.id}
                isHost={isHost}
                symbol={selectedSymbol || roomDetails.trading_pairs[0]}
                currentPrice={currentPriceNumber}
              />
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
