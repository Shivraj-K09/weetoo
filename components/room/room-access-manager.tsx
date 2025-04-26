"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  resetSupabaseClient,
  forceResetSupabaseClient,
} from "@/lib/supabase/utils";

interface RoomAccessManagerProps {
  roomId: string;
}

export function RoomAccessManager({ roomId }: RoomAccessManagerProps) {
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;
  const isConnectingRef = useRef(false);
  const accessStartTimeRef = useRef(Date.now());

  // Function to ensure we have a valid connection
  const ensureConnection = async () => {
    if (isConnectingRef.current) return;

    try {
      isConnectingRef.current = true;

      // Check how long we've been trying to connect
      const timeElapsed = Date.now() - accessStartTimeRef.current;

      // If we've been trying for more than 10 seconds, show a toast
      if (timeElapsed > 10000 && connectionAttemptsRef.current === 0) {
        toast.loading("Establishing connection...", { id: "room-connection" });
      }

      // Check if we have a valid session
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("[ROOM ACCESS] Session error:", error);
        connectionAttemptsRef.current++;

        if (connectionAttemptsRef.current <= maxConnectionAttempts) {
          // Try to reset the client
          if (connectionAttemptsRef.current === 1) {
            resetSupabaseClient();
          } else {
            await forceResetSupabaseClient();
          }

          // Update toast
          toast.loading("Reconnecting...", { id: "room-connection" });

          // Try again after a delay
          setTimeout(ensureConnection, 2000);
        } else {
          // We've tried too many times
          toast.error("Connection failed. Please refresh the page.", {
            id: "room-connection",
          });
        }
        return;
      }

      // We have a valid session, try to connect to the room
      const roomChannel = supabase.channel(`room-access:${roomId}`);

      roomChannel.subscribe((status) => {
        console.log(`[ROOM ACCESS] Room channel status: ${status}`);

        if (status === "SUBSCRIBED") {
          // Successfully connected
          connectionAttemptsRef.current = 0;
          toast.success("Connected to room", { id: "room-connection" });

          // Remove the channel after a delay
          setTimeout(() => {
            supabase.removeChannel(roomChannel);
          }, 2000);
        } else if (status === "CHANNEL_ERROR") {
          // Connection error
          connectionAttemptsRef.current++;

          if (connectionAttemptsRef.current <= maxConnectionAttempts) {
            // Try to reset the client
            resetSupabaseClient();

            // Try again after a delay
            setTimeout(ensureConnection, 2000);
          } else {
            // We've tried too many times
            toast.error("Failed to connect to room. Please refresh the page.", {
              id: "room-connection",
            });
          }
        }
      });
    } catch (error) {
      console.error("[ROOM ACCESS] Connection error:", error);
      toast.error("Connection error. Please refresh the page.", {
        id: "room-connection",
      });
    } finally {
      isConnectingRef.current = false;
    }
  };

  useEffect(() => {
    // Set the start time
    accessStartTimeRef.current = Date.now();

    // Try to connect immediately
    ensureConnection();

    // Also try to connect when the page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ensureConnection();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [roomId]);

  // This component doesn't render anything
  return null;
}
