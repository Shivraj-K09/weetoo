"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CurrencyCard } from "./currency-card";
import { DetailedChart } from "./detailed-chart";
import { currencyData as staticCurrencyData } from "@/lib/data";
import {
  fetchCryptoData,
  fetchCommodityData,
  fetchForexData,
  convertBinanceDataToCurrencyData,
  convertCommodityDataToCurrencyData,
  convertForexDataToCurrencyData,
} from "@/lib/api";
import type { CurrencyData } from "@/types";

export function FinancialDashboard() {
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>(() => {
    // Initialize with static data for non-API currencies
    return staticCurrencyData;
  });

  // Chart data state for each currency type
  const [cryptoChartData, setCryptoChartData] = useState<number[]>([]);
  const [goldChartData, setGoldChartData] = useState<number[]>([]);
  const [oilChartData, setOilChartData] = useState<number[]>([]);

  // Forex chart data
  const [forexChartData, setForexChartData] = useState<
    Record<string, number[]>
  >({
    "EUR/USD": [],
    "GBP/USD": [],
    "USD/JPY": [],
    "USD/CAD": [],
    "USD/CHF": [],
    "AUD/USD": [],
    "NZD/USD": [],
    "EUR/GBP": [],
    "GBP/JPY": [],
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch crypto, commodity, and forex data on component mount and set up interval
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch crypto data
        const cryptoData = await fetchCryptoData();
        const convertedCryptoData = convertBinanceDataToCurrencyData(
          cryptoData,
          cryptoChartData
        );
        setCryptoChartData(convertedCryptoData.chartData);

        // Fetch commodity data from the user's API route
        const commodityData = await fetchCommodityData();

        // Process Gold data if available
        let convertedGoldData = null;
        if (commodityData["Gold"]) {
          convertedGoldData = convertCommodityDataToCurrencyData(
            commodityData["Gold"],
            "GOLD",
            goldChartData
          );
          setGoldChartData(convertedGoldData.chartData || []);
        }

        // Process Crude Oil WTI data if available
        let convertedOilData = null;
        if (commodityData["Crude Oil WTI"]) {
          convertedOilData = convertCommodityDataToCurrencyData(
            commodityData["Crude Oil WTI"],
            "CRUDE OIL WTI",
            oilChartData
          );
          setOilChartData(convertedOilData.chartData as number[]);
        }

        // Fetch forex data from the user's API route
        const forexData = await fetchForexData();

        // Process forex data
        const convertedForexData: Record<string, CurrencyData> = {};
        const newForexChartData = { ...forexChartData };

        // Process each forex pair
        for (const pair of [
          "EUR/USD",
          "GBP/USD",
          "USD/JPY",
          "USD/CAD",
          "USD/CHF",
          "AUD/USD",
          "NZD/USD",
          "EUR/GBP",
          "GBP/JPY",
        ]) {
          if (forexData[pair]) {
            const converted = convertForexDataToCurrencyData(
              forexData[pair],
              forexChartData[pair] || []
            ) as CurrencyData;
            convertedForexData[pair] = converted;
            newForexChartData[pair] = converted.chartData;
          }
        }

        // Update forex chart data
        setForexChartData(newForexChartData);

        // Update the currency data array with live data
        setCurrencyData((prevData) => {
          return prevData.map((item) => {
            if (item.symbol === "BTC/USD") {
              return convertedCryptoData as CurrencyData;
            } else if (item.symbol === "Gold" && convertedGoldData) {
              return convertedGoldData as CurrencyData;
            } else if (item.symbol === "Crude Oil WTI" && convertedOilData) {
              return convertedOilData as CurrencyData;
            } else if (convertedForexData[item.symbol]) {
              return convertedForexData[item.symbol] as CurrencyData;
            }
            return item;
          });
        });
      } catch (error) {
        console.error("Error in data processing:", error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for refreshing data (every 10 seconds)
    intervalRef.current = setInterval(fetchData, 10000);

    // Clean up interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (symbol: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredCurrency(symbol);
  };

  const handleMouseLeave = () => {
    // Add a small delay before hiding the chart to prevent flickering
    timeoutRef.current = setTimeout(() => {
      setHoveredCurrency(null);
    }, 100);
  };

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Calculate chart position to be at the bottom right of the cursor
  const chartPosition = {
    top: mousePosition.y + 20, // Position below the cursor
    left: mousePosition.x + 20, // Position to the right of the cursor
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <div className="flex space-x-4">
          <button className="bg-[#2c3038] text-white px-4 py-2 rounded-md font-medium">
            Quotes
          </button>
          <button className="text-gray-400 px-4 py-2 rounded-md">Charts</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 relative">
        {currencyData.map((currency) => (
          <CurrencyCard
            key={currency.symbol}
            data={currency}
            isHovered={hoveredCurrency === currency.symbol}
            onMouseEnter={() => handleMouseEnter(currency.symbol)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      <AnimatePresence>
        {hoveredCurrency && (
          <motion.div
            ref={chartRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: chartPosition.top,
              left: chartPosition.left,
              width: "350px",
              height: "220px",
            }}
          >
            <DetailedChart
              symbol={hoveredCurrency}
              currencyData={currencyData} // Pass the currency data to the DetailedChart
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
