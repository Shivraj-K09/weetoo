"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useMemo } from "react";

interface TradeHistoryItem {
  id: string;
  price: string;
  quantity: string;
  time: number;
  isBuyer: boolean;
}

interface RecentTradesProps {
  trades: TradeHistoryItem[];
  pricePrecision?: string;
  symbol?: string;
}

export function RecentTrades({
  trades,
  pricePrecision = "0.01",
  symbol = "BTCUSDT",
}: RecentTradesProps) {
  // Parse the trading pair to get base and quote currencies
  const baseCurrency = symbol.replace(/USDT$/, "") || "BTC";
  const quoteCurrency = "USDT";

  // Get decimal places based on price precision
  const getPriceDecimals = () => {
    switch (pricePrecision) {
      case "0.01":
        return 2;
      case "0.1":
        return 1;
      case "1":
        return 0;
      default:
        return 2;
    }
  };

  // Format price with the selected precision
  const formatPrice = (price: string) => {
    return Number.parseFloat(price).toFixed(getPriceDecimals());
  };

  // Format time to HH:MM:SS
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Process trades to add price direction indicators
  const processedTrades = useMemo(() => {
    if (trades.length === 0) return [];

    let lastDirection = "none";
    // Remove this line: let lastPrice = Number.parseFloat(trades[0].price);

    return trades.map((trade, index) => {
      const currentPrice = Number.parseFloat(trade.price);
      let direction = "none";

      // Determine direction compared to previous trade
      if (index > 0) {
        const prevPrice = Number.parseFloat(trades[index - 1].price);

        if (currentPrice > prevPrice) {
          direction = "up";
        } else if (currentPrice < prevPrice) {
          direction = "down";
        }

        // Only show arrow if direction changed or every 3rd trade
        if (direction === lastDirection && index % 3 !== 0) {
          direction = "none";
        }

        lastDirection = direction !== "none" ? direction : lastDirection;
      }

      return {
        ...trade,
        direction,
      };
    });
  }, [trades]);

  return (
    <div className="text-white w-full h-[42rem] flex flex-col">
      <div className="flex text-xs text-gray-400 mb-1 px-1">
        <div className="w-[100px]">Price ({quoteCurrency})</div>
        <div className="w-[100px]">Qty ({baseCurrency})</div>
        <div className="w-[90px]">Time</div>
      </div>

      {/* Trade History */}
      <div className="overflow-y-auto flex-1">
        {processedTrades.map((trade) => (
          <div
            key={trade.id}
            className="flex text-xs py-0.5 px-1 hover:bg-gray-800"
          >
            <div
              className={`w-[100px] flex items-center ${
                trade.isBuyer ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatPrice(trade.price)}
              {trade.direction === "up" && (
                <ChevronUp className="ml-1 h-3 w-3 text-green-500" />
              )}
              {trade.direction === "down" && (
                <ChevronDown className="ml-1 h-3 w-3 text-red-500" />
              )}
            </div>
            <div className="w-[100px]">
              {Number.parseFloat(trade.quantity).toFixed(6)}
            </div>
            <div className="w-[90px]">{formatTime(trade.time)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
