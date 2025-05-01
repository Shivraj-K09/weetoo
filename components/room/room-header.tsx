"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { getRoomInitial } from "@/utils/format-utils";
import { VoiceChannel } from "@/components/voice-room/voice-room-channel";
import { VirtualCurrencyDisplay } from "@/components/room/virtual-currency-display";
import { DonationButton } from "@/components/room/donation-button";
import { DonationNotification } from "@/components/room/donate-notifications";

interface RoomHeaderProps {
  roomDetails: any;
  ownerName: string;
  participants: any[];
  user: any;
  onCloseRoomClick: () => void;
  onRefreshRoom?: () => void;
  connectionStatus?: "connected" | "connecting" | "disconnected";
}

export function RoomHeader({
  roomDetails,
  ownerName,
  participants,
  user,
  onCloseRoomClick,
  onRefreshRoom,
  connectionStatus,
}: RoomHeaderProps) {
  const isOwner = user && user.id === roomDetails.owner_id;
  const isVoiceRoom = roomDetails.room_category === "voice";

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
              <h2 className="text-lg font-bold">{roomDetails.room_name}</h2>
              <p className="text-sm text-gray-400">{ownerName}</p>
              <div className="flex items-center mt-1 text-xs">
                <span className="text-yellow-500 mr-2">
                  {roomDetails.current_participants}/
                  {roomDetails.max_participants}
                </span>
                <span className="flex items-center text-yellow-500 mr-1">
                  <span className="mr-1">•</span> {participants.length}
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

          {/* Today Records */}
          <div className="ml-10 border-l border-[#3f445c] pl-6">
            <div className="text-sm font-medium text-gray-400 mb-1">
              Today Records
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-blue-500 font-bold mr-2">BUY</span>
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" /> 20%
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 font-bold mr-2">SELL</span>
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" /> 150%
                </span>
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
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" /> 17,102%
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 font-bold mr-2">SELL</span>
                <span className="text-green-500 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" /> 34,141%
                </span>
              </div>
            </div>
          </div>
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

          {/* Virtual Currency Display (only for owner) */}
          <div className="ml-auto mr-4">
            <VirtualCurrencyDisplay
              roomId={roomDetails.id}
              isOwner={isOwner}
              currentPrice={roomDetails.current_price || 0}
            />
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

        {/* Voice Channel (only shown for voice rooms) */}
        {isVoiceRoom && roomDetails && (
          <div className="px-3 pb-3">
            <VoiceChannel
              roomId={roomDetails.id}
              isOwner={isOwner}
              ownerId={roomDetails.owner_id}
            />
          </div>
        )}
      </div>
    </>
  );
}
