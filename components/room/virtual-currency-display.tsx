"use client";

import { useEffect, useState } from "react";
import { useVirtualCurrency } from "@/hooks/use-virtual-currency";
import { useDetailedBalance } from "@/hooks/use-detailed-balance";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/format-utils";
import { supabase } from "@/lib/supabase/client";

interface VirtualCurrencyDisplayProps {
  roomId: string;
  isOwner?: boolean;
}

export function VirtualCurrencyDisplay({
  roomId,
  isOwner = false,
}: VirtualCurrencyDisplayProps) {
  const { virtualCurrency, isLoading: isLoadingVC } = useVirtualCurrency(
    roomId,
    isOwner
  );
  const { balanceDetails, isLoading: isLoadingBalance } =
    useDetailedBalance(roomId);
  const [isClient, setIsClient] = useState(false);
  const [realTimePositions, setRealTimePositions] = useState<any[]>([]);
  const [realTimePnL, setRealTimePnL] = useState(0);

  // Safe formatting function to prevent NaN display and handle small decimals
  const safeFormatCurrency = (value: any) => {
    if (value === undefined || value === null || isNaN(value)) {
      return formatCurrency(0);
    }

    // For very small values (less than 0.01), show more decimal places
    if (Math.abs(value) > 0 && Math.abs(value) < 0.01) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(value);
    }

    return formatCurrency(value);
  };

  // Set up real-time subscription for positions
  useEffect(() => {
    if (!roomId) return;

    console.log(
      "[VirtualCurrencyDisplay] Setting up subscription for room:",
      roomId
    );

    // Initial fetch of positions
    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from("trading_positions")
          .select("*")
          .eq("room_id", roomId)
          .eq("status", "open");

        if (error) {
          console.error(
            "[VirtualCurrencyDisplay] Error fetching positions:",
            error
          );
          return;
        }

        console.log("[VirtualCurrencyDisplay] Fetched positions:", data);
        setRealTimePositions(data || []);

        // Calculate PnL from positions
        const pnl = (data || []).reduce(
          (sum, pos) => sum + (pos.current_pnl || 0),
          0
        );
        console.log("[VirtualCurrencyDisplay] Calculated PnL:", pnl);
        setRealTimePnL(pnl);
      } catch (err) {
        console.error("[VirtualCurrencyDisplay] Error:", err);
      }
    };

    fetchPositions();

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
        (payload) => {
          console.log(
            "[VirtualCurrencyDisplay] Real-time update:",
            payload.eventType,
            payload
          );

          if (payload.eventType === "INSERT") {
            if (payload.new.status === "open") {
              setRealTimePositions((current) => [payload.new, ...current]);
            }
          } else if (payload.eventType === "UPDATE") {
            setRealTimePositions((current) =>
              current.map((pos) =>
                pos.id === payload.new.id ? { ...pos, ...payload.new } : pos
              )
            );
          } else if (payload.eventType === "DELETE") {
            setRealTimePositions((current) =>
              current.filter((pos) => pos.id !== payload.old.id)
            );
          }

          // Recalculate PnL after any change
          fetchPositions();
        }
      )
      .subscribe((status) => {
        console.log("[VirtualCurrencyDisplay] Subscription status:", status);
      });

    return () => {
      console.log("[VirtualCurrencyDisplay] Cleaning up subscription");
      supabase.removeChannel(subscription);
    };
  }, [roomId]);

  // Calculate total initial margin from real-time positions using the CORRECT formula:
  // Initial Margin = (Position Size ÷ Leverage) + (Position Size × Fee Rate)
  const totalInitialMargin = realTimePositions.reduce((sum, position) => {
    // Use the stored initial_margin value if available
    if (position.initial_margin !== undefined && position.initial_margin > 0) {
      return sum + position.initial_margin;
    }

    // Calculate the margin using the correct formula
    const feeRate = position.order_type === "market" ? 0.0006 : 0.0002;
    const leverage = position.leverage || 1; // Default to 1x if not specified

    // Calculate margin requirement and trading fee
    const marginRequirement = position.position_size / leverage;
    const tradingFee = position.position_size * feeRate;
    const calculatedMargin = marginRequirement + tradingFee;

    return sum + calculatedMargin;
  }, 0);

  // Calculate holdings (total funds including locked margin)
  const calculatedHoldings = balanceDetails.available + totalInitialMargin;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log(
      "[VirtualCurrencyDisplay] Real-time positions:",
      realTimePositions
    );
    console.log("[VirtualCurrencyDisplay] Real-time PnL:", realTimePnL);
    console.log("[VirtualCurrencyDisplay] Balance Details:", balanceDetails);
    console.log(
      "[VirtualCurrencyDisplay] Total Initial Margin:",
      totalInitialMargin
    );
    console.log(
      "[VirtualCurrencyDisplay] Calculated Holdings:",
      calculatedHoldings
    );
  }, [
    realTimePositions,
    realTimePnL,
    balanceDetails,
    totalInitialMargin,
    calculatedHoldings,
  ]);

  if (!isClient) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="font-medium">Balance:</span>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 text-sm cursor-help">
            <span className="font-medium">Available:</span>
            <span>
              {isLoadingBalance || isLoadingVC
                ? "Loading..."
                : safeFormatCurrency(balanceDetails.available)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-4 space-y-2 w-64">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Holdings:</div>
            <div className="text-sm font-medium text-right">
              {safeFormatCurrency(calculatedHoldings)}
            </div>

            <div className="text-sm text-muted-foreground">Initial Margin:</div>
            <div className="text-sm font-medium text-right">
              {safeFormatCurrency(totalInitialMargin)}
            </div>

            <div className="text-sm text-muted-foreground">Available:</div>
            <div className="text-sm font-medium text-right">
              {safeFormatCurrency(balanceDetails.available)}
            </div>

            <div className="text-sm text-muted-foreground">Unrealized P&L:</div>
            <div
              className={`text-sm font-medium text-right ${
                realTimePnL > 0
                  ? "text-green-500"
                  : realTimePnL < 0
                    ? "text-red-500"
                    : ""
              }`}
            >
              {safeFormatCurrency(realTimePnL)}
            </div>

            <div className="text-sm text-muted-foreground border-t pt-1 mt-1">
              Valuation:
            </div>
            <div className="text-sm font-medium text-right border-t pt-1 mt-1">
              {safeFormatCurrency(calculatedHoldings + realTimePnL)}
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
            <p>
              Initial Margin = (Position Size ÷ Leverage) + (Position Size × Fee
              Rate)
            </p>
            <p>Position Size is the amount in USDT you're trading</p>
            <p>Market Orders: 0.06% fee | Limit Orders: 0.02% fee</p>
          </div>

          {realTimePositions.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-sm font-medium mb-1">Position Margins:</div>
              <div className="max-h-40 overflow-y-auto">
                {realTimePositions.map((position) => {
                  // Calculate margin for each position
                  const feeRate =
                    position.order_type === "market" ? 0.0006 : 0.0002;
                  const leverage = position.leverage || 1;

                  // Use stored initial_margin if available, otherwise calculate
                  const margin =
                    position.initial_margin !== undefined &&
                    position.initial_margin > 0
                      ? position.initial_margin
                      : position.position_size / leverage +
                        position.position_size * feeRate;

                  return (
                    <div
                      key={position.id}
                      className="grid grid-cols-2 gap-1 text-xs py-1"
                    >
                      <div>
                        {position.symbol}{" "}
                        {position.direction === "buy" ? "Long" : "Short"}:
                      </div>
                      <div className="text-right">
                        {safeFormatCurrency(margin)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
