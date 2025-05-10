"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getRoomInitial } from "@/utils/format-utils";
import { VirtualCurrencyDisplay } from "@/components/room/virtual-currency-display";
import { DonationButton } from "@/components/room/donation-button";
import { DonationNotification } from "@/components/room/donate-notifications";
import { ProfitRateDisplay } from "@/components/room/profit-rate-display";
import { Badge } from "@/components/ui/badge";
import { HostActivityIndicator } from "./host-activity-indicator";
import { useTradingRecords } from "@/hooks/use-trading-records";
import { memo, useMemo } from "react";

interface RoomHeaderProps {
  roomDetails: any;
  ownerName: string;
  participants: any[];
  user: any;
  onCloseRoomClick: () => void;
  onRefreshRoom?: () => void;
  connectionStatus?: "connected" | "connecting" | "disconnected";
  initialTradingRecords?: any;
}

// Create a memoized component for the trading records display
const TradingRecordsDisplay = memo(({ daily, total, isLoading }: any) => {
  return (
    <>
      {/* Today Records */}
      <div className="ml-10 border-l border-[#3f445c] pl-6">
        <div className="text-sm font-medium text-gray-400 mb-1">
          Today Records
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-blue-500 font-bold mr-2">BUY</span>
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span
                className={`${daily.buy.percentage >= 0 ? "text-green-500" : "text-red-500"} flex items-center`}
              >
                {daily.buy.percentage >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(daily.buy.percentage).toFixed(2)}%
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-red-500 font-bold mr-2">SELL</span>
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span
                className={`${daily.sell.percentage >= 0 ? "text-green-500" : "text-red-500"} flex items-center`}
              >
                {daily.sell.percentage >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(daily.sell.percentage).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Total Records */}
      <div className="ml-10 border-l border-[#3f445c] pl-6">
        <div className="text-sm font-medium text-gray-400 mb-1">
          Total Records
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-blue-500 font-bold mr-2">BUY</span>
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span
                className={`${total.buy.percentage >= 0 ? "text-green-500" : "text-red-500"} flex items-center`}
              >
                {total.buy.percentage >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(total.buy.percentage).toFixed(2)}%
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-red-500 font-bold mr-2">SELL</span>
            {isLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span
                className={`${total.sell.percentage >= 0 ? "text-green-500" : "text-red-500"} flex items-center`}
              >
                {total.sell.percentage >= 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(total.sell.percentage).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

TradingRecordsDisplay.displayName = "TradingRecordsDisplay";

export function RoomHeader({
  roomDetails,
  ownerName,
  participants,
  user,
  onCloseRoomClick,
  onRefreshRoom,
  connectionStatus,
  initialTradingRecords,
}: RoomHeaderProps) {
  const isOwner = user && user.id === roomDetails.owner_id;
  const isVoiceRoom = roomDetails.room_category === "voice";

  // Use initial trading records if available
  const initialData = useMemo(() => {
    if (!initialTradingRecords) return undefined;

    return {
      daily: {
        buy: {
          percentage: initialTradingRecords.daily_buy_percentage || 0,
          pnl: initialTradingRecords.daily_buy_pnl || 0,
        },
        sell: {
          percentage: initialTradingRecords.daily_sell_percentage || 0,
          pnl: initialTradingRecords.daily_sell_pnl || 0,
        },
      },
      total: {
        buy: {
          percentage: initialTradingRecords.total_buy_percentage || 0,
          pnl: initialTradingRecords.total_buy_pnl || 0,
        },
        sell: {
          percentage: initialTradingRecords.total_sell_percentage || 0,
          pnl: initialTradingRecords.total_sell_pnl || 0,
        },
      },
    };
  }, [initialTradingRecords]);

  // Fetch trading records for this room with initial data
  const { daily, total, isLoading, error } = useTradingRecords(roomDetails.id);

  // Memoize participant count to prevent unnecessary re-renders
  const participantCount = useMemo(() => participants.length, [participants]);

  return (
    <>
      {/* Donation notification - visible to everyone */}
      <DonationNotification roomId={roomDetails.id} />

      <div className="bg-[#212631] rounded-md p-3 flex justify-between items-center border border-[#3f445c]">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Avatar and Room Info */}
          <div className="flex items-center">
            <Avatar className="h-16 w-16 bg-green-700 border-2 border-green-500">
              <AvatarFallback className="bg-green-700 text-white text-2xl">
                {getRoomInitial(roomDetails.room_name)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{roomDetails.room_name}</h2>
                <HostActivityIndicator
                  roomId={roomDetails.id}
                  ownerId={roomDetails.owner_id}
                />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">{ownerName}</p>
                <Badge
                  variant="outline"
                  className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] py-0 px-1.5"
                >
                  호스트
                </Badge>
              </div>
              <div className="flex items-center mt-1 text-xs">
                <span className="text-yellow-500 mr-2">
                  {roomDetails.current_participants}/
                  {roomDetails.max_participants}
                </span>
                <span className="flex items-center text-yellow-500 mr-1">
                  <span className="mr-1">•</span> {participantCount}
                </span>
                <span className="flex items-center text-yellow-500">
                  <span className="mr-1">•</span> 13
                </span>
              </div>
            </div>
          </div>

          {/* Trading Assets */}
          <div className="ml-10 border-l border-[#3f445c] pl-6">
            <div className="text-sm font-medium text-gray-400 mb-1">
              Trading Asset
            </div>
            <div className="flex flex-col">
              {roomDetails.trading_pairs.map((pair: string, index: number) => (
                <div key={index} className="font-bold">
                  {pair}
                </div>
              ))}
            </div>
          </div>

          {/* Trading Records Display */}
          <TradingRecordsDisplay
            daily={daily}
            total={total}
            isLoading={isLoading}
          />
        </div>

        {/* Right side - Add refresh button here */}
        <div className="flex items-center gap-2">
          {onRefreshRoom && (
            <Button
              onClick={onRefreshRoom}
              className="bg-[#3498DB] hover:bg-[#3498DB]/90 text-white h-8 px-3"
              size="sm"
            >
              Refresh
            </Button>
          )}

          {/* Profit Rate Display (for all users) */}
          {user && (
            <div className="mr-4">
              <ProfitRateDisplay />
            </div>
          )}

          {/* Virtual Currency Display (only for owner) */}
          <div className="ml-auto mr-4">
            <VirtualCurrencyDisplay roomId={roomDetails.id} isOwner={isOwner} />
          </div>

          {/* Donation Button (only for participants) */}
          {user && !isOwner && (
            <div className="mr-4">
              <DonationButton
                roomId={roomDetails.id}
                hostId={roomDetails.owner_id}
                hostName={ownerName}
                userId={user.id}
              />
            </div>
          )}

          {/* Close Room Button (for owners) */}
          {isOwner && (
            <Button
              onClick={onCloseRoomClick}
              className="bg-[#E74C3C] hover:bg-[#E74C3C]/90 text-white h-8 px-3"
              size="sm"
            >
              Close Room
            </Button>
          )}
          {connectionStatus && (
            <div className="flex items-center ml-2">
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-400">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Export a memoized version to prevent unnecessary re-renders
export default memo(RoomHeader);
