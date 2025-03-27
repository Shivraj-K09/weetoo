"use client";

import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import type { CurrencyData } from "@/types";
import { LineChart } from "./line-chart";

interface CurrencyCardProps {
  data: CurrencyData;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function CurrencyCard({
  data,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: CurrencyCardProps) {
  const isPositive = Number.parseFloat(data.change) >= 0;
  const backgroundColor =
    data.backgroundColor ||
    (data.symbol.includes("JPY") || data.symbol.includes("NZD")
      ? "bg-[#3d2e3b]"
      : data.symbol.includes("BTC") ||
        data.symbol.includes("GOLD") ||
        data.symbol.includes("OIL")
      ? "bg-[#2e3d33]"
      : "bg-[#2c3038]");

  // Add very subtle border color based on trend
  const borderColor = isPositive
    ? "border-green-900/30" // Very dark, semi-transparent green
    : "border-red-900/30"; // Very dark, semi-transparent red

  // Add gradient overlay based on card type
  const gradientOverlay =
    data.symbol.includes("JPY") || data.symbol.includes("NZD")
      ? "bg-gradient-to-br from-[#3d2e3b]/50 to-[#3d2e3b]"
      : data.symbol.includes("BTC") ||
        data.symbol.includes("GOLD") ||
        data.symbol.includes("OIL")
      ? "bg-gradient-to-br from-[#2e3d33]/50 to-[#2e3d33]"
      : "bg-gradient-to-br from-[#2c3038]/50 to-[#2c3038]";

  return (
    <div
      className={`${backgroundColor} rounded-md overflow-hidden transition-all duration-300 border ${borderColor} ${
        isHovered ? "ring-1 ring-yellow-500" : ""
      } hover:shadow-lg cursor-pointer relative group`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ height: "100%" }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 ${gradientOverlay} opacity-50`}></div>

      {/* Card content */}
      <div className="relative z-10 p-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="text-sm font-medium text-white">{data.symbol}</div>
          </div>
          <div className="flex items-center">
            <span
              className={`text-xs font-medium flex items-center ${
                isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUpIcon className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDownIcon className="w-3 h-3 mr-1" />
              )}
              <span className="font-bold">
                {isPositive ? "+" : ""}
                {data.change}%
              </span>
            </span>
            <span className="text-xs text-gray-400 ml-1">• {data.pips}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-bold text-white">{data.price}</div>
          <div className="text-xs text-gray-400 text-right">
            <div className="flex items-center justify-end">
              <span
                className={`w-2 h-2 ${
                  isPositive ? "bg-green-500" : "bg-red-500"
                } rounded-full mr-1`}
              ></span>
              <span>H {data.high}</span>
            </div>
            <div className="flex items-center justify-end mt-0.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
              <span>L {data.low}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-16 relative">
          <LineChart
            data={data.chartData}
            color={isPositive ? "#22c55e" : "#ef4444"}
          />

          {/* Subtle highlight on hover */}
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
}
