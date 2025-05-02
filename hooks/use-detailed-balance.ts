"use client";

import { useState, useEffect, useCallback } from "react";
import { getRoomBalanceDetails } from "@/app/actions/trading-actions";

interface BalanceDetails {
  holdings: number;
  lockedMargin: number;
  available: number;
  unrealizedPnl: number;
  valuation: number;
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
};

export function useDetailedBalance(roomId: string): UseDetailedBalance {
  const [isLoading, setIsLoading] = useState(false);
  const [balanceDetails, setBalanceDetails] = useState<BalanceDetails>(
    defaultBalanceDetails
  );

  const refreshBalance = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);
    try {
      const result = await getRoomBalanceDetails(roomId);

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
        };

        setBalanceDetails(sanitizedBalance);
      } else {
        console.error(
          "[useDetailedBalance] Failed to get detailed balance:",
          result.message
        );
        // Keep the current values on error
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
  }, [roomId]);

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

  return {
    isLoading,
    balanceDetails,
    refreshBalance,
  };
}
