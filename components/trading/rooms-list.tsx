"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";
import { Button } from "@/components/ui/button";
import { RoomItem } from "./room-item";
import { RoomSkeleton } from "./room-skeleton";
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

  const handleRoomClick = useCallback(
    async (room: Room) => {
      try {
        // Show loading toast
        const loadingToast = toast.loading("Accessing room...");

        // If room is private, check if user is the owner or already a participant
        if (room.privacy === "private" && user) {
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

          if (!isOwner && !isParticipant) {
            // Dismiss loading toast before showing prompt
            toast.dismiss(loadingToast);

            // Prompt for password
            const password = prompt(
              "This is a private room. Please enter the password:"
            );
            if (!password) return;

            // Show loading toast again
            const verifyingToast = toast.loading("Verifying password...");

            // Verify password
            try {
              const { data: roomData, error: roomError } = await supabase
                .from("trading_rooms")
                .select("room_password")
                .eq("id", room.id)
                .single();

              if (roomError) {
                console.error("Error fetching room password:", roomError);
                toast.dismiss(verifyingToast);
                toast.error("Failed to verify password");
                return;
              }

              const isPasswordCorrect = await bcrypt.compare(
                password,
                roomData.room_password
              );
              if (!isPasswordCorrect) {
                toast.dismiss(verifyingToast);
                toast.error("Incorrect password");
                return;
              }

              // Add user to participants
              const { error: updateError } = await supabase
                .from("trading_rooms")
                .update({
                  participants: [...data.participants, user.id],
                  current_participants: data.participants.length + 1,
                })
                .eq("id", room.id);

              if (updateError) {
                console.error("Error updating participants:", updateError);
                // Continue anyway, as this is not critical
              }

              toast.dismiss(verifyingToast);
            } catch (verifyError) {
              console.error("Error during password verification:", verifyError);
              toast.dismiss(verifyingToast);
              toast.error("Failed to verify password");
              return;
            }
          } else {
            // User is already a participant or owner, dismiss loading toast
            toast.dismiss(loadingToast);
          }
        } else {
          // Public room, dismiss loading toast
          toast.dismiss(loadingToast);
        }

        // Generate room slug
        const roomSlug = `${room.id}-${room.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")}`;

        // Use a small timeout to ensure all async operations complete before opening a new window
        setTimeout(() => {
          // Route based on room type
          if (room.roomCategory === "voice") {
            // For voice rooms, redirect to the voice-room route
            const isOwner = user && room.owner_id === user.id;
            window.open(
              `${window.location.origin}/voice-rooms/${roomSlug}${isOwner ? "?host=true" : ""}`,
              "_blank",
              "width=1600,height=900"
            );
          } else {
            // For regular chat rooms, use the existing rooms route
            window.open(
              `${window.location.origin}/rooms/${roomSlug}`,
              "_blank",
              "width=1600,height=900"
            );
          }
        }, 100);
      } catch (error) {
        console.error("Error accessing room:", error);
        toast.error("Failed to access room");
      }
    },
    [user]
  );

  return (
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
  );
}
