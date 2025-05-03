"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AutoJoinRoomProps {
  roomId: string;
  userId: string;
}

export function AutoJoinRoom({ roomId, userId }: AutoJoinRoomProps) {
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!roomId || !userId) return;

    const addUserToRoom = async () => {
      try {
        console.log("[AUTO JOIN] Checking if user is already in room:", roomId);

        // First check if user is already in participants array
        const { data: roomData, error: roomError } = await supabase
          .from("trading_rooms")
          .select("participants, owner_id")
          .eq("id", roomId)
          .single();

        if (roomError) {
          console.error("[AUTO JOIN] Error fetching room data:", roomError);
          return;
        }

        // If user is the owner, they're already a participant
        if (roomData.owner_id === userId) {
          console.log("[AUTO JOIN] User is the owner, already a participant");
          setJoined(true);
          return;
        }

        // Check if user is already in participants array
        const participants = Array.isArray(roomData.participants)
          ? roomData.participants
          : [];

        if (participants.includes(userId)) {
          console.log("[AUTO JOIN] User is already in participants array");
          setJoined(true);
          return;
        }

        // Add user to participants array
        console.log("[AUTO JOIN] Adding user to participants array");
        const newParticipants = [...participants, userId];

        const { error: updateError } = await supabase
          .from("trading_rooms")
          .update({ participants: newParticipants })
          .eq("id", roomId);

        if (updateError) {
          console.error(
            "[AUTO JOIN] Error updating participants array:",
            updateError
          );
          return;
        }

        console.log("[AUTO JOIN] Successfully added user to room");
        setJoined(true);
      } catch (error) {
        console.error("[AUTO JOIN] Error adding user to room:", error);
      }
    };

    if (!joined) {
      addUserToRoom();
    }
  }, [roomId, userId, joined]);

  // This component doesn't render anything
  return null;
}
