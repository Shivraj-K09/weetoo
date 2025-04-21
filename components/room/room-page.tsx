"use client";

import { useState, useEffect, useCallback, memo } from "react";
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
import { DebugPanel } from "@/components/room/debug-panel";
import { DebugInfo } from "@/components/room/debug-info";
import { ParticipantDebug } from "@/components/room/participant-debug";
import { TradingChart } from "@/components/room/trading-chart";
import { DonationNotification } from "./donate-notifications";
import { RoomRevalidator } from "./room-revalidator";

// Add this style to prevent page scrolling when chat is active
const preventScrollStyle = `
  .chat-active {
    overflow: hidden !important;
  }
`;

// Memoized right side panel component to prevent re-renders
const RightSidePanel = memo(function RightSidePanel({
  roomId,
  roomDetails,
  participants,
  user,
}: {
  roomId: string;
  roomDetails: any;
  participants: any[];
  user: any;
}) {
  return (
    <div className="w-[19rem] rounded-md text-white flex flex-col gap-1.5">
      {/* Participants Panel */}
      <ParticipantsPanel
        roomDetails={roomDetails}
        participants={participants}
      />

      {/* Chat Panel - Pass ownerId */}
      <ChatPanel roomId={roomId} user={user} ownerId={roomDetails?.owner_id} />
    </div>
  );
});

export default function TradingRoomPage({ roomData }: { roomData: any }) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showParticipantDebug, setShowParticipantDebug] = useState(false);

  // Extract room ID from the URL - properly handle UUID format
  // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
  const roomId =
    roomData?.id || (roomNameParam ? roomNameParam.substring(0, 36) : "");

  // State for the user
  const [user, setUser] = useState<any>(null);

  // Use custom hooks
  const {
    roomDetails,
    isLoading,
    participants,
    ownerName,
    selectedSymbol,
    setSelectedSymbol,
    setRoomDetails,
  } = useRoomDetails(roomData, roomId);

  const { priceData, priceDataLoaded, fundingData, handlePriceUpdate } =
    usePriceData(selectedSymbol);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Fetch user data
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            return;
          }

          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  // Listen for donation events to update user's KOR_COINS
  useEffect(() => {
    if (!user || !roomId) return;

    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on("broadcast", { event: "donation" }, async (payload) => {
        // If current user is the host, update their KOR_COINS
        if (user.id === roomDetails?.owner_id) {
          // Refresh user data to get updated KOR_COINS
          const { data, error } = await supabase
            .from("users")
            .select("kor_coins")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            setUser((prev: any) => ({
              ...prev,
              kor_coins: data.kor_coins,
            }));
          }
        }

        // If current user is the donor, update their KOR_COINS
        if (payload.payload.donorId === user.id) {
          // Refresh user data to get updated KOR_COINS
          const { data, error } = await supabase
            .from("users")
            .select("kor_coins")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            setUser((prev: any) => ({
              ...prev,
              kor_coins: data.kor_coins,
            }));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId, roomDetails]);

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

  // Enable debug panel with keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setShowDebugInfo((prev) => !prev);
      } else if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setShowParticipantDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent page scrolling when chat messages are added
  useEffect(() => {
    // This prevents the page from scrolling when the component mounts
    if (typeof window !== "undefined") {
      const savedScrollPosition = window.scrollY;

      // Restore the scroll position after a short delay
      const timer = setTimeout(() => {
        window.scrollTo(0, savedScrollPosition);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Handle warning confirmation - use useCallback to prevent recreation on each render
  const handleWarningConfirm = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Handle room closure - use useCallback to prevent recreation on each render
  const handleCloseRoom = useCallback(async () => {
    try {
      // Add null check for roomDetails
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
        // (some browsers block window.close() for windows not opened by script)
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

  // Handle symbol change - use useCallback to prevent recreation on each render
  const handleSymbolChange = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
    },
    [setSelectedSymbol]
  );

  // Handle close room click - use useCallback to prevent recreation on each render
  const handleCloseRoomClick = useCallback(() => {
    setShowCloseRoomDialog(true);
  }, []);

  // Handle cancel close room - use useCallback to prevent recreation on each render
  const handleCancelCloseRoom = useCallback(() => {
    setShowCloseRoomDialog(false);
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E74C3C]"></div>
      </div>
    );
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

  return (
    <div className="flex flex-col h-screen bg-[#0D1117]">
      {/* Add this line */}
      <RoomRevalidator roomId={roomData.id} />
      <div className="h-full overflow-y-auto no-scrollbar">
        {/* Warning Dialog */}
        <WarningDialog isOpen={showWarning} onConfirm={handleWarningConfirm} />

        {/* Close Room Dialog */}
        <CloseRoomDialog
          isOpen={showCloseRoomDialog}
          onConfirm={handleCloseRoom}
          onCancel={handleCancelCloseRoom}
        />

        {/* Debug Panel (hidden by default, toggle with Ctrl+Shift+D) */}
        <DebugPanel roomId={roomDetails.id} isVisible={showDebugPanel} />

        {/* Participant Debug (hidden by default, toggle with Ctrl+Shift+P) */}
        <ParticipantDebug
          roomId={roomDetails.id}
          userId={user?.id || null}
          isVisible={showParticipantDebug}
        />

        {/* Global donation notification container - ensure this is here */}
        <DonationNotification roomId={roomDetails.id} />

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

              {/* Price Info Bar */}
              <div className="bg-[#212631] rounded-md w-full">
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
              </div>

              <div className="flex gap-1.5 w-full">
                {/* Trading Chart - Using the new memoized component */}
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

              <div className="bg-[#212631] w-full h-[12rem] border border-[#3f445c]"></div>
            </div>
          </div>

          {/* Right Side Panel - Using the memoized component */}
          <RightSidePanel
            roomId={roomDetails.id}
            roomDetails={roomDetails}
            participants={participants}
            user={user}
          />

          <DebugInfo roomId={roomDetails.id} isVisible={showDebugInfo} />
        </div>

        {/* Global donation notification container */}
        <DonationNotification roomId={roomDetails.id} />
      </div>
    </div>
  );
}
