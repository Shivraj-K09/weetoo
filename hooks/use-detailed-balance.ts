"use client";

import { useState, useEffect, useCallback } from "react";
import { getRoomBalanceDetails } from "@/app/actions/trading-actions";
import { supabase } from "@/lib/supabase/client";

interface Position {
  id: string;
  symbol: string;
  direction: "buy" | "sell";
  initialMargin: number;
  leverage: number;
  entry_price: number;
  position_size: number;
}

interface BalanceDetails {
  holdings: number;
  lockedMargin: number;
  available: number;
  unrealizedPnl: number;
  valuation: number;
  positions: Position[];
}

interface UseDetailedBalance {
  isLoading: boolean;
  balanceDetails: BalanceDetails;
  refreshBalance: () => Promise<void>;
}

const defaultBalanceDetails: BalanceDetails = {
  holdings: 0,
  lockedMargin: 0,
  available: 0,
  unrealizedPnl: 0,
  valuation: 0,
  positions: [],
};

export function useDetailedBalance(roomId: string): UseDetailedBalance {
  const [isLoading, setIsLoading] = useState(false);
  const [balanceDetails, setBalanceDetails] = useState<BalanceDetails>(
    defaultBalanceDetails
  );

  // Function to fetch positions
  const fetchPositions = useCallback(async () => {
    if (!roomId) return [];

    try {
      const { data, error } = await supabase
        .from("trading_positions")
        .select("*")
        .eq("room_id", roomId)
        .eq("status", "open");

      if (error) {
        console.error("[useDetailedBalance] Error fetching positions:", error);
        return [];
      }

      return (data || []).map((pos) => ({
        id: pos.id,
        symbol: pos.symbol,
        direction: pos.direction,
        initialMargin: pos.initial_margin || 0,
        leverage: pos.leverage || 1,
        entry_price: pos.entry_price || 0,
        position_size: pos.position_size || 0,
      }));
    } catch (err) {
      console.error("[useDetailedBalance] Error fetching positions:", err);
      return [];
    }
  }, [roomId]);

  const refreshBalance = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    try {
      // Fetch balance details from server
      const result = await getRoomBalanceDetails(roomId);

      // Fetch positions
      const positions = await fetchPositions();

      if (result.success && result.balance) {
        console.log("[useDetailedBalance] Fetched balance:", result);

        // Ensure all values are valid numbers
        const sanitizedBalance = {
          holdings:
            typeof result.balance.holdings === "number" &&
            !isNaN(result.balance.holdings)
              ? result.balance.holdings
              : 0,
          lockedMargin:
            typeof result.balance.lockedMargin === "number" &&
            !isNaN(result.balance.lockedMargin)
              ? result.balance.lockedMargin
              : 0,
          available:
            typeof result.balance.available === "number" &&
            !isNaN(result.balance.available)
              ? result.balance.available
              : 0,
          unrealizedPnl:
            typeof result.balance.unrealizedPnl === "number" &&
            !isNaN(result.balance.unrealizedPnl)
              ? result.balance.unrealizedPnl
              : 0,
          valuation:
            typeof result.balance.valuation === "number" &&
            !isNaN(result.balance.valuation)
              ? result.balance.valuation
              : 0,
          positions: positions,
        };

        setBalanceDetails(sanitizedBalance);
      } else {
        console.error(
          "[useDetailedBalance] Failed to get detailed balance:",
          result.message
        );
        // Keep the current values but update positions
        setBalanceDetails((prev) => ({
          ...prev,
          positions: positions,
        }));
      }
    } catch (error) {
      console.error(
        "[useDetailedBalance] Error fetching detailed balance:",
        error
      );
      // Keep the current values on error
    } finally {
      setIsLoading(false);
    }
  }, [roomId, fetchPositions]);

  // Initial fetch
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Listen for virtual currency updates
  useEffect(() => {
    const handleVirtualCurrencyUpdate = (event: CustomEvent) => {
      if (event.detail?.roomId === roomId) {
        refreshBalance();
      }
    };

    // Listen for position updates that might affect balance
    const handlePositionUpdate = (event: CustomEvent) => {
      if (event.detail?.roomId === roomId) {
        refreshBalance();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "virtual-currency-update",
        handleVirtualCurrencyUpdate as EventListener
      );
      window.addEventListener(
        "new-position-created",
        handlePositionUpdate as EventListener
      );
      window.addEventListener(
        "position-closed",
        handlePositionUpdate as EventListener
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "virtual-currency-update",
          handleVirtualCurrencyUpdate as EventListener
        );
        window.removeEventListener(
          "new-position-created",
          handlePositionUpdate as EventListener
        );
        window.removeEventListener(
          "position-closed",
          handlePositionUpdate as EventListener
        );
      }
    };
  }, [roomId, refreshBalance]);

  // Set up real-time subscription for positions
  useEffect(() => {
    if (!roomId) return;

    console.log(
      "[useDetailedBalance] Setting up subscription for room:",
      roomId
    );

    // Set up real-time subscription
    const subscription = supabase
      .channel(`positions_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trading_positions",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Refresh balance when positions change
          refreshBalance();
        }
      )
      .subscribe((status) => {
        console.log("[useDetailedBalance] Subscription status:", status);
      });

    return () => {
      console.log("[useDetailedBalance] Cleaning up subscription");
      supabase.removeChannel(subscription);
    };
  }, [roomId, refreshBalance]);

  return {
    isLoading,
    balanceDetails,
    refreshBalance,
  };
}
