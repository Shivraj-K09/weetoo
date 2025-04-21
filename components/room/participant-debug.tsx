"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface ParticipantDebugProps {
  roomId: string;
  userId: string | null;
  isVisible?: boolean;
}

export function ParticipantDebug({
  roomId,
  userId,
  isVisible = false,
}: ParticipantDebugProps) {
  const [participantStatus, setParticipantStatus] = useState<{
    isParticipant: boolean;
    isOwner: boolean;
    participants: string[];
    currentUser: string | null;
  }>({
    isParticipant: false,
    isOwner: false,
    participants: [],
    currentUser: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkParticipantStatus = async () => {
    if (!roomId || !userId) return;

    setIsLoading(true);
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id || null;

      // Fetch room data
      const { data, error } = await supabase
        .from("trading_rooms")
        .select("participants, owner_id")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Error fetching room data for debug:", error);
        return;
      }

      const isOwner = data.owner_id === userId;
      const isInParticipants =
        Array.isArray(data.participants) && data.participants.includes(userId);

      setParticipantStatus({
        isParticipant: isOwner || isInParticipants,
        isOwner,
        participants: data.participants || [],
        currentUser: currentUserId,
      });
    } catch (error) {
      console.error("Failed to check participant status for debug:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      checkParticipantStatus();
    }
  }, [isVisible, roomId, userId]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md">
      <h3 className="text-lg font-bold mb-2">Participant Debug</h3>
      <Button
        size="sm"
        variant="outline"
        className="mb-2 text-xs"
        onClick={checkParticipantStatus}
        disabled={isLoading}
      >
        {isLoading ? "Checking..." : "Refresh Status"}
      </Button>

      <div className="text-xs space-y-2">
        <div>
          <strong>Room ID:</strong> {roomId}
        </div>
        <div>
          <strong>User ID:</strong> {userId || "Not logged in"}
        </div>
        <div>
          <strong>Is Owner:</strong> {participantStatus.isOwner ? "Yes" : "No"}
        </div>
        <div>
          <strong>Is Participant:</strong>{" "}
          {participantStatus.isParticipant ? "Yes" : "No"}
        </div>
        <div>
          <strong>Current User ID:</strong>{" "}
          {participantStatus.currentUser || "Not logged in"}
        </div>
        <div>
          <strong>Participants:</strong>
          <pre className="mt-1 bg-gray-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(participantStatus.participants, null, 2)}
          </pre>
        </div>
        <div>
          <strong>User in Participants:</strong>{" "}
          {participantStatus.participants.includes(userId || "") ? "Yes" : "No"}
        </div>
      </div>
    </div>
  );
}
