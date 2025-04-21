"use client";

import { useState, useEffect, useCallback } from "react";
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

// This component is almost identical to the regular room page, but with voice room specific features
export default function VoiceRoomPage({ roomData }: { roomData: any }) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;

  // Add state for warning dialog
  const [showWarning, setShowWarning] = useState(false);
  const [showCloseRoomDialog, setShowCloseRoomDialog] = useState(false);

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
            .select("id, first_name, last_name, email, avatar_url")
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

            <div className="bg-[#212631] w-full h-[12rem] border border-[#3f445c]"></div>
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
