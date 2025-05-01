"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

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
  const mountedRef = useRef(true);
  const subscriptionsRef = useRef<any[]>([]);

  useEffect(() => {
    // Set mounted flag
    mountedRef.current = true;

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
          if (retryCount < 3 && mountedRef.current) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`[useRealTimeCurrency] Retrying in ${delay}ms...`);
            setTimeout(() => fetchVirtualCurrency(retryCount + 1), delay);
            return;
          }

          if (mountedRef.current) {
            setError(roomError.message);
            setIsLoading(false);
          }
          return;
        }

        console.log(
          "[useRealTimeCurrency] Virtual currency loaded:",
          room?.virtual_currency || 0
        );
        if (mountedRef.current) {
          setVirtualCurrency(room?.virtual_currency || 0);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[useRealTimeCurrency] Unexpected error:", err);
        if (mountedRef.current) {
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

          if (
            mountedRef.current &&
            payload.new.virtual_currency !== undefined
          ) {
            setVirtualCurrency(payload.new.virtual_currency || 0);
          }
        }
      )
      .subscribe((status) => {
        console.log("[useRealTimeCurrency] Room subscription status:", status);
      });

    subscriptionsRef.current.push(roomSubscription);

    // Set up real-time subscription for trading_positions table to update currency when positions change
    const positionsSubscription = supabase
      .channel("positions_for_currency")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "trading_positions",
          filter: `room_id=eq.${extractedUUID}`,
        },
        (payload) => {
          console.log(
            "[useRealTimeCurrency] Position change detected:",
            payload.eventType
          );

          // Refresh currency on any position change
          if (payload.eventType === "INSERT") {
            console.log(
              "[useRealTimeCurrency] New position created, refreshing currency"
            );
            fetchVirtualCurrency();
          } else if (payload.eventType === "UPDATE") {
            // If a position is closed or partially closed, refresh the virtual currency
            if (
              payload.old.status === "open" &&
              (payload.new.status === "closed" ||
                payload.new.status === "partially_closed")
            ) {
              console.log(
                "[useRealTimeCurrency] Position closed/partially closed, refreshing currency"
              );
              fetchVirtualCurrency();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "[useRealTimeCurrency] Positions subscription status:",
          status
        );
      });

    subscriptionsRef.current.push(positionsSubscription);

    // Set up real-time subscription for trade_history table to update currency when trades are recorded
    const tradeHistorySubscription = supabase
      .channel("trade_history_for_currency")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trade_history",
          filter: `room_id=eq.${extractedUUID}`,
        },
        () => {
          console.log(
            "[useRealTimeCurrency] New trade history entry, refreshing currency"
          );
          fetchVirtualCurrency();
        }
      )
      .subscribe((status) => {
        console.log(
          "[useRealTimeCurrency] Trade history subscription status:",
          status
        );
      });

    subscriptionsRef.current.push(tradeHistorySubscription);

    // Listen for position closed events
    const handlePositionClosed = () => {
      console.log(
        "[useRealTimeCurrency] Position closed event received, refreshing currency"
      );
      fetchVirtualCurrency();
    };

    window.addEventListener("position-closed", handlePositionClosed);

    // Listen for virtual currency update events
    const handleVirtualCurrencyUpdate = (event: any) => {
      if (event.detail?.roomId === roomId) {
        console.log(
          "[useRealTimeCurrency] Virtual currency update event received, refreshing currency"
        );
        fetchVirtualCurrency();
      }
    };

    window.addEventListener(
      "virtual-currency-update",
      handleVirtualCurrencyUpdate
    );

    // Listen for tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log(
          "[useRealTimeCurrency] Tab became visible, refreshing currency"
        );
        fetchVirtualCurrency();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup subscriptions on unmount
    return () => {
      console.log("[useRealTimeCurrency] Cleaning up subscriptions");
      mountedRef.current = false;

      // Unsubscribe from all subscriptions
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe();
      });

      window.removeEventListener("position-closed", handlePositionClosed);
      window.removeEventListener(
        "virtual-currency-update",
        handleVirtualCurrencyUpdate
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [roomId]);

  return { virtualCurrency, isLoading, error };
}
