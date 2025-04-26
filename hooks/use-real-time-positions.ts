"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Define the Position type
interface Position {
  id: string;
  room_id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  entry_amount: number;
  leverage: number;
  position_size: number;
  current_price: number;
  current_pnl: number;
  pnl_percentage: number;
  stop_loss?: number;
  take_profit?: number;
  status: "open" | "closed" | "partially_closed";
  created_at: string;
  updated_at: string;
}

export function useRealTimePositions(roomId: string) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positionsRef = useRef<Position[]>([]);
  const supabaseRef = useRef<any>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    console.log("[useRealTimePositions] Setting up for roomId:", roomId);
    setIsLoading(true);
    setError(null);

    // Create Supabase client
    const supabase = createClient();
    supabaseRef.current = supabase;

    // Track if component is mounted
    let isMounted = true;

    // Batch updates to reduce renders
    const pendingUpdates = new Map();
    let updateTimeout: NodeJS.Timeout | null = null;

    const processBatchUpdates = () => {
      if (!isMounted) return;

      setPositions((current) => {
        // Create a map of current positions for faster lookup
        const posMap = new Map(current.map((pos) => [pos.id, pos]));

        // Apply all pending updates
        pendingUpdates.forEach((newPos, id) => {
          if (newPos === null) {
            // Delete operation
            posMap.delete(id);
          } else if (newPos.status !== "open") {
            // Remove positions that are no longer open
            posMap.delete(id);
          } else {
            // Insert or update operation for open positions only
            posMap.set(id, newPos);
          }
        });

        // Convert map back to array and sort
        const updatedPositions = Array.from(posMap.values()).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Update the ref
        positionsRef.current = updatedPositions;

        return updatedPositions;
      });

      // Clear pending updates
      pendingUpdates.clear();
      updateTimeout = null;
    };

    const queueUpdate = (id: string, position: Position | null) => {
      pendingUpdates.set(id, position);

      // Batch updates with a 100ms delay
      if (!updateTimeout) {
        updateTimeout = setTimeout(processBatchUpdates, 100);
      }
    };

    // Initial fetch of positions with retry logic
    const fetchPositions = async (retryCount = 0) => {
      try {
        console.log(
          "[useRealTimePositions] Fetching initial positions for room:",
          roomId
        );
        const { data, error } = await supabase
          .from("trading_positions")
          .select("*")
          .eq("room_id", roomId)
          .eq("status", "open")
          .order("created_at", { ascending: false });

        if (error) {
          console.error(
            "[useRealTimePositions] Error fetching positions:",
            error
          );

          // Retry logic for transient errors
          if (retryCount < 3 && isMounted) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`[useRealTimePositions] Retrying in ${delay}ms...`);
            setTimeout(() => fetchPositions(retryCount + 1), delay);
            return;
          }

          if (isMounted) {
            setError(error.message);
            setIsLoading(false);
          }
          return;
        }

        console.log(
          "[useRealTimePositions] Initial positions loaded:",
          data?.length || 0
        );
        if (isMounted) {
          setPositions(data || []);
          positionsRef.current = data || [];
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useRealTimePositions] Unexpected error:", err);
        if (isMounted) {
          setError("Failed to load positions");
          setIsLoading(false);
        }
      }
    };

    // Fetch initial data
    fetchPositions();

    // Set up real-time subscription with optimized handlers
    const subscription = supabase
      .channel(`trading_positions_changes_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (insert, update, delete)
          schema: "public",
          table: "trading_positions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log(
            "[useRealTimePositions] Real-time update received:",
            payload.eventType,
            (payload.new as Position)?.status
          );

          // Handle different event types
          if (payload.eventType === "INSERT") {
            // Only add if status is "open"
            if (payload.new.status === "open") {
              // Queue new position
              queueUpdate(payload.new.id, payload.new as Position);

              // Only show toast for new positions
              toast.success("New position opened", {
                id: `new-position-${payload.new.id}`, // Prevent duplicate toasts
              });
            }
          } else if (payload.eventType === "UPDATE") {
            // Check if status changed from open to closed or partially_closed
            if (
              payload.old.status === "open" &&
              (payload.new.status === "closed" ||
                payload.new.status === "partially_closed")
            ) {
              // Remove from positions list immediately
              queueUpdate(payload.new.id, null);

              // Show toast for position closed
              toast.success(
                payload.new.status === "closed"
                  ? "Position closed"
                  : "Position partially closed",
                {
                  id: `close-position-${payload.new.id}`, // Prevent duplicate toasts
                }
              );

              // Emit a custom event that the trade history component can listen for
              const closeEvent = new CustomEvent("position-closed", {
                detail: {
                  positionId: payload.new.id,
                  roomId: payload.new.room_id,
                },
              });
              window.dispatchEvent(closeEvent);
            } else if (payload.new.status === "open") {
              // Only update if still open
              queueUpdate(payload.new.id, payload.new as Position);
            }
          } else if (payload.eventType === "DELETE") {
            // Queue position removal
            queueUpdate(payload.old.id, null);
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealTimePositions] Subscription status:", status);
      });

    subscriptionRef.current = subscription;

    // Listen for tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log(
          "[useRealTimePositions] Tab became visible, refreshing positions"
        );
        setPositions(positionsRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for new position events
    const handleNewPosition = () => {
      console.log(
        "[useRealTimePositions] New position created, refreshing data"
      );
      fetchPositions();
    };

    window.addEventListener("new-position-created", handleNewPosition);

    // Cleanup subscription on unmount
    return () => {
      console.log("[useRealTimePositions] Cleaning up subscription");
      isMounted = false;
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("new-position-created", handleNewPosition);
    };
  }, [roomId]);

  // Return setPositions so we can manually update positions
  return { positions, isLoading, error, setPositions };
}
