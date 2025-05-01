"use client";

import { useState, useEffect } from "react";
import { getDetailedBalance } from "@/app/actions/virtual-currency-actions";
import { usePositionsPnL } from "./use-position-pnl";
import type { Position } from "@/types";

export interface DetailedBalance {
  holdings: number;
  initialMargin: number;
  available: number;
  unrealizedPnl: number;
  valuation: number;
  isLoading: boolean;
}

export function useDetailedBalance(
  roomId: string,
  positions: Position[],
  currentPrice: Record<string, number>
): DetailedBalance {
  const [balanceData, setBalanceData] = useState<DetailedBalance>({
    holdings: 0,
    initialMargin: 0,
    available: 0,
    unrealizedPnl: 0,
    valuation: 0,
    isLoading: true,
  });

  // Get real-time PnL data from positions
  const { positionsPnL, totalPnL } = usePositionsPnL(positions, currentPrice);

  // Fetch detailed balance on component mount and when positions change
  useEffect(() => {
    if (!roomId) {
      setBalanceData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchDetailedBalance = async () => {
      try {
        setBalanceData((prev) => ({ ...prev, isLoading: true }));
        const result = await getDetailedBalance(roomId);

        if (result.success) {
          setBalanceData({
            holdings: result.holdings,
            initialMargin: result.initialMargin,
            available: result.available,
            // Use the real-time PnL from usePositionsPnL instead of the one from the server
            unrealizedPnl: totalPnL,
            // Recalculate valuation with the real-time PnL
            valuation: result.holdings + totalPnL,
            isLoading: false,
          });
        } else {
          console.error(
            "[useDetailedBalance] Failed to get detailed balance:",
            result.message
          );
          setBalanceData((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error(
          "[useDetailedBalance] Error fetching detailed balance:",
          error
        );
        setBalanceData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchDetailedBalance();
  }, [roomId, positions.length]);

  // Update unrealized PnL and valuation when prices change
  useEffect(() => {
    setBalanceData((prev) => ({
      ...prev,
      unrealizedPnl: totalPnL,
      valuation: prev.holdings + totalPnL,
    }));
  }, [totalPnL]);

  return balanceData;
}
