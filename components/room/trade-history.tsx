"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function TradeHistory({ roomId }: { roomId: string }) {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchTradeHistoryRef = useRef<() => Promise<void>>(null);
  const tradesRef = useRef<any[]>([]);

  // Fetch trade history
  const fetchTradeHistory = useCallback(async () => {
    if (!roomId) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/trading/history?roomId=${roomId}&_=${Date.now()}`,
        {
          cache: "no-store",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch trade history");

      const data = await response.json();
      setTrades(data.trades || []);
      tradesRef.current = data.trades || [];
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching trade history:", error);
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchTradeHistoryRef.current = fetchTradeHistory;
  }, [fetchTradeHistory]);

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchTradeHistoryRef.current?.();

    // Set up real-time subscription
    const supabase = createClient();

    // Subscribe to trade_history table changes
    const historySubscription = supabase
      .channel("trade_history_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trade_history",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("[TradeHistory] New trade history entry:", payload.new);
          if (isMounted) {
            setTrades((prev) => {
              const newTrades = [payload.new, ...prev];
              tradesRef.current = newTrades;
              return newTrades;
            });
          }
        }
      )
      .subscribe();

    // Listen for position-closed events from useRealTimePositions
    const handlePositionClosed = (event: CustomEvent) => {
      if (event.detail.roomId === roomId) {
        console.log(
          "[TradeHistory] Position closed event received, refreshing history"
        );

        // If we have trade history data in the event, use it directly
        if (event.detail.tradeHistory) {
          setTrades((prev) => {
            const newTrades = [event.detail.tradeHistory, ...prev];
            tradesRef.current = newTrades;
            return newTrades;
          });
        } else {
          // Otherwise fetch the latest data
          fetchTradeHistoryRef.current?.();
        }
      }
    };

    window.addEventListener(
      "position-closed",
      handlePositionClosed as EventListener
    );

    // Add a listener for the trade-history-update event
    const handleTradeHistoryUpdate = (event: CustomEvent) => {
      if (event.detail.roomId === roomId) {
        console.log(
          "[TradeHistory] Direct trade history update received:",
          event.detail.trade
        );
        setTrades((prev) => {
          const newTrades = [event.detail.trade, ...prev];
          tradesRef.current = newTrades;
          return newTrades;
        });
      }
    };

    window.addEventListener(
      "trade-history-update",
      handleTradeHistoryUpdate as EventListener
    );

    // Add a listener for tab visibility changes to refresh data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[TradeHistory] Tab became visible, refreshing data");
        setTrades(tradesRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      historySubscription.unsubscribe();
      window.removeEventListener(
        "position-closed",
        handlePositionClosed as EventListener
      );
      window.removeEventListener(
        "trade-history-update",
        handleTradeHistoryUpdate as EventListener
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [roomId]);

  if (isLoading && trades.length === 0) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No trade history available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto no-scrrollbar h-[18rem]">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 text-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Symbol</th>
            <th className="px-4 py-2 text-left">Side</th>
            <th className="px-4 py-2 text-left">Size</th>
            <th className="px-4 py-2 text-left">Entry</th>
            <th className="px-4 py-2 text-left">Exit</th>
            <th className="px-4 py-2 text-right">PNL</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade.id}
              className="border-b border-gray-700 hover:bg-gray-800"
            >
              <td className="px-4 py-2">{trade.symbol}</td>
              <td className="px-4 py-2">
                <span
                  className={
                    trade.direction === "buy"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {trade.direction === "buy" ? "Long" : "Short"}
                </span>
              </td>
              <td className="px-4 py-2">${trade.position_size.toFixed(2)}</td>
              <td className="px-4 py-2">
                $
                {trade.entry_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-2">
                $
                {trade.exit_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td
                className={`px-4 py-2 text-right ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                ${trade.pnl.toFixed(2)} ({trade.pnl_percentage.toFixed(2)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
