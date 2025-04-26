"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

export function useRealTimeCurrency(roomId: string) {
  const [virtualCurrency, setVirtualCurrency] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setVirtualCurrency(0);
      setIsLoading(false);
      return;
    }

    console.log("[useRealTimeCurrency] Setting up for roomId:", roomId);
    setIsLoading(true);
    setError(null);

    // Extract the UUID part from the roomId
    const extractedUUID = extractUUID(roomId) || roomId;
    console.log("[useRealTimeCurrency] Extracted UUID:", extractedUUID);

    // Create Supabase client
    const supabase = createClient();

    // Track if component is mounted
    let isMounted = true;

    // Fetch virtual currency with retry logic
    const fetchVirtualCurrency = async (retryCount = 0) => {
      try {
        console.log(
          "[useRealTimeCurrency] Fetching virtual currency for room:",
          extractedUUID
        );

        // Get room details to check virtual currency
        const { data: room, error: roomError } = await supabase
          .from("trading_rooms")
          .select("virtual_currency")
          .eq("id", extractedUUID)
          .single();

        if (roomError) {
          console.error(
            "[useRealTimeCurrency] Error fetching room:",
            roomError
          );

          // Retry logic for transient errors
          if (retryCount < 3 && isMounted) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`[useRealTimeCurrency] Retrying in ${delay}ms...`);
            setTimeout(() => fetchVirtualCurrency(retryCount + 1), delay);
            return;
          }

          if (isMounted) {
            setError(roomError.message);
            setIsLoading(false);
          }
          return;
        }

        console.log(
          "[useRealTimeCurrency] Virtual currency loaded:",
          room?.virtual_currency || 0
        );
        if (isMounted) {
          setVirtualCurrency(room?.virtual_currency || 0);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useRealTimeCurrency] Unexpected error:", err);
        if (isMounted) {
          setError("Failed to load virtual currency");
          setIsLoading(false);
        }
      }
    };

    // Fetch initial data
    fetchVirtualCurrency();

    // Set up real-time subscription for trading_rooms table
    const roomSubscription = supabase
      .channel("trading_rooms_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${extractedUUID}`,
        },
        (payload) => {
          console.log(
            "[useRealTimeCurrency] Room update received:",
            payload.new.virtual_currency
          );

          if (isMounted && payload.new.virtual_currency !== undefined) {
            setVirtualCurrency(payload.new.virtual_currency || 0);
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealTimeCurrency] Room subscription status:", status);
      });

    // Set up real-time subscription for trading_positions table to update currency when positions change
    const positionsSubscription = supabase
      .channel("positions_for_currency")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_positions",
          filter: `room_id=eq.${extractedUUID}`,
        },
        (payload) => {
          // If a position is closed, refresh the virtual currency
          if (
            payload.old.status === "open" &&
            payload.new.status === "closed"
          ) {
            console.log(
              "[useRealTimeCurrency] Position closed, refreshing currency"
            );
            fetchVirtualCurrency();
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "[useRealTimeCurrency] Positions subscription status:",
          status
        );
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log("[useRealTimeCurrency] Cleaning up subscriptions");
      isMounted = false;
      roomSubscription.unsubscribe();
      positionsSubscription.unsubscribe();
    };
  }, [roomId]);

  return { virtualCurrency, isLoading, error };
}
