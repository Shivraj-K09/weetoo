"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AutoJoinProps {
  roomId: string;
  userId: string;
}

export function AutoJoin({ roomId, userId }: AutoJoinProps) {
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!roomId || !userId || hasJoined) return;

    const joinRoom = async () => {
      try {
        console.log("[AUTO JOIN] Attempting to join room:", roomId);

        // First check if user is already in participants
        const { data: room, error: roomError } = await supabase
          .from("trading_rooms")
          .select("participants, owner_id")
          .eq("id", roomId)
          .single();

        if (roomError) {
          console.error("[AUTO JOIN] Error fetching room:", roomError);
          return;
        }

        // If user is the owner, they're already a participant
        if (room.owner_id === userId) {
          console.log("[AUTO JOIN] User is the owner, already a participant");
          setHasJoined(true);
          return;
        }

        // Check if user is already in participants array
        const participants = Array.isArray(room.participants)
          ? room.participants
          : [];
        if (participants.includes(userId)) {
          console.log("[AUTO JOIN] User already in participants list");
          setHasJoined(true);
          return;
        }

        // Add user to participants array
        const updatedParticipants = [...participants, userId];

        // Update the room
        const { error: updateError } = await supabase
          .from("trading_rooms")
          .update({
            participants: updatedParticipants,
            current_participants: updatedParticipants.length,
          })
          .eq("id", roomId);

        if (updateError) {
          console.error("[AUTO JOIN] Error updating room:", updateError);
          return;
        }

        console.log("[AUTO JOIN] Successfully joined room");
        setHasJoined(true);
      } catch (error) {
        console.error("[AUTO JOIN] Error joining room:", error);
      }
    };

    joinRoom();
  }, [roomId, userId, hasJoined]);

  return null; // This component doesn't render anything
}
