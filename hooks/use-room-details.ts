"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define privacy type as a union type for better type safety
type Privacy = "private" | "public";

// Define the room details type
interface RoomData {
  id: string;
  room_name: string;
  room_type: Privacy;
  trading_pairs: string[];
  current_participants: number;
  max_participants: number;
  owner_id: string;
  participants: string[];
  created_at: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

export function useRoomDetails(roomData: RoomData | null, roomId: string) {
  const router = useRouter();
  const [roomDetails, setRoomDetails] = useState<RoomData | null>(
    roomData || null
  );
  const [isLoading, setIsLoading] = useState(!roomData);
  const [participants, setParticipants] = useState<User[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [lastParticipantsFetch, setLastParticipantsFetch] = useState<number>(0);

  // Create a memoized function to fetch participants
  const fetchParticipants = useCallback(async (participantIds: string[]) => {
    try {
      if (!participantIds || participantIds.length === 0) {
        console.log("[ROOM DETAILS] No participants to fetch");
        setParticipants([]);
        return;
      }

      console.log("[ROOM DETAILS] Fetching participants:", participantIds);

      const { data: participantsData, error: participantsError } =
        await supabase
          .from("users")
          .select("id, first_name, last_name, email, avatar_url")
          .in("id", participantIds);

      if (participantsError) {
        console.error(
          "[ROOM DETAILS] Error fetching participants:",
          participantsError
        );
        setParticipants([]);
      } else {
        console.log("[ROOM DETAILS] Participants fetched:", participantsData);
        setParticipants(participantsData || []);
        setLastParticipantsFetch(Date.now());
      }
    } catch (error) {
      console.error("[ROOM DETAILS] Failed to fetch participants:", error);
      setParticipants([]);
    }
  }, []);

  // Fetch room details if not provided
  useEffect(() => {
    if (roomData) {
      setRoomDetails(roomData);
      setIsLoading(false);

      // Set the selected symbol
      if (roomData.trading_pairs && roomData.trading_pairs.length > 0) {
        setSelectedSymbol(roomData.trading_pairs[0]);
      }

      // Fetch owner name
      const fetchOwner = async () => {
        try {
          if (!roomData.owner_id) {
            console.log("[ROOM DETAILS] No owner ID available");
            setOwnerName("Unknown");
            return;
          }

          const { data: ownerData, error: ownerError } = await supabase
            .from("users")
            .select("first_name, last_name")
            .eq("id", roomData.owner_id)
            .single();

          if (ownerError) {
            console.error(
              "[ROOM DETAILS] Error fetching owner data:",
              ownerError
            );
            setOwnerName("Unknown");
          } else if (ownerData) {
            setOwnerName(`${ownerData.first_name} ${ownerData.last_name}`);
          } else {
            setOwnerName("Unknown");
          }
        } catch (error) {
          console.error("[ROOM DETAILS] Failed to fetch owner:", error);
          setOwnerName("Unknown");
        }
      };

      fetchOwner();
      fetchParticipants(roomData.participants || []);
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);

        if (!roomId) {
          console.error("[ROOM DETAILS] No room ID available");
          router.push("/");
          return;
        }

        console.log("[ROOM DETAILS] Fetching room details for ID:", roomId);

        const { data, error } = await supabase
          .from("trading_rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (error) {
          console.error("[ROOM DETAILS] Error fetching room details:", error);
          toast.error("Failed to load room details");
          router.push("/");
          return;
        }

        setRoomDetails(data);

        // Set the selected symbol
        if (data.trading_pairs && data.trading_pairs.length > 0) {
          setSelectedSymbol(data.trading_pairs[0]);
        }

        // Fetch owner name
        try {
          if (data.owner_id) {
            const { data: ownerData, error: ownerError } = await supabase
              .from("users")
              .select("first_name, last_name")
              .eq("id", data.owner_id)
              .single();

            if (ownerError) {
              console.error(
                "[ROOM DETAILS] Error fetching owner data:",
                ownerError
              );
              setOwnerName("Unknown");
            } else if (ownerData) {
              setOwnerName(`${ownerData.first_name} ${ownerData.last_name}`);
            } else {
              setOwnerName("Unknown");
            }
          } else {
            setOwnerName("Unknown");
          }
        } catch (error) {
          console.error("[ROOM DETAILS] Failed to fetch owner:", error);
          setOwnerName("Unknown");
        }

        fetchParticipants(data.participants || []);
      } catch (error) {
        console.error("[ROOM DETAILS] Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }

    // Set up real-time subscription for room updates
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("[ROOM DETAILS] Room update received:", payload.new);
          const updatedRoom = payload.new as RoomData;
          setRoomDetails(updatedRoom);

          // When room is updated, always refresh participants
          if (updatedRoom.participants) {
            console.log(
              "[ROOM DETAILS] Room updated, refreshing participants:",
              updatedRoom.participants
            );
            fetchParticipants(updatedRoom.participants);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
    };
  }, [roomId, router, roomData, fetchParticipants]);

  // Force refresh participants on a regular interval
  useEffect(() => {
    const refreshInterval = 5000; // 5 seconds

    // Only attempt to refresh participants if we have room details and it's been more than 5 seconds
    const intervalId = setInterval(() => {
      if (
        roomDetails &&
        roomDetails.participants &&
        Date.now() - lastParticipantsFetch > refreshInterval
      ) {
        console.log("[ROOM DETAILS] Forcing participants refresh");

        // Force a fresh fetch from the database
        const refreshRoomData = async () => {
          try {
            const { data, error } = await supabase
              .from("trading_rooms")
              .select("participants")
              .eq("id", roomDetails.id)
              .single();

            if (error) {
              console.error(
                "[ROOM DETAILS] Error refreshing room data:",
                error
              );
            } else if (data && data.participants) {
              console.log(
                "[ROOM DETAILS] Refreshed participants from database:",
                data.participants
              );
              fetchParticipants(data.participants);
            }
          } catch (error) {
            console.error("[ROOM DETAILS] Failed to refresh room data:", error);
          }
        };

        refreshRoomData();
      }
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [roomDetails, fetchParticipants, lastParticipantsFetch]);

  return {
    roomDetails,
    isLoading,
    participants,
    ownerName,
    selectedSymbol,
    setSelectedSymbol,
    setRoomDetails,
  };
}
