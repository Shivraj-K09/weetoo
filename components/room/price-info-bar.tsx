"use client";

import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";
import { FundingInfo } from "./funding-info";
import { formatPrice } from "@/utils/format-utils";

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
  // Format all price values consistently as soon as they're received
  const formattedCurrentPrice =
    priceDataLoaded && priceData.currentPrice
      ? formatPrice(priceData.currentPrice)
      : "--";
  const formattedHighPrice =
    priceDataLoaded && priceData.highPrice
      ? formatPrice(priceData.highPrice)
      : "--";
  const formattedLowPrice =
    priceDataLoaded && priceData.lowPrice
      ? formatPrice(priceData.lowPrice)
      : "--";
  const formattedQuoteVolume =
    priceDataLoaded && priceData.quoteVolume
      ? formatLargeNumber(priceData.quoteVolume)
      : "--";
  const formattedVolume =
    priceDataLoaded && priceData.volume
      ? formatLargeNumber(priceData.volume)
      : "--";
  const formattedOpenInterest =
    priceDataLoaded && priceData.openInterest
      ? formatLargeNumber(priceData.openInterest)
      : "--";

  // Format price change with consistent decimal places
  const formattedPriceChange = priceDataLoaded
    ? priceData.priceChange.toFixed(2)
    : "--";
  const formattedPriceChangePercent = priceDataLoaded
    ? priceData.priceChangePercent.toFixed(2)
    : "--";

  return (
    <div className="border w-full border-[#3f445c] text-white rounded p-4 flex items-center bg-[#1a1e27]">
      {/* Symbol selector - fixed width */}
      <div className="flex flex-col gap-1.5 min-w-[8rem]">
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
        {/* Current Price - fixed width */}
        <div className="flex items-center gap-1.5 flex-col min-w-[7rem]">
          <div
            className={`flex items-center text-sm ${
              priceData.priceDirection === "up"
                ? "text-green-500"
                : priceData.priceDirection === "down"
                  ? "text-red-500"
                  : "text-white"
            }`}
          >
            <span className="min-w-[6rem] text-center">
              {formattedCurrentPrice}
            </span>
            {priceData.priceDirection === "up" && (
              <ChevronUp className="ml-1 h-4 w-4" />
            )}
            {priceData.priceDirection === "down" && (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </div>
          <span className="text-sm border-b border-dotted text-white/75 min-w-[6rem] text-center">
            ${formattedCurrentPrice}
          </span>
        </div>

        {/* 24h Change - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[8rem]">
          <span className="text-xs text-white/75">변경률(24H)</span>
          <span
            className={`text-sm min-w-[7rem] text-center ${priceData.priceChange >= 0 ? "text-green-500" : "text-red-500"}`}
          >
            {priceDataLoaded
              ? `${formattedPriceChange}(${formattedPriceChangePercent}%)`
              : "--"}
          </span>
        </div>

        {/* 24h High - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[6rem]">
          <span className="text-xs text-white/75">최고가(24H)</span>
          <span className="text-sm min-w-[5rem] text-center">
            {formattedHighPrice}
          </span>
        </div>

        {/* 24h Low - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[6rem]">
          <span className="text-xs text-white/75">최저가(24H)</span>
          <span className="text-sm min-w-[5rem] text-center">
            {formattedLowPrice}
          </span>
        </div>

        {/* Turnover - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[8rem]">
          <span className="text-xs text-white/75">
            턴오버(24H/
            {selectedSymbol ? extractCurrencies(selectedSymbol).quote : "USDT"})
          </span>
          <span className="text-sm min-w-[7rem] text-center">
            {formattedQuoteVolume}
          </span>
        </div>

        {/* Volume - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[8rem]">
          <span className="text-xs text-white/75">
            거래량(24H/
            {selectedSymbol ? extractCurrencies(selectedSymbol).base : "BTC"})
          </span>
          <span className="text-sm min-w-[7rem] text-center">
            {formattedVolume}
          </span>
        </div>

        {/* Open Interest - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[8rem]">
          <span className="text-xs text-white/75">
            미결제약정(24H/
            {selectedSymbol ? extractCurrencies(selectedSymbol).base : "BTC"})
          </span>
          <span className="text-sm min-w-[7rem] text-center">
            {formattedOpenInterest}
          </span>
        </div>

        {/* Funding Info - fixed width */}
        <div className="flex flex-col items-center gap-1.5 min-w-[12rem]">
          <span className="text-xs text-white/75">펀딩율 / 남은시간</span>
          <FundingInfo symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
}
