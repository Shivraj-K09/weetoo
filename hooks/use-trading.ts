"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  executeTrade,
  closePosition,
  getRoomPositions,
  getRoomTradeHistory,
  updatePositionPrice,
} from "@/app/actions/trading-actions";
import { useVirtualCurrency } from "./use-virtual-currency";

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

interface TradeHistory {
  id: string;
  position_id: string;
  room_id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  entry_amount: number;
  leverage: number;
  position_size: number;
  trade_volume: number;
  pnl: number;
  pnl_percentage: number;
  entry_time: string;
  exit_time: string;
  created_at: string;
}

interface UseTrading {
  isLoading: boolean;
  positions: Position[];
  tradeHistory: TradeHistory[];
  executeTrade: (params: {
    roomId: string;
    symbol: string;
    direction: "buy" | "sell";
    entryAmount: number;
    leverage: number;
    entryPrice: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => Promise<{ success: boolean; message: string; positionId?: string }>;
  closePosition: (params: {
    positionId: string;
    exitPrice: number;
  }) => Promise<{
    success: boolean;
    message: string;
    pnl?: number;
    pnlPercentage?: number;
  }>;
  refreshPositions: () => Promise<void>;
  refreshTradeHistory: () => Promise<void>;
  updatePositionPrices: (currentPrice: number) => Promise<void>;
}

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  if (!uuid) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function useTrading(roomId: string, isOwner = false): UseTrading {
  const [isLoading, setIsLoading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const { subtractVirtualCurrency, addVirtualCurrency } = useVirtualCurrency(
    roomId,
    isOwner
  );
  const router = useRouter();

  // Validate roomId
  const isValidRoomId = isValidUUID(roomId);

  // Fetch positions
  const refreshPositions = useCallback(async () => {
    // Skip if roomId is not valid
    if (!isValidRoomId) {
      console.log("Skipping position fetch - invalid roomId:", roomId);
      return;
    }

    try {
      const result = await getRoomPositions(roomId);
      if (result.success) {
        setPositions(result.positions);
      } else {
        console.error("Failed to fetch positions:", result.message);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  }, [roomId, isValidRoomId]);

  // Fetch trade history
  const refreshTradeHistory = useCallback(async () => {
    // Skip if roomId is not valid
    if (!isValidRoomId) {
      console.log("Skipping trade history fetch - invalid roomId:", roomId);
      return;
    }

    try {
      const result = await getRoomTradeHistory(roomId);
      if (result.success) {
        setTradeHistory(result.trades);
      } else {
        console.error("Failed to fetch trade history:", result.message);
      }
    } catch (error) {
      console.error("Error fetching trade history:", error);
    }
  }, [roomId, isValidRoomId]);

  // Execute a trade
  const executeTradeAction = useCallback(
    async (params: {
      roomId: string;
      symbol: string;
      direction: "buy" | "sell";
      entryAmount: number;
      leverage: number;
      entryPrice: number;
      stopLoss?: number;
      takeProfit?: number;
    }) => {
      // Validate roomId in params
      if (!isValidUUID(params.roomId)) {
        toast.error("Invalid room ID");
        return { success: false, message: "Invalid room ID" };
      }

      setIsLoading(true);
      try {
        // First subtract the entry amount from virtual currency
        const subtractResult = await subtractVirtualCurrency(
          params.entryAmount
        );
        if (!subtractResult) {
          toast.error("Insufficient balance");
          return { success: false, message: "Insufficient balance" };
        }

        const result = await executeTrade(params);
        if (result.success) {
          toast.success(result.message);
          await refreshPositions();
          router.refresh();
        } else {
          // If trade failed, refund the amount
          await addVirtualCurrency(params.entryAmount);
          toast.error(result.message);
        }
        return result;
      } catch (error) {
        console.error("Error executing trade:", error);
        // Attempt to refund on error
        await addVirtualCurrency(params.entryAmount);
        toast.error("Failed to execute trade");
        return { success: false, message: "An unexpected error occurred" };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshPositions, subtractVirtualCurrency, addVirtualCurrency, router]
  );

  // Close a position
  const closePositionAction = useCallback(
    async (params: { positionId: string; exitPrice: number }) => {
      // Validate positionId
      if (!isValidUUID(params.positionId)) {
        toast.error("Invalid position ID");
        return { success: false, message: "Invalid position ID" };
      }

      setIsLoading(true);
      try {
        const result = await closePosition(params);
        if (result.success) {
          toast.success(result.message);

          // Handle PnL - add to virtual currency if positive
          if (result.pnl !== undefined) {
            if (result.pnl > 0) {
              await addVirtualCurrency(result.pnl);
            }
            // Note: negative PnL is already accounted for when opening the position
          }

          await refreshPositions();
          await refreshTradeHistory();
          router.refresh();
        } else {
          toast.error(result.message);
        }
        return result;
      } catch (error) {
        console.error("Error closing position:", error);
        toast.error("Failed to close position");
        return { success: false, message: "An unexpected error occurred" };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshPositions, refreshTradeHistory, addVirtualCurrency, router]
  );

  // Update position prices
  const updatePositionPrices = useCallback(
    async (currentPrice: number) => {
      // Skip if no positions or invalid roomId
      if (positions.length === 0 || !isValidRoomId) {
        return;
      }

      try {
        const updatePromises = positions.map((position) =>
          updatePositionPrice(position.id, currentPrice)
        );
        await Promise.all(updatePromises);
        await refreshPositions();
      } catch (error) {
        console.error("Error updating position prices:", error);
      }
    },
    [positions, refreshPositions, isValidRoomId]
  );

  // Initial data fetch
  useEffect(() => {
    if (isValidRoomId) {
      refreshPositions();
      refreshTradeHistory();
    }
  }, [refreshPositions, refreshTradeHistory, isValidRoomId]);

  return {
    isLoading,
    positions,
    tradeHistory,
    executeTrade: executeTradeAction,
    closePosition: closePositionAction,
    refreshPositions,
    refreshTradeHistory,
    updatePositionPrices,
  };
}
