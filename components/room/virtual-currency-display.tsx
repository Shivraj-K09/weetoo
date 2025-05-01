"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Position as PositionType } from "@/types";

// Extend the Position type to ensure it has the properties we need
interface Position extends PositionType {
  initial_margin?: number;
  order_type?: "market" | "limit";
}

interface VirtualCurrencyDisplayProps {
  roomId: string;
  currentPrice?: number | Record<string, number>;
  isOwner?: boolean;
}

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

// Calculate PnL for a single position
function calculatePositionPnL(
  position: Position,
  price: number
): { pnl: number; pnlPercentage: number } {
  if (!position || !price) {
    return { pnl: 0, pnlPercentage: 0 };
  }

  let pnl = 0;
  let pnlPercentage = 0;

  // Calculate P&L based on direction
  if (position.direction === "buy") {
    // For long positions: (current_price - entry_price) / entry_price * position_size
    pnl =
      ((price - position.entry_price) / position.entry_price) *
      position.position_size;
  } else {
    // For short positions: (entry_price - current_price) / entry_price * position_size
    pnl =
      ((position.entry_price - price) / position.entry_price) *
      position.position_size;
  }

  // Calculate P&L percentage relative to the entry amount
  pnlPercentage = (pnl / position.entry_amount) * 100;

  console.log(
    `[PnL Calc] Position ${position.id}: ${position.direction} ${position.symbol} at ${position.entry_price} -> ${price} = $${pnl.toFixed(2)} (${pnlPercentage.toFixed(2)}%)`
  );

  return { pnl, pnlPercentage };
}

// Calculate total PnL for all positions
function calculateTotalPnL(
  positions: Position[],
  prices: Record<string, number>
): number {
  if (!positions || positions.length === 0) {
    return 0;
  }

  let totalPnL = 0;

  positions.forEach((position) => {
    // Get the price for this position's symbol
    const price = prices[position.symbol] || Object.values(prices)[0] || 0;
    if (price > 0) {
      const { pnl } = calculatePositionPnL(position, price);
      totalPnL += pnl;
    }
  });

  return totalPnL;
}

export function VirtualCurrencyDisplay({
  roomId,
  currentPrice,
  isOwner,
}: VirtualCurrencyDisplayProps) {
  const [holdings, setHoldings] = useState<number>(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPnL, setTotalPnL] = useState<number>(0);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const positionsRef = useRef<Position[]>([]);
  const pricesRef = useRef<Record<string, number>>({});

  // Convert currentPrice to a record if it's a number
  useEffect(() => {
    if (typeof currentPrice === "number") {
      setPrices({ default: currentPrice });
    } else if (currentPrice && typeof currentPrice === "object") {
      setPrices(currentPrice);
    }
  }, [currentPrice]);

  // Direct fetch from Supabase
  useEffect(() => {
    async function fetchVirtualCurrency() {
      setIsLoading(true);
      setError(null);

      try {
        // Extract UUID if needed
        const extractedUUID = extractUUID(roomId) || roomId;
        console.log(
          "[VirtualCurrency] Fetching virtual currency for room:",
          roomId,
          "Extracted UUID:",
          extractedUUID
        );

        // Direct query to get virtual currency
        const { data, error } = await supabase
          .from("trading_rooms")
          .select("virtual_currency")
          .eq("id", extractedUUID)
          .single();

        console.log("[VirtualCurrency] Virtual currency query result:", {
          data,
          error,
        });

        if (error) {
          throw error;
        }

        // Set the holdings value
        const virtualCurrency = data?.virtual_currency || 0;
        console.log(
          "[VirtualCurrency] Setting virtual currency to:",
          virtualCurrency
        );
        setHoldings(virtualCurrency);
      } catch (err: any) {
        console.error(
          "[VirtualCurrency] Error fetching virtual currency:",
          err
        );
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchPositions() {
      try {
        // Extract UUID if needed
        const extractedUUID = extractUUID(roomId) || roomId;

        // Direct query to get positions
        const { data, error } = await supabase
          .from("trading_positions")
          .select("*")
          .eq("room_id", extractedUUID)
          .eq("status", "open")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        console.log(
          "[VirtualCurrency] Positions query result:",
          data?.length || 0,
          "positions"
        );

        if (data && data.length > 0) {
          console.log("[VirtualCurrency] First position:", {
            id: data[0].id,
            symbol: data[0].symbol,
            direction: data[0].direction,
            entry_price: data[0].entry_price,
            position_size: data[0].position_size,
          });
        }

        setPositions(data || []);
        positionsRef.current = data || [];

        // Calculate PnL with the current prices
        if (
          data &&
          data.length > 0 &&
          Object.keys(pricesRef.current).length > 0
        ) {
          const newTotalPnL = calculateTotalPnL(data, pricesRef.current);
          console.log("[VirtualCurrency] Calculated total PnL:", newTotalPnL);
          setTotalPnL(newTotalPnL);
        }
      } catch (err: any) {
        console.error("[VirtualCurrency] Error fetching positions:", err);
      }
    }

    fetchVirtualCurrency();
    fetchPositions();

    // Set up real-time subscription for virtual currency updates
    const roomSubscription = supabase
      .channel(`trading_rooms_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${extractUUID(roomId) || roomId}`,
        },
        (payload) => {
          console.log(
            "[VirtualCurrency] Virtual currency change detected:",
            payload
          );
          if (payload.new.virtual_currency !== undefined) {
            setHoldings(payload.new.virtual_currency);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for position updates
    const positionsSubscription = supabase
      .channel(`trading_positions_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trading_positions",
          filter: `room_id=eq.${extractUUID(roomId) || roomId}`,
        },
        (payload) => {
          console.log("[VirtualCurrency] Position change detected:", payload);

          if (payload.eventType === "INSERT" && payload.new.status === "open") {
            setPositions((prev) => {
              const newPositions = [payload.new as Position, ...prev];
              positionsRef.current = newPositions;

              // Recalculate PnL
              if (Object.keys(pricesRef.current).length > 0) {
                const newTotalPnL = calculateTotalPnL(
                  newPositions,
                  pricesRef.current
                );
                setTotalPnL(newTotalPnL);
              }

              return newPositions;
            });
          } else if (payload.eventType === "UPDATE") {
            if (payload.new.status === "open") {
              setPositions((prev) => {
                const newPositions = prev.map((pos) =>
                  pos.id === payload.new.id ? { ...pos, ...payload.new } : pos
                );
                positionsRef.current = newPositions;

                // Recalculate PnL
                if (Object.keys(pricesRef.current).length > 0) {
                  const newTotalPnL = calculateTotalPnL(
                    newPositions,
                    pricesRef.current
                  );
                  setTotalPnL(newTotalPnL);
                }

                return newPositions;
              });
            } else {
              // Position closed
              setPositions((prev) => {
                const newPositions = prev.filter(
                  (pos) => pos.id !== payload.old.id
                );
                positionsRef.current = newPositions;

                // Recalculate PnL
                if (Object.keys(pricesRef.current).length > 0) {
                  const newTotalPnL = calculateTotalPnL(
                    newPositions,
                    pricesRef.current
                  );
                  setTotalPnL(newTotalPnL);
                }

                return newPositions;
              });
              // Refresh virtual currency
              fetchVirtualCurrency();
            }
          } else if (payload.eventType === "DELETE") {
            setPositions((prev) => {
              const newPositions = prev.filter(
                (pos) => pos.id !== payload.old.id
              );
              positionsRef.current = newPositions;

              // Recalculate PnL
              if (Object.keys(pricesRef.current).length > 0) {
                const newTotalPnL = calculateTotalPnL(
                  newPositions,
                  pricesRef.current
                );
                setTotalPnL(newTotalPnL);
              }

              return newPositions;
            });
          }
        }
      )
      .subscribe();

    // Listen for custom events
    const handlePositionClosed = () => {
      fetchVirtualCurrency();
      fetchPositions();
    };

    const handleVirtualCurrencyUpdate = () => {
      fetchVirtualCurrency();
    };

    window.addEventListener("position-closed", handlePositionClosed);
    window.addEventListener(
      "virtual-currency-update",
      handleVirtualCurrencyUpdate
    );
    window.addEventListener(
      "new-position-created",
      handleVirtualCurrencyUpdate
    );

    return () => {
      // Clean up subscriptions and event listeners
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(positionsSubscription);
      window.removeEventListener("position-closed", handlePositionClosed);
      window.removeEventListener(
        "virtual-currency-update",
        handleVirtualCurrencyUpdate
      );
      window.removeEventListener(
        "new-position-created",
        handleVirtualCurrencyUpdate
      );
    };
  }, [roomId]);

  // Update prices reference and recalculate PnL when prices change
  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      pricesRef.current = prices;

      // Only recalculate if we have positions
      if (positions.length > 0) {
        const newTotalPnL = calculateTotalPnL(positions, prices);
        console.log(
          "[VirtualCurrency] Price update - recalculated PnL:",
          newTotalPnL,
          "with prices:",
          prices
        );
        setTotalPnL(newTotalPnL);
      }
    }
  }, [prices, positions]);

  // Calculate total initial margin from all open positions
  const totalInitialMargin =
    positions?.reduce((total, position) => {
      // Calculate fee rate based on order type (default to market order fee)
      const feeRate = position.order_type === "market" ? 0.0006 : 0.0002;

      // Use stored initial_margin if available, otherwise calculate it
      const margin =
        position.initial_margin !== undefined
          ? position.initial_margin
          : position.entry_amount + position.entry_price * (feeRate || 0.0006);

      return total + margin;
    }, 0) || 0;

  // Calculate available balance
  const availableBalance = (holdings || 0) - totalInitialMargin;

  // Calculate total valuation (holdings + unrealized PnL)
  const totalValuation = (holdings || 0) + (totalPnL || 0);

  // Debug output
  console.log("[VirtualCurrency] Render state:", {
    holdings,
    positions: positions.length,
    totalPnL,
    prices,
    totalInitialMargin,
    availableBalance,
    totalValuation,
  });

  if (isLoading) {
    return (
      <div className="bg-[#212631] p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Account Balance</h2>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    console.error("[VirtualCurrency] Error:", error);
  }

  return (
    <div className="virtual-currency-display">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold">Account Balance</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-gray-400 cursor-help">
                <InfoIcon size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="w-64 p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Holdings:</span>
                  <span className="font-medium">
                    ${(holdings || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Initial Margin:</span>
                  <span className="font-medium">
                    ${totalInitialMargin.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Available:</span>
                  <span className="font-medium">
                    ${availableBalance.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Unrealized P&L:</span>
                    <span
                      className={
                        totalPnL >= 0 ? "text-green-500" : "text-red-500"
                      }
                    >
                      {totalPnL >= 0 ? "+" : "-"}$
                      {Math.abs(totalPnL || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-300">Valuation:</span>
                  <span
                    className={
                      totalValuation >= (holdings || 0)
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    ${totalValuation.toFixed(2)}
                  </span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Main balance display */}
      <div className="flex justify-between items-center gap-2">
        <span className="text-base font-bold">
          ${(holdings || 0).toFixed(2)}
        </span>
        <span
          className={`text-sm ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}
        >
          {totalPnL >= 0 ? "+" : ""}
          {totalPnL.toFixed(2)} (P&L)
        </span>
      </div>
    </div>
  );
}
