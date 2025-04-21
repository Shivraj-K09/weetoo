"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { getRoomInitial } from "@/utils/format-utils";
import { VoiceChannel } from "../voice-room/voice-room-channel";
import { VirtualCurrencyDisplay } from "@/components/room/virtual-currency-display";
import { DonationButton } from "@/components/room/donation-button";
import { DonationNotification } from "./donate-notifications";

interface RoomHeaderProps {
  roomDetails: any;
  ownerName: string;
  participants: any[];
  user: any;
  onCloseRoomClick: () => void;
}

export function RoomHeader({
  roomDetails,
  ownerName,
  participants,
  user,
  onCloseRoomClick,
}: RoomHeaderProps) {
  const isOwner = user && user.id === roomDetails.owner_id;
  const isVoiceRoom = roomDetails.room_category === "voice";

  return (
    <>
      {/* Donation notification - visible to everyone */}
      <DonationNotification roomId={roomDetails.id} />

      <div className="w-full bg-[#1a1e27] border border-[#3f445c] rounded-md">
        <div className="flex items-center p-3">
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
            <div className="flex items-center">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2"
                onClick={onCloseRoomClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x-circle"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
                Close Room
              </Button>
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
