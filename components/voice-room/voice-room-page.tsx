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

// Add error boundary and fallback UI
export default function VoiceRoomPage({ roomData }: { roomData: any }) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;
  const authCheckedRef = useRef(false);

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);

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
        console.error("Loading timeout reached");
        setLoadTimeout(true);
      }
    }, 20000); // 20 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isLoading, authLoading]);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        console.log("[AUTH] Checking authentication status...");

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
            setLoadError(
              "Failed to load user data. Please try refreshing the page."
            );
            return;
          }

          console.log("[AUTH] User data fetched successfully:", userData.id);
          setUser(userData);

          // If we're in a voice room and this user is the owner, ensure they're added as a participant
          if (roomData && userData.id === roomData.owner_id) {
            console.log(
              "[AUTH] User is room owner, ensuring they're in participants list"
            );

            // Check if user is already in participants
            const { data: roomCheck } = await supabase
              .from("trading_rooms")
              .select("participants")
              .eq("id", roomId)
              .single();

            if (roomCheck && Array.isArray(roomCheck.participants)) {
              if (!roomCheck.participants.includes(userData.id)) {
                console.log("[AUTH] Adding owner to participants list");

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
          console.log("[AUTH] No session found");
          setLoadError("You must be logged in to access this room.");
        }
      } catch (error) {
        console.error("[AUTH] Error checking auth:", error);
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
          // Refresh the room details and participants
          fetchParticipants();
        }
      )
      .subscribe();

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
      <div className="h-full flex flex-col items-center justify-center bg-[#212631]">
        <p className="text-white mb-4">Loading timeout reached</p>
        <p className="text-white/70 mb-6 max-w-md text-center">
          The room is taking too long to load. This might be due to connection
          issues or server problems.
        </p>
        <div className="flex gap-4">
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
