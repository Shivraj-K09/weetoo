"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

// Update the interface to ensure roomDetails is properly typed
interface ParticipantsPanelProps {
  roomDetails: any;
  participants: any[];
}

// Make sure the component destructures both props
export function ParticipantsPanel({
  roomDetails,
  participants: initialParticipants,
}: ParticipantsPanelProps) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [isLoading, setIsLoading] = useState(false);

  // Create a memoized function to fetch participants
  const fetchParticipants = useCallback(async () => {
    if (!roomDetails || !roomDetails.id) return;

    setIsLoading(true);
    try {
      // First, get the latest participants list from the database
      const { data: roomData, error: roomError } = await supabase
        .from("trading_rooms")
        .select("participants, owner_id")
        .eq("id", roomDetails.id)
        .single();

      if (roomError) {
        console.error(
          "[PARTICIPANTS PANEL] Error fetching room data:",
          roomError
        );
        setIsLoading(false);
        return;
      }

      const participantIds = roomData.participants || [];
      console.log(
        "[PARTICIPANTS PANEL] Latest participants from database:",
        participantIds
      );
      console.log("[PARTICIPANTS PANEL] Room owner:", roomData.owner_id);

      if (participantIds.length === 0) {
        setParticipants([]);
        setIsLoading(false);
        return;
      }

      // Then fetch the user details for each participant
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("users")
          .select("id, first_name, last_name, email, avatar_url")
          .in("id", participantIds);

      if (participantsError) {
        console.error(
          "[PARTICIPANTS PANEL] Error fetching participants:",
          participantsError
        );
      } else {
        console.log(
          "[PARTICIPANTS PANEL] Fetched participant details:",
          participantsData
        );
        setParticipants(participantsData || []);
      }
    } catch (error) {
      console.error(
        "[PARTICIPANTS PANEL] Failed to fetch participants:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [roomDetails]);

  // Update participants when initialParticipants changes
  useEffect(() => {
    if (initialParticipants && initialParticipants.length > 0) {
      console.log(
        "[PARTICIPANTS PANEL] Updating from initialParticipants:",
        initialParticipants
      );
      setParticipants(initialParticipants);
    }
  }, [initialParticipants]);

  // Set up real-time subscription for participants
  useEffect(() => {
    if (!roomDetails || !roomDetails.id) return;

    // Fetch participants immediately on mount
    fetchParticipants();

    // Set up a real-time subscription specifically for this room's participants
    const participantsSubscription = supabase
      .channel(`room-participants:${roomDetails.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomDetails.id}`,
        },
        async (payload) => {
          console.log(
            "[PARTICIPANTS PANEL] Participants update detected:",
            payload.new
          );
          fetchParticipants();
        }
      )
      .subscribe();

    // Set up interval to periodically refresh participants
    const intervalId = setInterval(() => {
      fetchParticipants();
    }, 3000); // Check every 3 seconds

    // Clean up subscription and interval
    return () => {
      supabase.removeChannel(participantsSubscription);
      clearInterval(intervalId);
    };
  }, [roomDetails, fetchParticipants]);

  return (
    <div className="w-full bg-[#212631] h-[300px] p-4 py-3 text-sm border border-[#3f445c] rounded-lg">
      <div className="w-full rounded">
        <div className="flex justify-between text-sm mb-2 text-gray-400">
          <div>
            Participants ({roomDetails?.current_participants || 0}/
            {roomDetails?.max_participants || 0})
            {isLoading && <span className="ml-2 text-xs">(Refreshing...)</span>}
          </div>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {participants && participants.length > 0 ? (
            participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">
                    {participant.first_name?.charAt(0) || ""}
                    {participant.last_name?.charAt(0) || ""}
                  </div>
                  <span>
                    {participant.first_name || ""} {participant.last_name || ""}
                  </span>
                </div>
                {participant.id === roomDetails?.owner_id && (
                  <span className="text-xs bg-[#E74C3C] px-2 py-0.5 rounded">
                    Owner
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400">
              {isLoading ? "Loading participants..." : "No participants yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
