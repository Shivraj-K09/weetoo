"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/lib/supabase/client";

export function useRoomPermissions(roomId?: string) {
  const { user } = useUser();
  const [permissions, setPermissions] = useState({
    isHost: false,
    isParticipant: false,
    canTrade: false,
    canViewPositions: true,
    canViewTradeHistory: true,
    isLoading: false,
  });

  useEffect(() => {
    let isMounted = true;
    console.log(
      "[useRoomPermissions] Effect running with roomId:",
      roomId,
      "user:",
      user?.id
    );

    // If no roomId or user, reset permissions and exit
    if (!roomId || !user) {
      console.log(
        "[useRoomPermissions] No roomId or user, resetting permissions"
      );
      if (isMounted) {
        setPermissions((prev) => ({
          ...prev,
          isHost: false,
          isParticipant: false,
          canTrade: false,
          isLoading: false,
        }));
      }
      return () => {
        isMounted = false;
      };
    }

    // Set loading state
    setPermissions((prev) => ({ ...prev, isLoading: true }));

    // Function to fetch room data
    const fetchRoomData = async () => {
      try {
        console.log(
          "[useRoomPermissions] Fetching room data for UUID:",
          roomId
        );

        // Try to fetch from the trading_rooms table using the UUID
        console.log(
          "[useRoomPermissions] Querying trading_rooms table with id:",
          roomId
        );

        // Use the trading_rooms table instead of rooms
        const { data, error } = await supabase
          .from("trading_rooms")
          .select("owner_id, participants")
          .eq("id", roomId)
          .single();

        if (error) {
          console.error(
            "[useRoomPermissions] Error fetching from trading_rooms table:",
            error
          );
          console.log(
            "[useRoomPermissions] Error details:",
            JSON.stringify(error)
          );

          if (isMounted) {
            setPermissions((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }
          return;
        }

        if (isMounted && data) {
          console.log(
            "[useRoomPermissions] Found data in trading_rooms:",
            data
          );

          const isUserHost = data.owner_id === user.id;
          console.log(
            "[useRoomPermissions] Is user host?",
            isUserHost,
            "owner_id:",
            data.owner_id
          );

          const participants = data.participants || [];
          console.log("[useRoomPermissions] Participants:", participants);

          let isUserParticipant = false;

          if (Array.isArray(participants)) {
            // Check if participants is an array of strings (user IDs)
            if (
              participants.length > 0 &&
              typeof participants[0] === "string"
            ) {
              isUserParticipant = participants.includes(user.id);
              console.log(
                "[useRoomPermissions] Checking if user ID is in participants array:",
                isUserParticipant
              );
            }
            // Check if participants is an array of objects with user_id property
            else if (
              participants.length > 0 &&
              typeof participants[0] === "object"
            ) {
              isUserParticipant = participants.some(
                (p: any) => p.user_id === user.id
              );
              console.log(
                "[useRoomPermissions] Checking if user ID is in participants objects:",
                isUserParticipant
              );
            }
          }

          console.log(
            "[useRoomPermissions] Final permissions - isHost:",
            isUserHost,
            "isParticipant:",
            isUserParticipant
          );

          setPermissions({
            isHost: isUserHost,
            isParticipant: isUserParticipant,
            canTrade: isUserHost || isUserParticipant,
            canViewPositions: true,
            canViewTradeHistory: true,
            isLoading: false,
          });
        } else {
          console.log("[useRoomPermissions] No data found for room:", roomId);
          if (isMounted) {
            setPermissions((prev) => ({
              ...prev,
              isLoading: false,
            }));
          }
        }
      } catch (err) {
        console.error(
          "[useRoomPermissions] Failed to fetch room permissions:",
          err
        );
        if (isMounted) {
          setPermissions((prev) => ({
            ...prev,
            isLoading: false,
          }));
        }
      }
    };

    // Execute the fetch function
    fetchRoomData();

    // Cleanup function
    return () => {
      console.log(
        "[useRoomPermissions] Cleanup function called for roomId:",
        roomId
      );
      isMounted = false;
    };
  }, [roomId, user]);

  return permissions;
}
