"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TradingMarketPlace } from "@/components/room/trading-market-place";
import { TradingTabs } from "@/components/room/trading-tabs";
import { PriceInfoBar } from "@/components/room/price-info-bar";
import { WarningDialog } from "../room/warning-dialog";
import { CloseRoomDialog } from "../room/close-room-dialog";
import { deleteRoom } from "@/app/actions/delete-room";
import { formatLargeNumber, extractCurrencies } from "@/utils/format-utils";
import { useRoomDetails } from "@/hooks/use-room-details";
import { usePriceData } from "@/hooks/use-price-data";
import { RoomHeader } from "@/components/room/room-header";
import { ParticipantsPanel } from "@/components/room/participants-panel";
import { ChatPanel } from "@/components/room/chat-panel";
import { TradingChart } from "@/components/room/trading-chart";
import { TradingTabsBottom } from "@/components/room/trading-tabs-bottom";
import { RoomSkeleton } from "../room/room-skeleton";
import { usePersistentConnection } from "@/hooks/use-persistent-connection";

// Add error boundary and fallback UI
export default function VoiceRoomPage({ roomData }: { roomData: any }) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;
  const authCheckedRef = useRef(false);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
      supabase.removeAllChannels();

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

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, avatar_url, kor_coins")
        .eq("id", session.user.id)
        .single();

      if (userError) {
        throw new Error(`User data error: ${userError.message}`);
      }

      console.log("[VOICE ROOM] Auth retry successful, user:", userData.id);
      setUser(userData);
      setAuthLoading(false);

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

          // Fetch user data
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("[VOICE ROOM] Error fetching user data:", error);
            setLoadError(
              "Failed to load user data. Please try refreshing the page."
            );
            return;
          }

          console.log(
            "[VOICE ROOM] User data fetched successfully:",
            userData.id
          );
          setUser(userData);

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
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (!error && userData) {
            console.log("[VOICE ROOM] User data updated after auth change");
            setUser(userData);
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
      supabase.removeChannel(roomSubscription);
      // Remove any other active channels
      supabase.removeAllChannels();
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      console.log("[VOICE ROOM] Cleaning up room subscriptions");
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
            {/* Room Header - This includes the voice channel for voice rooms */}
            <RoomHeader
              roomDetails={roomDetails}
              ownerName={ownerName}
              participants={participants}
              user={user}
              onCloseRoomClick={handleCloseRoomClick}
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
