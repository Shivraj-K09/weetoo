"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RoomItem } from "./room-item";
import { RoomSkeleton } from "./room-skeleton";
import { PasswordModal } from "./password-modal";
import { resetSupabaseClient } from "@/lib/supabase/utils";
import type { Room, UserProfile } from "@/types/index";

interface RoomsListProps {
  rooms: Room[];
  isLoading: boolean;
  user: UserProfile | null;
  onCreateRoom: () => void;
}

export function RoomsList({
  rooms,
  isLoading,
  user,
  onCreateRoom,
}: RoomsListProps) {
  // Number of skeleton items to show (only when fewer than 9 rooms)
  const skeletonCount = Math.max(0, 9 - rooms.length);
  const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => i + 1);

  // State for password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [openingRoom, setOpeningRoom] = useState(false);
  const lastOpenedRoomRef = useRef<string | null>(null);
  const roomOpenTimeRef = useRef<number>(0);

  // Effect to reset Supabase connections when component mounts
  useEffect(() => {
    // Reset all Supabase connections when the rooms list loads
    const resetConnections = async () => {
      console.log("[ROOMS LIST] Resetting Supabase connections");
      supabase.removeAllChannels();

      // Force a refresh of the auth session
      try {
        await supabase.auth.refreshSession();
        console.log("[ROOMS LIST] Auth session refreshed");
      } catch (error) {
        console.error("[ROOMS LIST] Error refreshing auth session:", error);
      }

      // Create a new channel to force reconnection
      supabase.channel("system:reconnect").subscribe((status) => {
        console.log("[ROOMS LIST] Reconnection status:", status);
      });
    };

    resetConnections();

    // Also listen for visibility changes to reset connections when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[ROOMS LIST] Page became visible, resetting connections");
        resetConnections();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Function to clean up before opening a new room
  const prepareForNewRoom = useCallback(async () => {
    console.log("[ROOMS LIST] Preparing to open a new room");

    // Reset Supabase client to clear all existing connections
    resetSupabaseClient();

    // Force refresh the auth session
    try {
      await supabase.auth.refreshSession();
      console.log(
        "[ROOMS LIST] Auth session refreshed before opening new room"
      );
    } catch (error) {
      console.error("[ROOMS LIST] Error refreshing auth session:", error);
    }

    // Clear any existing localStorage data for previous rooms
    localStorage.removeItem("lastOpenedRoom");
    localStorage.removeItem("roomOpenedAt");

    // Clear any cached position data
    localStorage.removeItem("cachedPositions");
    localStorage.removeItem("positionsLastUpdated");

    // Clear any other room-specific cache items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("room-") ||
          key.includes("position-") ||
          key.includes("trade-"))
      ) {
        keysToRemove.push(key);
      }
    }

    // Remove the identified keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Add a pre-connection to Supabase to warm up the connection
    const preconnectChannel = supabase.channel("preconnect");
    preconnectChannel.subscribe((status) => {
      console.log("[ROOMS LIST] Preconnect status:", status);
      if (status === "SUBSCRIBED") {
        // Once subscribed, we can remove this channel
        supabase.removeChannel(preconnectChannel);
      }
    });

    // Small delay to ensure everything is reset
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, []);

  // Update the openRoom function to handle window management better
  const openRoom = useCallback(
    async (room: Room) => {
      try {
        // Check if this is the same room that was recently opened
        const isSameRoom = lastOpenedRoomRef.current === room.id;
        const timeSinceLastOpen = Date.now() - roomOpenTimeRef.current;

        // If trying to open the same room within 5 seconds, show a message
        if (isSameRoom && timeSinceLastOpen < 5000) {
          toast.info("This room is already open or was recently opened");
          setOpeningRoom(false);
          return;
        }

        // Show a toast that we're opening the room
        const openingToastId = `opening-room-${room.id}`;
        toast.loading("Opening room...", { id: openingToastId });

        // Clean up before opening a new room
        await prepareForNewRoom();

        // Update the last opened room reference
        lastOpenedRoomRef.current = room.id;
        roomOpenTimeRef.current = Date.now();

        // Generate room slug
        const roomSlug = `${room.id}-${room.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")}`;

        // Store the room being opened in localStorage to help with state management
        localStorage.setItem("lastOpenedRoom", room.id);

        // Set a timestamp to track when the room was opened
        localStorage.setItem("roomOpenedAt", Date.now().toString());

        // Add a cache-busting timestamp to prevent browser caching
        const timestamp = Date.now();

        // Conditional routing based on room category
        let roomUrl = "";
        if (room.roomCategory === "voice") {
          // For voice rooms, redirect to the voice-room route
          roomUrl = `${window.location.origin}/voice-room/${roomSlug}?t=${timestamp}`;
        } else {
          // For regular rooms, use the existing rooms route
          roomUrl = `${window.location.origin}/rooms/${roomSlug}?t=${timestamp}`;
        }

        // Try to open in a popup first
        let roomWindow = window.open(
          roomUrl,
          `room_${room.id}`,
          `width=${screen.width},height=${screen.height},top=0,left=0`
        );

        // If popup is blocked, try opening in a new tab
        if (!roomWindow) {
          toast.dismiss(openingToastId);
          toast.warning("Popup blocked. Opening in new tab instead.", {
            id: openingToastId,
          });
          roomWindow = window.open(roomUrl, "_blank");

          // If still blocked, show instructions
          if (!roomWindow) {
            toast.dismiss(openingToastId);
            toast.error(
              "Unable to open room. Please allow popups or click the link below.",
              {
                id: openingToastId,
                duration: 5000,
              }
            );

            // Create a clickable link for the user
            const linkToast = toast.message(
              <div>
                <p className="mb-2">Click here to open the room:</p>
                <a
                  href={roomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Open Room
                </a>
              </div>,
              { duration: 10000 }
            );
          }
        } else {
          // Dismiss the toast if window opened successfully
          toast.dismiss(openingToastId);
          toast.success("Room opened successfully", {
            id: openingToastId,
            duration: 2000,
          });

          // Add event listener to detect when the window is closed
          const checkWindowClosed = setInterval(() => {
            if (roomWindow?.closed) {
              clearInterval(checkWindowClosed);
              // Force a refresh of the Supabase connection when window is closed
              resetSupabaseClient();
              // Small delay before reconnecting
              setTimeout(() => {
                // Reconnect to Supabase
                supabase.channel("reconnect").subscribe();
              }, 500);
            }
          }, 1000);
        }

        // Reset the opening state after a delay
        setTimeout(() => {
          setOpeningRoom(false);
        }, 2000);
      } catch (error) {
        console.error("[ROOMS LIST] Error opening room:", error);
        toast.error("Failed to open room. Please try again.");
        setOpeningRoom(false);
      }
    },
    [prepareForNewRoom]
  );

  // Update the handleRoomClick function to handle errors better
  const handleRoomClick = useCallback(
    async (room: Room) => {
      try {
        // Prevent multiple clicks
        if (openingRoom) {
          console.log("[ROOMS LIST] Already opening a room, ignoring click");
          return;
        }

        setOpeningRoom(true);

        // If user is not logged in
        if (!user) {
          toast.error("You must be logged in to join a room");
          setOpeningRoom(false);
          return;
        }

        // Check if a room was recently opened (within the last 2 seconds)
        const lastOpenTime = localStorage.getItem("roomOpenedAt");
        if (lastOpenTime && Date.now() - Number.parseInt(lastOpenTime) < 2000) {
          console.log("[ROOMS LIST] Room opening throttled - please wait");
          setOpeningRoom(false);
          return;
        }

        // Show loading toast - use a unique ID to be able to update it
        const loadingToastId = `accessing-room-${room.id}`;
        toast.loading("Accessing room...", { id: loadingToastId });

        // Set a timeout to detect if room opening is taking too long
        const timeoutId = setTimeout(() => {
          // If we're still in the opening state after 8 seconds, something might be wrong
          if (openingRoom) {
            toast.dismiss(loadingToastId);
            toast.error(
              "Room access is taking longer than expected. Opening in a new tab instead.",
              {
                id: loadingToastId,
              }
            );

            // Force open in a new tab as a fallback
            const roomSlug = `${room.id}-${room.title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]+/g, "")}`;

            const timestamp = Date.now();
            const roomUrl =
              room.roomCategory === "voice"
                ? `${window.location.origin}/voice-room/${roomSlug}?t=${timestamp}`
                : `${window.location.origin}/rooms/${roomSlug}?t=${timestamp}`;

            window.open(roomUrl, "_blank");
            setOpeningRoom(false);
          }
        }, 8000); // 8 second timeout

        // Force refresh the auth session before checking room access
        await supabase.auth.refreshSession();

        // If room is private, check if user is the owner or already a participant
        if (room.privacy === "private") {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("owner_id, participants")
            .eq("id", room.id)
            .single();

          if (error) {
            console.error("[ROOMS LIST] Error checking room access:", error);
            clearTimeout(timeoutId);
            toast.dismiss(loadingToastId);
            toast.error("Failed to access room", { id: loadingToastId });
            setOpeningRoom(false);
            return;
          }

          const isOwner = data.owner_id === user.id;
          const isParticipant = data.participants.includes(user.id);

          // Dismiss loading toast
          clearTimeout(timeoutId);
          toast.dismiss(loadingToastId);

          if (!isOwner && !isParticipant) {
            // Show password modal for private rooms
            setSelectedRoom(room);
            setPasswordModalOpen(true);
            setOpeningRoom(false);
            return;
          }

          // User is already a participant or owner, open the room
          openRoom(room);
        } else {
          // Public room, dismiss loading toast and open the room
          clearTimeout(timeoutId);
          toast.dismiss(loadingToastId);
          openRoom(room);
        }
      } catch (error) {
        console.error("[ROOMS LIST] Error accessing room:", error);
        toast.error("Failed to access room. Please try again.");
        setOpeningRoom(false);
      }
    },
    [user, openRoom, openingRoom]
  );

  const handlePasswordSuccess = () => {
    setPasswordModalOpen(false);
    if (selectedRoom) {
      openRoom(selectedRoom);
    }
  };

  return (
    <>
      <div className="w-full border-2 border-amber-500 rounded-sm overflow-hidden shadow-md bg-white">
        <div className="overflow-y-auto max-h-[600px]">
          {isLoading && rooms.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E74C3C]"></div>
            </div>
          ) : (
            <>
              {/* Real Rooms - Always show all rooms */}
              {rooms.map((room, index) => (
                <RoomItem
                  key={`room-${room.id}`}
                  room={room}
                  index={index}
                  onClick={() => handleRoomClick(room)}
                />
              ))}

              {/* Skeleton Items - Only show when fewer than 9 rooms */}
              {skeletonItems.map((index) => (
                <RoomSkeleton
                  key={`skeleton-${index}`}
                  index={index}
                  totalSkeletons={skeletonCount}
                />
              ))}

              {/* Empty State when no rooms and no skeletons */}
              {rooms.length === 0 && skeletonItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <p>No trading rooms available</p>
                  <Button
                    onClick={onCreateRoom}
                    className="bg-[#E74C3C] mt-2 hover:bg-[#E74C3C]/90 text-white font-medium rounded shadow-none h-12 cursor-pointer"
                  >
                    Create a Trading Room
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        room={selectedRoom}
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
}
