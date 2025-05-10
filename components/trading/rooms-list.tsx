"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase, reconnectSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RoomItem } from "./room-item";
import { RoomSkeleton } from "./room-skeleton";
import { PasswordModal } from "./password-modal";
import { resetSupabaseClient, clearAllToasts } from "@/lib/supabase/utils";
import type { Room, UserProfile } from "@/types/index";

interface RoomsListProps {
  rooms: Room[];
  isLoading: boolean;
  user: UserProfile | null;
  onCreateRoom: () => void;
  onRefresh: () => void;
}

export function RoomsList({
  rooms,
  isLoading,
  user,
  onCreateRoom,
  onRefresh,
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
  const toastIdsRef = useRef<string[]>([]);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Function to clean up before opening a new room
  const prepareForNewRoom = useCallback(async () => {
    console.log("[ROOMS LIST] Preparing to open a new room");

    // Clear any existing toasts
    clearAllToasts();

    // Reset Supabase client to clear all subscriptions and channels
    resetSupabaseClient();

    // Clear ALL localStorage data related to rooms
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("room-") ||
          key.includes("position-") ||
          key.includes("trade-") ||
          key.includes("refresh-handled-") ||
          key.includes("room-storage") ||
          key.includes("room-data-") ||
          key.includes("auth-state-") ||
          key.includes("refresh-detected") ||
          key.includes("lastOpenedRoom") ||
          key.includes("roomOpenedAt") ||
          key.includes("cachedPositions") ||
          key.includes("positionsLastUpdated"))
      ) {
        keysToRemove.push(key);
      }
    }

    // Remove the identified keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(
      "[ROOMS LIST] Cleared",
      keysToRemove.length,
      "localStorage items"
    );

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

  // Helper function to dismiss all toasts
  const dismissAllToasts = useCallback(() => {
    // Dismiss any tracked toast IDs
    toastIdsRef.current.forEach((id) => {
      toast.dismiss(id);
    });
    toastIdsRef.current = [];
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

        // Try to open in a popup with large dimensions but without fullscreen parameter
        let roomWindow = window.open(
          roomUrl,
          `room_${room.id}_${timestamp}`, // Add timestamp to make each window unique
          "width=1800,height=1000,top=0,left=0,resizable=yes,scrollbars=yes,status=yes"
        );

        // If popup is blocked, try opening in a new tab
        if (!roomWindow) {
          roomWindow = window.open(roomUrl, "_blank");

          // If still blocked, show instructions
          if (!roomWindow) {
            toast.error(
              "Unable to open room. Please allow popups or click the link below.",
              {
                duration: 5000,
              }
            );

            // Create a clickable link for the user
            toast.message(
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
          // Add event listener to detect when the window is closed
          const checkWindowClosed = setInterval(() => {
            if (roomWindow && roomWindow.closed) {
              clearInterval(checkWindowClosed);
              // Reset Supabase connections when window is closed
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
    [prepareForNewRoom, dismissAllToasts]
  );

  // Update the handleRoomClick function to handle errors better
  const handleRoomClick = useCallback(
    async (room: Room) => {
      try {
        // Dismiss any existing toasts to prevent confusion
        dismissAllToasts();

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

        // Reset Supabase connections before checking room access
        resetSupabaseClient();

        // If room is private, check if user is the owner or already a participant
        if (room.privacy === "private") {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("owner_id, participants")
            .eq("id", room.id)
            .single();

          if (error) {
            console.error("[ROOMS LIST] Error checking room access:", error);
            toast.error("Failed to access room");
            setOpeningRoom(false);
            return;
          }

          const isOwner = data.owner_id === user.id;
          const isParticipant = data.participants.includes(user.id);

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
          // Public room, open the room
          openRoom(room);
        }
      } catch (error) {
        console.error("[ROOMS LIST] Error accessing room:", error);
        toast.error("Failed to access room. Please try again.");
        setOpeningRoom(false);
      }
    },
    [user, openRoom, openingRoom, dismissAllToasts, resetSupabaseClient]
  );

  const handlePasswordSuccess = () => {
    setPasswordModalOpen(false);
    if (selectedRoom) {
      openRoom(selectedRoom);
    }
  };

  // Handle loading timeout and retry
  useEffect(() => {
    // If rooms are loading for too long, show a retry button
    if (isLoading && rooms.length === 0) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a new timeout
      loadingTimeoutRef.current = setTimeout(() => {
        // If still loading after timeout, show retry message
        if (
          isLoading &&
          rooms.length === 0 &&
          retryCountRef.current < maxRetries
        ) {
          console.log(
            "[ROOMS LIST] Loading timeout, attempting automatic retry"
          );
          retryCountRef.current++;

          // Attempt to reconnect to Supabase
          reconnectSupabase().then((success) => {
            if (success) {
              // If reconnection successful, refresh rooms
              onRefresh();
            } else {
              // If reconnection failed, show toast with manual retry option
              const toastId = toast.error(
                <div className="flex flex-col">
                  <p>Failed to load rooms. Connection issue detected.</p>
                  <Button
                    onClick={() => {
                      toast.dismiss(toastId);
                      onRefresh();
                    }}
                    variant="outline"
                    className="mt-2"
                  >
                    Retry Now
                  </Button>
                </div>,
                { duration: 10000 }
              );
              toastIdsRef.current.push(toastId.toString());
            }
          });
        }
      }, 10000); // 10 second timeout
    } else {
      // If rooms loaded or not loading, clear the timeout and reset retry count
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // Only reset retry count if rooms loaded successfully
      if (!isLoading && rooms.length > 0) {
        retryCountRef.current = 0;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading, rooms.length, onRefresh]);

  // Effect to reset Supabase connections when component mounts
  useEffect(() => {
    // Reset all Supabase connections when the rooms list loads
    const resetConnections = async () => {
      console.log("[ROOMS LIST] Resetting Supabase connections");

      // Just remove channels, don't reset the entire client
      supabase.removeAllChannels();

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

        // If rooms are empty and not loading, trigger a refresh
        if (rooms.length === 0 && !isLoading) {
          console.log("[ROOMS LIST] No rooms loaded, triggering refresh");
          onRefresh();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      dismissAllToasts();
    };
  }, [dismissAllToasts, rooms.length, isLoading, onRefresh]);

  // Handle manual refresh
  const handleManualRefresh = () => {
    // Clear any existing toasts
    dismissAllToasts();

    // Reset retry count
    retryCountRef.current = 0;

    // Show loading toast
    const toastId = toast.loading("Refreshing rooms...");
    toastIdsRef.current.push(toastId.toString());

    // Reset Supabase connection and then refresh
    // FIX: Don't use .then() on a boolean return value
    resetSupabaseClient();

    // Trigger refresh
    onRefresh();

    // Dismiss loading toast after a delay
    setTimeout(() => {
      toast.dismiss(toastId);

      // Show success toast if rooms loaded
      if (rooms.length > 0) {
        toast.success("Rooms refreshed successfully");
      }
    }, 1500);
  };

  return (
    <>
      <div className="w-full border-2 border-amber-500 rounded-sm overflow-hidden shadow-md bg-white">
        <div className="overflow-y-auto max-h-[600px]">
          {isLoading && rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E74C3C] mb-4"></div>
              <p className="text-gray-500 text-sm">Loading rooms...</p>
              {retryCountRef.current > 0 && (
                <p className="text-gray-400 text-xs mt-1">
                  Retry attempt {retryCountRef.current}/{maxRetries}
                </p>
              )}
              {retryCountRef.current >= maxRetries && (
                <Button
                  onClick={handleManualRefresh}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Refresh Manually
                </Button>
              )}
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
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleManualRefresh}
                      variant="outline"
                      className="font-medium rounded shadow-none h-10 cursor-pointer"
                    >
                      Refresh Rooms
                    </Button>
                    <Button
                      onClick={onCreateRoom}
                      className="bg-[#E74C3C] hover:bg-[#E74C3C]/90 text-white font-medium rounded shadow-none h-10 cursor-pointer"
                    >
                      Create a Trading Room
                    </Button>
                  </div>
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
