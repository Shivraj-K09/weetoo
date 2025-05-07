"use client";

import { Avatar } from "@/components/ui/avatar";
import { GlobeIcon, LockIcon, MessageSquareIcon, MicIcon } from "lucide-react";
import type { Room } from "@/types/index";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

interface RoomItemProps {
  room: Room;
  index: number;
  onClick: () => void;
}

export function RoomItem({ room, index, onClick }: RoomItemProps) {
  // Format time difference
  const formatTimeDiff = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div
      className="flex items-center border-b border-gray-200 py-3 px-2 bg-white hover:bg-amber-50 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Rank */}
      <div className="flex flex-col items-center mr-3 w-8">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 font-medium">
          {index + 1}
        </div>
        <div className="text-xs text-gray-500 mt-1">Rank</div>
      </div>

      {/* Thumbnail */}
      <div className="relative w-14 h-14 mr-3 shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
        <span className="text-2xl">{room.symbol.substring(0, 1)}</span>
      </div>

      {/* Time and Status */}
      <div className="flex flex-col mr-3 min-w-[60px]">
        <div className="flex gap-2">
          <div className="px-2 py-0.5 bg-red-500 text-red-800 rounded-sm text-xs font-medium">
            {room.symbol}
          </div>
          {/* Display room category */}
          <div
            className={`px-2 py-0.5 ${
              room.roomCategory === "voice"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            } rounded-sm text-xs font-medium flex items-center`}
          >
            {room.roomCategory === "voice" ? (
              <>
                <MicIcon className="h-3 w-3 mr-1" />
                Voice
              </>
            ) : (
              <>
                <MessageSquareIcon className="h-3 w-3 mr-1" />
                Regular
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {formatTimeDiff(room.createdAt)}
        </div>
      </div>

      {/* Title and Privacy */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 truncate">{room.title}</div>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          {room.privacy === "private" ? (
            <>
              <LockIcon className="h-4 w-4 mr-1" />
              <span className="font-medium">비공개방</span>
            </>
          ) : (
            <>
              <GlobeIcon className="h-4 w-4 mr-1" />
              <span className="font-medium">공개방</span>
            </>
          )}
        </div>
      </div>

      {/* Avatar and Username */}
      <div className="flex items-center ml-auto">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <div className="bg-gray-200 w-full h-full flex items-center justify-center text-xs font-medium">
              {room.username.substring(0, 2).toUpperCase()}
            </div>
          </Avatar>
          <div className="ml-1 text-sm text-gray-700">{room.username}</div>
        </div>
        {/* <Button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the main onClick from firing

            // First, clean up any existing connections
            supabase.removeAllChannels();

            // Force refresh the auth session
            supabase.auth
              .refreshSession()
              .then(() =>
                console.log(
                  "[ROOM ITEM] Auth session refreshed for direct access"
                )
              )
              .catch((err) =>
                console.error("[ROOM ITEM] Error refreshing auth session:", err)
              );

            // Generate room slug
            const roomSlug = `${room.id}-${room.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]+/g, "")}`;

            // Add a cache-busting timestamp
            const timestamp = Date.now();

            // Determine the URL based on room category
            const roomUrl =
              room.roomCategory === "voice"
                ? `${window.location.origin}/voice-room/${roomSlug}?t=${timestamp}`
                : `${window.location.origin}/rooms/${roomSlug}?t=${timestamp}`;

            // Open in a new tab
            window.open(roomUrl, "_blank");
          }}
          size="sm"
          variant="outline"
          className="ml-2 text-xs bg-transparent border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white"
        >
          Direct Access
        </Button> */}
      </div>
    </div>
  );
}
