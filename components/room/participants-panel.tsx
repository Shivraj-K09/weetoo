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
  const [participants, setParticipants] = useState<any[]>(
    initialParticipants || []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Create a memoized function to fetch participants
  const fetchParticipants = useCallback(async () => {
    if (!roomDetails || !roomDetails.id) return;

    setIsLoading(true);
    try {
      console.log(
        "[PARTICIPANTS PANEL] Fetching participants for room:",
        roomDetails.id
      );

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

      // Ensure participants is always an array
      const participantIds = Array.isArray(roomData.participants)
        ? roomData.participants
        : [];

      // Always include the owner in the participants list
      if (roomData.owner_id && !participantIds.includes(roomData.owner_id)) {
        participantIds.push(roomData.owner_id);
      }

      console.log(
        "[PARTICIPANTS PANEL] Participant IDs from database:",
        participantIds
      );

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
        setParticipants([]);
      } else {
        console.log(
          "[PARTICIPANTS PANEL] Fetched participant details:",
          participantsData?.length || 0
        );

        // Make sure we have the owner
        if (participantsData && roomData.owner_id) {
          const hasOwner = participantsData.some(
            (p) => p.id === roomData.owner_id
          );

          if (!hasOwner) {
            // Fetch owner data separately
            const { data: ownerData, error: ownerError } = await supabase
              .from("users")
              .select("id, first_name, last_name, email, avatar_url")
              .eq("id", roomData.owner_id)
              .single();

            if (!ownerError && ownerData) {
              participantsData.push(ownerData);
            }
          }
        }

        // Remove any duplicate participants by ID before setting state
        const uniqueParticipants = removeDuplicateParticipants(
          participantsData || []
        );
        setParticipants(uniqueParticipants);
      }
    } catch (error) {
      console.error(
        "[PARTICIPANTS PANEL] Failed to fetch participants:",
        error
      );
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomDetails]);

  // Helper function to remove duplicate participants
  const removeDuplicateParticipants = (participants: any[]) => {
    const uniqueIds = new Set();
    return participants.filter((participant) => {
      if (uniqueIds.has(participant.id)) {
        return false;
      }
      uniqueIds.add(participant.id);
      return true;
    });
  };

  // Update participants when initialParticipants changes
  useEffect(() => {
    if (initialParticipants && initialParticipants.length > 0) {
      console.log(
        "[PARTICIPANTS PANEL] Updating from initialParticipants:",
        initialParticipants
      );
      // Remove any duplicate participants before setting state
      const uniqueParticipants =
        removeDuplicateParticipants(initialParticipants);
      setParticipants(uniqueParticipants);
    } else {
      // If no initial participants provided, fetch them
      fetchParticipants();
    }
  }, [initialParticipants, fetchParticipants]);

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
    }, 5000); // Check every 5 seconds

    // Clean up subscription and interval
    return () => {
      supabase.removeChannel(participantsSubscription);
      clearInterval(intervalId);
    };
  }, [roomDetails, fetchParticipants]);

  // Add current user if they're not in the list but should be
  useEffect(() => {
    const addCurrentUserIfNeeded = async () => {
      // Only run if we have room details and the user is viewing the room
      if (!roomDetails || !roomDetails.id) return;

      try {
        // Get current user
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;

        const currentUserId = data.user.id;

        // Check if current user is already in participants list
        const isCurrentUserInList = participants.some(
          (p) => p.id === currentUserId
        );

        if (!isCurrentUserInList) {
          console.log(
            "[PARTICIPANTS PANEL] Current user not in participants list, checking if they should be added"
          );

          // Check if current user is the owner
          if (roomDetails.owner_id === currentUserId) {
            console.log(
              "[PARTICIPANTS PANEL] Current user is the owner, fetching user data"
            );

            // Fetch user data
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("id, first_name, last_name, email, avatar_url")
              .eq("id", currentUserId)
              .single();

            if (!userError && userData) {
              console.log(
                "[PARTICIPANTS PANEL] Adding owner to participants list"
              );
              setParticipants((prev) => {
                // Check if user is already in the list to avoid duplicates
                if (prev.some((p) => p.id === userData.id)) {
                  return prev;
                }
                return [...prev, userData];
              });
            }
          }
        }
      } catch (error) {
        console.error(
          "[PARTICIPANTS PANEL] Error in addCurrentUserIfNeeded:",
          error
        );
      }
    };

    addCurrentUserIfNeeded();
  }, [participants, roomDetails]);

  return (
    <div className="w-full bg-[#1a1e27] h-[300px] p-4 py-3 text-sm border border-[#3f445c]">
      <div className="w-full rounded">
        <div className="flex justify-between text-sm mb-2 text-gray-400">
          <div>
            Participants ({participants.length || 0}/
            {roomDetails?.max_participants || 100})
            {isLoading && <span className="ml-2 text-xs">(Refreshing...)</span>}
          </div>
        </div>
        <div className="space-y-2 max-h-[230px] overflow-y-auto">
          {participants && participants.length > 0 ? (
            participants.map((participant, index) => (
              <div
                key={`${participant.id}-${index}`}
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
