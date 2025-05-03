"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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

// Define payload type for type safety
type PositionPayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
  status?: string;
}>;

export function useRealTimePositions(roomId: string) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const positionsRef = useRef<Position[]>([]);
  const subscriptionRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;

    if (!roomId) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    console.log("[useRealTimePositions] Setting up for roomId:", roomId);
    setIsLoading(true);
    setError(null);

    // Batch updates to reduce renders
    const pendingUpdates = new Map();
    let updateTimeout: NodeJS.Timeout | null = null;

    // Enhanced batching with adaptive timing
    const processBatchUpdates = () => {
      if (!mountedRef.current) return;

      // Track performance
      const startTime = performance.now();

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

      // Measure performance and adjust batch timing
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Log performance metrics
      console.log(
        `[useRealTimePositions] Batch update processed in ${processingTime.toFixed(2)}ms with ${pendingUpdates.size} updates`
      );
    };

    // Adaptive batching based on update frequency
    const queueUpdate = (id: string, position: Position | null) => {
      pendingUpdates.set(id, position);

      // If we have many updates coming in rapidly, increase the batch delay
      // to avoid too many renders
      const batchDelay =
        pendingUpdates.size > 10 ? 100 : pendingUpdates.size > 5 ? 75 : 50;

      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      updateTimeout = setTimeout(processBatchUpdates, batchDelay);
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
          if (retryCount < 3 && mountedRef.current) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`[useRealTimePositions] Retrying in ${delay}ms...`);
            setTimeout(() => fetchPositions(retryCount + 1), delay);
            return;
          }

          if (mountedRef.current) {
            setError(error.message);
            setIsLoading(false);
          }
          return;
        }

        console.log(
          "[useRealTimePositions] Initial positions loaded:",
          data?.length || 0
        );
        if (mountedRef.current) {
          setPositions(data || []);
          positionsRef.current = data || [];
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useRealTimePositions] Unexpected error:", err);
        if (mountedRef.current) {
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
        (payload: PositionPayload) => {
          console.log(
            "[useRealTimePositions] Real-time update received:",
            payload.eventType,
            payload.new && "status" in payload.new
              ? payload.new.status
              : "unknown"
          );

          // Handle different event types
          if (payload.eventType === "INSERT") {
            // Only add if status is "open"
            if (
              payload.new &&
              "status" in payload.new &&
              payload.new.status === "open"
            ) {
              // Queue new position
              queueUpdate(payload.new.id, payload.new as unknown as Position);

              // Only show toast for new positions
              toast.success("New position opened", {
                id: `new-position-${payload.new.id}`, // Prevent duplicate toasts
              });
            }
          } else if (payload.eventType === "UPDATE") {
            // Check if status changed from open to closed or partially_closed
            if (
              payload.old &&
              "status" in payload.old &&
              payload.old.status === "open" &&
              payload.new &&
              "status" in payload.new &&
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
            } else if (
              payload.new &&
              "status" in payload.new &&
              payload.new.status === "open"
            ) {
              // Only update if still open
              queueUpdate(payload.new.id, payload.new as unknown as Position);
            }
          } else if (payload.eventType === "DELETE") {
            // Queue position removal
            if (payload.old && "id" in payload.old) {
              queueUpdate(payload.old.id, null);
            }
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
        fetchPositions();
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
      mountedRef.current = false;
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
