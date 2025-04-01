"use client";

import { useState, useEffect } from "react";
import { fetchCryptoData, fetchCommodityData, fetchForexData } from "@/lib/api";
import dynamic from "next/dynamic";
import type { CurrencyData } from "@/types";

// Dynamically import TradingViewWidget with no SSR to avoid hydration issues
const TradingViewWidget = dynamic(() => import("./trading-view-widget"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1e2329]">
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  ),
});

interface DetailedChartProps {
  symbol: string;
  currencyData?: CurrencyData[]; // Add currencyData prop
}

export function DetailedChart({
  symbol,
  currencyData = [],
}: DetailedChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cryptoData, setCryptoData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [commodityData, setCommodityData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [forexData, setForexData] = useState<any>(null);

  // Find the matching currency data from the main cards
  const matchingCurrency = currencyData.find(
    (currency) => currency.symbol === symbol
  );

  // Determine which data to use based on symbol
  const isCrypto = symbol === "BTC/USD";
  const isCommodity = symbol === "Gold" || symbol === "Crude Oil WTI";
  const isForex = [
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "USD/CAD",
    "USD/CHF",
    "AUD/USD",
    "NZD/USD",
    "EUR/GBP",
    "GBP/JPY",
  ].includes(symbol);

  // Fetch live data for BTC/USD, commodities, and forex
  useEffect(() => {
    const fetchData = async () => {
      if (isCrypto) {
        try {
          const data = await fetchCryptoData();
          setCryptoData(data);
        } catch (error) {
          console.error(
            "Error fetching crypto data for detailed chart:",
            error
          );
        }
      } else if (isCommodity) {
        try {
          const data = await fetchCommodityData();
          setCommodityData(data);
        } catch (error) {
          console.error(
            "Error fetching commodity data for detailed chart:",
            error
          );
        }
      } else if (isForex) {
        try {
          const data = await fetchForexData();
          setForexData(data);
        } catch (error) {
          console.error("Error fetching forex data for detailed chart:", error);
        }
      }
    };

    // Only fetch if we don't have matching currency data
    if (!matchingCurrency) {
      fetchData();
    }
  }, [symbol, isCrypto, isCommodity, isForex, matchingCurrency]);

  // Get current price based on data source - prioritize matching currency data
  const currentPrice = matchingCurrency
    ? matchingCurrency.price
    : isCrypto && cryptoData
    ? Number.parseFloat(cryptoData.lastPrice).toFixed(2)
    : isCommodity &&
      commodityData &&
      commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"]
    ? commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"].Last
    : isForex && forexData && forexData[symbol]
    ? forexData[symbol].Bid
    : "Loading...";

  // Get price change based on data source - prioritize matching currency data
  const priceChange = matchingCurrency
    ? `${matchingCurrency.change}% (${matchingCurrency.pips})`
    : isCrypto && cryptoData
    ? `${cryptoData.priceChange > 0 ? "+" : ""}${Number.parseFloat(
        cryptoData.priceChangePercent
      ).toFixed(2)}% (${Math.abs(
        Number.parseFloat(cryptoData.priceChange)
      ).toFixed(2)})`
    : isCommodity &&
      commodityData &&
      commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"]
    ? `${
        commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"]["Chg%"]
      } (${commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"].Chg})`
    : isForex && forexData && forexData[symbol]
    ? `${forexData[symbol]["Chg. %"]} (${forexData[symbol]["Chg."]})`
    : "0.00% (0.00)";

  // Determine if price is up based on data source - prioritize matching currency data
  const isPriceUp = matchingCurrency
    ? Number.parseFloat(matchingCurrency.change) >= 0
    : isCrypto && cryptoData
    ? Number.parseFloat(cryptoData.priceChangePercent) >= 0
    : isCommodity &&
      commodityData &&
      commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"]
    ? commodityData[symbol === "Gold" ? "Gold" : "Crude Oil WTI"].Chg.includes(
        "+"
      )
    : isForex && forexData && forexData[symbol]
    ? !forexData[symbol]["Chg."].includes("-")
    : false;

  return (
    <div className="bg-[#1e2329] border-2 border-[#3c4048] rounded-md shadow-2xl overflow-hidden w-full h-full relative">
      {/* Header bar with currency symbol and current price */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#252a31] border-b border-[#3c4048] flex items-center justify-between px-3 z-10">
        <span className="text-white text-sm font-medium">{symbol}</span>
        <div className="flex items-center">
          <span className="text-white text-sm font-medium mr-2">
            {currentPrice}
          </span>
          <span
            className={`text-xs ${
              isPriceUp ? "text-green-500" : "text-red-500"
            }`}
          >
            {priceChange}
          </span>
        </div>
      </div>

      {/* TradingView Widget */}
      <div className="pt-8 h-full">
        <TradingViewWidget symbol={symbol} />
      </div>
    </div>
  );
}
