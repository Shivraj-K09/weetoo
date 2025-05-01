"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, reconnectSupabase } from "@/lib/supabase/client";

/**
 * Hook to maintain a persistent connection to Supabase
 * This helps prevent connection drops during page refreshes and window focus changes
 */
export function usePersistentConnection(type: string, id: string) {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected" | "error" | "reconnecting"
  >("connecting");
  const channelRef = useRef<any>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const mountedRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);
  const connectionId = `${type}-${id}-persistent`;

  // Function to establish connection
  const establishConnection = useCallback(() => {
    if (!id) return;

    // Clear any existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (e) {
        console.error("[PERSISTENT] Error removing existing channel:", e);
      }
    }

    setConnectionStatus("connecting");
    const channelName = `${type}-${id}-persistent`;
    console.log(`[PERSISTENT] Setting up connection for ${channelName}`);

    // Create the channel
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: id },
      },
    });

    // Set up presence tracking
    channel.on("presence", { event: "sync" }, () => {
      if (!mountedRef.current) return;
      setConnectionStatus("connected");
      lastActivityRef.current = Date.now();
      isConnectedRef.current = true;
    });

    // Handle connection status changes
    channel.on("system", { event: "disconnect" }, () => {
      if (!mountedRef.current) return;
      console.log(`[PERSISTENT] Disconnected from ${channelName}`);
      setConnectionStatus("disconnected");
      isConnectedRef.current = false;

      // Try to reconnect immediately
      reconnectSupabase().then((success) => {
        if (success && mountedRef.current) {
          establishConnection();
        }
      });
    });

    channel.on("system", { event: "reconnect" }, () => {
      if (!mountedRef.current) return;
      console.log(`[PERSISTENT] Reconnected to ${channelName}`);
      setConnectionStatus("connected");
      lastActivityRef.current = Date.now();
      isConnectedRef.current = true;
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (!mountedRef.current) return;

      console.log(`[PERSISTENT] Channel ${channelName} status:`, status);

      if (status === "SUBSCRIBED") {
        setConnectionStatus("connected");
        lastActivityRef.current = Date.now();
        isConnectedRef.current = true;
      } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
        setConnectionStatus("disconnected");
        isConnectedRef.current = false;

        // Try to reconnect
        reconnectSupabase().then((success) => {
          if (success && mountedRef.current) {
            establishConnection();
          }
        });
      }
    });

    // Store the channel reference
    channelRef.current = channel;

    // Send initial presence update
    channel.track({
      user_id: id,
      online_at: new Date().toISOString(),
      client_info: {
        last_active: Date.now(),
      },
    });
  }, [id, type]);

  // Set up connection and cleanup
  useEffect(() => {
    mountedRef.current = true;

    // Establish initial connection
    establishConnection();

    // Set up a ping mechanism to keep the connection alive
    pingIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;

      if (channelRef.current && connectionStatus === "connected") {
        // Send a ping to keep the connection alive
        channelRef.current.track({
          user_id: id,
          online_at: new Date().toISOString(),
          ping: Date.now(),
        });
        lastActivityRef.current = Date.now();
      }
    }, 15000); // Ping every 15 seconds

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (!mountedRef.current) return;

      if (document.visibilityState === "visible") {
        console.log("[PERSISTENT] Page became visible, checking connection");

        // If it's been more than 30 seconds since our last activity, reconnect
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        if (timeSinceLastActivity > 30000 || connectionStatus !== "connected") {
          establishConnection();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      mountedRef.current = false;

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (e) {
          console.error(
            "[PERSISTENT] Error removing channel during cleanup:",
            e
          );
        }
      }
    };
  }, [id, type, connectionStatus, establishConnection]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log(
          `[${connectionId}] Page became visible, checking connection`
        );

        try {
          // Check if we need to reconnect
          if (!isConnectedRef.current) {
            setConnectionStatus("reconnecting");
            const success = await reconnectSupabase();

            if (success) {
              setConnectionStatus("connected");
              setIsConnected(true);
              isConnectedRef.current = true;
            } else {
              setConnectionStatus("disconnected");
              setIsConnected(false);
              isConnectedRef.current = false;
            }
          }
        } catch (error) {
          console.error(
            `[${connectionId}] Error during visibility reconnect:`,
            error
          );
          setConnectionStatus("error");
          setIsConnected(false);
          isConnectedRef.current = false;
        }
      }
    };

    // Set up visibility change handler
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up online/offline handlers
    const handleOnline = async () => {
      console.log(`[${connectionId}] Browser went online, reconnecting`);
      setConnectionStatus("reconnecting");

      try {
        const success = await reconnectSupabase();

        if (success) {
          setConnectionStatus("connected");
          setIsConnected(true);
          isConnectedRef.current = true;
        } else {
          setConnectionStatus("disconnected");
          setIsConnected(false);
          isConnectedRef.current = false;
        }
      } catch (error) {
        console.error(
          `[${connectionId}] Error during online reconnect:`,
          error
        );
        setConnectionStatus("error");
        setIsConnected(false);
        isConnectedRef.current = false;
      }
    };

    const handleOffline = () => {
      console.log(`[${connectionId}] Browser went offline`);
      setConnectionStatus("disconnected");
      setIsConnected(false);
      isConnectedRef.current = false;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connectionId]);

  const [isConnected, setIsConnected] = useState<boolean>(false);

  return {
    connectionStatus,
    isConnected,
    isConnecting: connectionStatus === "connecting",
    isDisconnected: connectionStatus === "disconnected",
  };
}
