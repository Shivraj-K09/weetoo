"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, ExternalLink } from "lucide-react";
import { useState } from "react";

// Define exchange data type
type Exchange = {
  id: string;
  name: string;
  value: string;
  rate: string;
  percentage: string;
  color: string;
  trend: "up" | "down" | "neutral";
  initials: string;
};

export function ExchangeList() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Sample exchange data with more entries to demonstrate scrolling
  const exchanges: Exchange[] = [
    {
      id: "1",
      name: "Upbit",
      value: "0.00",
      rate: "XYZ",
      percentage: "38%",
      color: "#e9a8b2",
      trend: "down",
      initials: "Up",
    },
    {
      id: "2",
      name: "Binance",
      value: "0.00",
      rate: "XYZ",
      percentage: "42%",
      color: "#c74135",
      trend: "up",
      initials: "Bi",
    },
    {
      id: "3",
      name: "Coinbase",
      value: "0.00",
      rate: "XYZ",
      percentage: "35%",
      color: "#e9a8b2",
      trend: "neutral",
      initials: "Co",
    },
    {
      id: "4",
      name: "Kraken",
      value: "0.00",
      rate: "XYZ",
      percentage: "41%",
      color: "#c74135",
      trend: "up",
      initials: "Kr",
    },
    {
      id: "5",
      name: "Bithumb",
      value: "0.00",
      rate: "XYZ",
      percentage: "40%",
      color: "#d5828e",
      trend: "up",
      initials: "Bi",
    },
    {
      id: "6",
      name: "Gemini",
      value: "0.00",
      rate: "XYZ",
      percentage: "39%",
      color: "#c74135",
      trend: "up",
      initials: "Ge",
    },
    {
      id: "7",
      name: "Huobi",
      value: "0.00",
      rate: "XYZ",
      percentage: "37%",
      color: "#e9a8b2",
      trend: "down",
      initials: "Hu",
    },
    {
      id: "8",
      name: "KuCoin",
      value: "0.00",
      rate: "XYZ",
      percentage: "43%",
      color: "#d5828e",
      trend: "up",
      initials: "Ku",
    },
    {
      id: "9",
      name: "OKX",
      value: "0.00",
      rate: "XYZ",
      percentage: "36%",
      color: "#c74135",
      trend: "neutral",
      initials: "OK",
    },
    {
      id: "10",
      name: "Bybit",
      value: "0.00",
      rate: "XYZ",
      percentage: "44%",
      color: "#e9a8b2",
      trend: "up",
      initials: "By",
    },
  ];

  // Function to render trend indicator
  const renderTrendIndicator = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-emerald-500" />;
      case "down":
        return (
          <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />
        );
      default:
        return <BarChart3 className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <section
      aria-label="Exchange List"
      className="bg-[#f1ebf8] rounded-xl border border-purple-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-[#65558f] flex items-center justify-center">
            <span className="text-xs font-medium text-white">E</span>
          </div>
          <h3 className="text-sm font-medium text-[#65558f]">Exchange Rates</h3>
        </div>
        <span className="text-xs text-gray-500">Last updated: Just now</span>
      </header>

      {/* Exchange list with scrolling */}
      <div className="h-[280px] overflow-y-auto no-scrollbar scrollbar-thin scrollbar-thumb-[#65558f]/20 scrollbar-track-transparent">
        <div className="p-2 space-y-1">
          {exchanges.map((exchange) => (
            <div
              key={exchange.id}
              className="flex justify-between w-full items-center p-2 rounded-lg transition-all duration-200 hover:bg-white/40"
              onMouseEnter={() => setHoveredItem(exchange.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs"
                  style={{ background: `${exchange.color}` }}
                >
                  {exchange.initials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800">
                      {exchange.name}
                    </span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {exchange.value}
                    </span>
                    {renderTrendIndicator(exchange.trend)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">{exchange.rate}</span>
                  <span className="font-semibold text-sm text-[#65558f]">
                    {exchange.percentage}
                  </span>
                </div>

                <Button className="rounded-full h-7 px-3 bg-[#65558f] text-white text-xs hover:bg-[#574a7b] cursor-pointer">
                  신청하기
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
