"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface RoomPermissionsOptions {
  initialIsHost?: boolean;
}

export function useRoomPermissions(
  roomId: string,
  options: RoomPermissionsOptions = {}
) {
  const { initialIsHost = false } = options;
  const [isHost, setIsHost] = useState<boolean>(initialIsHost);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!roomId) {
      setIsLoading(false);
      return;
    }

    const checkPermissions = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsHost(false);
          setIsLoading(false);
          return;
        }

        const userId = session.user.id;

        // Check if the user is the room owner
        const { data: roomData, error: roomError } = await supabase
          .from("trading_rooms")
          .select("owner_id")
          .eq("id", roomId)
          .single();

        if (roomError) {
          console.error("Error checking room permissions:", roomError);
          setIsHost(false);
        } else {
          setIsHost(roomData.owner_id === userId);
        }
      } catch (error) {
        console.error("Error in useRoomPermissions:", error);
        setIsHost(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [roomId]);

  return { isHost, isLoading };
}
