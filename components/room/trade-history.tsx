"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoomTradeHistory } from "@/app/actions/trading-actions";
import { formatDistanceToNow } from "date-fns";

interface Trade {
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
}

interface TradeHistoryProps {
  roomId: string;
}

export function TradeHistory({ roomId }: TradeHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trade history
  const fetchTradeHistory = async () => {
    try {
      setIsLoading(true);
      const result = await getRoomTradeHistory(roomId);
      if (result.success) {
        setTrades(result.trades);
      }
    } catch (error) {
      console.error("Error fetching trade history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTradeHistory();
  }, [roomId]);

  // Listen for position closed events
  useEffect(() => {
    const handlePositionClosed = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.roomId === roomId) {
        console.log(
          "[TradeHistory] Position closed event detected, refreshing trade history"
        );
        fetchTradeHistory();
      }
    };

    window.addEventListener("position-closed", handlePositionClosed);
    return () => {
      window.removeEventListener("position-closed", handlePositionClosed);
    };
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#212631] p-4 rounded-md">
      {trades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No trade history</div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto h-[17rem] no-scrollbar">
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
              {trades.map((trade) => {
                const isProfitable = trade.pnl > 0;
                const timeAgo = formatDistanceToNow(new Date(trade.exit_time), {
                  addSuffix: true,
                });

                return (
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
                    <td className="px-4 py-2">
                      ${trade.position_size.toFixed(2)}
                    </td>
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
                      className={`px-4 py-2 text-right ${isProfitable ? "text-green-500" : "text-red-500"}`}
                      title={timeAgo}
                    >
                      ${Math.abs(trade.pnl).toFixed(2)} (
                      {trade.pnl_percentage.toFixed(2)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
