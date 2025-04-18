"use client";
import { useState, useEffect } from "react";
import { Users, Radio } from "lucide-react";
import LiveBadge from "./live-badge";

interface VoiceRoomHeaderProps {
  roomName: string;
  isHost: boolean;
  isPrivate: boolean;
  participantCount: number; // Changed from listenersCount to participantCount
  isBroadcasting?: boolean;
}

export default function VoiceRoomHeader({
  roomName,
  isHost,
  isPrivate,
  participantCount, // Changed from listenersCount to participantCount
  isBroadcasting = false,
}: VoiceRoomHeaderProps) {
  // Use local state to track broadcasting status
  const [isLive, setIsLive] = useState(isBroadcasting);

  // Update local state when prop changes
  useEffect(() => {
    setIsLive(isBroadcasting);
  }, [isBroadcasting]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Radio className="h-5 w-5 mr-2 text-blue-500" />
        <h2 className="text-xl font-semibold">{roomName}</h2>
      </div>
      <div className="flex items-center space-x-2">
        <span
          className={`px-2 py-1 text-xs rounded-full ${isHost ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
        >
          {isHost ? "Host" : "Participant"}
        </span>

        {/* Real-time participant count display */}
        {/* <div className="flex items-center px-3 py-1.5 bg-blue-900 rounded-full text-white text-sm">
          <Users className="h-4 w-4 mr-1.5" />
          <span>
            {participantCount}{" "}
            {participantCount === 1 ? "Participant" : "Participants"}
          </span>
        </div> */}

        <span
          className={`px-2 py-1 text-xs rounded-full ${isPrivate ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
        >
          {isPrivate ? "Private" : "Public"}
        </span>
        {isLive && <LiveBadge isLive={isLive} />}
      </div>
    </div>
  );
}
