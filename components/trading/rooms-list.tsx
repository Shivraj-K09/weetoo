"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RoomItem } from "./room-item";
import { RoomSkeleton } from "./room-skeleton";
import { PasswordModal } from "./password-modal";
import type { Room, UserProfile } from "@/types/index";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // State for password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const openRoom = useCallback((room: Room) => {
    // Generate room slug
    const roomSlug = `${room.id}-${room.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")}`;

    // Conditional routing based on room category
    if (room.roomCategory === "voice") {
      // For voice rooms, redirect to the voice-room route
      window.open(
        `${window.location.origin}/voice-room/${roomSlug}`,
        "_blank",
        "width=1600,height=900"
      );
      // router.push(`/voice-rooms/${roomSlug}`);
    } else {
      // For regular rooms, use the existing rooms route
      window.open(
        `${window.location.origin}/rooms/${roomSlug}`,
        "_blank",
        "width=1600,height=900"
      );
      // router.push(`/rooms/${roomSlug}`);
    }
  }, []);

  const handleRoomClick = useCallback(
    async (room: Room) => {
      try {
        // If user is not logged in
        if (!user) {
          toast.error("You must be logged in to join a room");
          return;
        }

        // Show loading toast
        const loadingToast = toast.loading("Accessing room...");

        // If room is private, check if user is the owner or already a participant
        if (room.privacy === "private") {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("owner_id, participants")
            .eq("id", room.id)
            .single();

          if (error) {
            console.error("Error checking room access:", error);
            toast.dismiss(loadingToast);
            toast.error("Failed to access room");
            return;
          }

          const isOwner = data.owner_id === user.id;
          const isParticipant = data.participants.includes(user.id);

          // Dismiss loading toast
          toast.dismiss(loadingToast);

          if (!isOwner && !isParticipant) {
            // Show password modal for private rooms
            setSelectedRoom(room);
            setPasswordModalOpen(true);
            return;
          }

          // User is already a participant or owner, open the room
          openRoom(room);
        } else {
          // Public room, dismiss loading toast and open the room
          toast.dismiss(loadingToast);
          openRoom(room);
        }
      } catch (error) {
        console.error("Error accessing room:", error);
        toast.error("Failed to access room");
      }
    },
    [user, openRoom]
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
