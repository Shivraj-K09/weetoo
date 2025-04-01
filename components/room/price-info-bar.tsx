"use client";

import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown, ZapIcon } from "lucide-react";

// Define the PriceData interface
interface PriceData {
  currentPrice: string;
  priceDirection: "up" | "down" | "none";
  priceChange: number;
  priceChangePercent: number;
  indexPrice: string;
  highPrice: string | null;
  lowPrice: string | null;
  quoteVolume: string | null;
  volume: string | null;
  openInterest: string | null;
}

// Define the FundingRateData interface
interface FundingRateData {
  rate: number | null;
  nextFundingTime: number | null;
  countdown: string | null;
}

interface PriceInfoBarProps {
  tradingPairs: string[];
  selectedSymbol: string;
  priceData: PriceData;
  priceDataLoaded: boolean;
  fundingData: FundingRateData;
  onSymbolChange: (symbol: string) => void;
  formatLargeNumber: (num: number | string) => string;
  extractCurrencies: (symbol: string) => { base: string; quote: string };
}

export function PriceInfoBar({
  tradingPairs,
  selectedSymbol,
  priceData,
  priceDataLoaded,
  fundingData,
  onSymbolChange,
  formatLargeNumber,
  extractCurrencies,
}: PriceInfoBarProps) {
  return (
    <div className="border w-full border-[#3f445c] text-white rounded p-4 flex items-center bg-[#1a1e27]">
      <div className="flex flex-col gap-1.5">
        <Select defaultValue={selectedSymbol} onValueChange={onSymbolChange}>
          <SelectTrigger className="text-white rounded h-7 border-[#494f6b] border min-w-[8rem]">
            <SelectValue placeholder="Select a symbol" className="text-white" />
          </SelectTrigger>
          <SelectContent className="bg-[#212631] text-white border-[#494f6b]">
            {tradingPairs.map((pair) => (
              <SelectItem key={pair} value={pair}>
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-white/75 text-[0.9rem]">
          USDT Futures Trading
        </span>
      </div>
      <div className="mx-5 h-15">
        <Separator className="w-full bg-[#3f445c]" orientation="vertical" />
      </div>

      <div className="flex items-center gap-9.5">
        <div className="flex items-center gap-1.5 flex-col">
          <div
            className={`flex items-center text-sm ${
              priceData.priceDirection === "up"
                ? "text-green-500"
                : priceData.priceDirection === "down"
                ? "text-red-500"
                : "text-white"
            }`}
          >
            {priceDataLoaded ? priceData.currentPrice : "--"}
            {priceData.priceDirection === "up" && (
              <ChevronUp className="ml-1 h-4 w-4" />
            )}
            {priceData.priceDirection === "down" && (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </div>
          <span className="text-sm border-b border-dotted text-white/75">
            ${priceDataLoaded ? priceData.currentPrice : "--"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">변경률(24H)</span>
          <span
            className={`text-sm ${
              priceData.priceChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {priceDataLoaded
              ? `${priceData.priceChange.toFixed(
                  2
                )}(${priceData.priceChangePercent.toFixed(2)}%)`
              : "--"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">최고가(24H)</span>
          <span className="text-sm">
            {priceDataLoaded && priceData.highPrice ? (
              priceData.highPrice
            ) : (
              <span className="text-gray-500">--</span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">최저가(24H)</span>
          <span className="text-sm">
            {priceDataLoaded && priceData.lowPrice ? (
              priceData.lowPrice
            ) : (
              <span className="text-gray-500">--</span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">
            턴오버(24H/
            {selectedSymbol ? extractCurrencies(selectedSymbol).quote : "USDT"})
          </span>
          <span className="text-sm">
            {priceDataLoaded && priceData.quoteVolume ? (
              formatLargeNumber(priceData.quoteVolume)
            ) : (
              <span className="text-gray-500">--</span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">
            거래량(24H/
            {selectedSymbol ? extractCurrencies(selectedSymbol).base : "BTC"})
          </span>
          <span className="text-sm">
            {priceDataLoaded && priceData.volume ? (
              formatLargeNumber(priceData.volume)
            ) : (
              <span className="text-gray-500">--</span>
            )}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">
            미결제약정(24H/
            {selectedSymbol ? extractCurrencies(selectedSymbol).base : "BTC"})
          </span>
          <span className="text-sm">
            {priceDataLoaded && priceData.openInterest ? (
              formatLargeNumber(priceData.openInterest)
            ) : (
              <span className="text-gray-500">--</span>
            )}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-white/75">펀딩율 / 남은시간</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-sm ${
                fundingData.rate && fundingData.rate > 0
                  ? "text-green-500"
                  : fundingData.rate && fundingData.rate < 0
                  ? "text-red-500"
                  : "text-orange-500"
              } flex items-center gap-1.5`}
            >
              <ZapIcon className="w-4 h-4" />
              {fundingData.rate !== null
                ? `${fundingData.rate.toFixed(4)}%`
                : "0.0000%"}
            </span>
            /
            <span className="text-sm">
              {fundingData.countdown || "00:00:00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
