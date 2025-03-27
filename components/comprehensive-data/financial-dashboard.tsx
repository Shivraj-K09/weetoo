"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CurrencyCard } from "./currency-card";
import { DetailedChart } from "./detailed-chart";
import { PerformanceChart } from "./performance-chart";
import { currencyData } from "@/lib/data";

export function FinancialDashboard() {
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button className="bg-[#2c3038] text-white px-4 py-2 rounded-md font-medium">
            Quotes
          </button>
          {/* <button className="text-gray-400 px-4 py-2 rounded-md">
            Performance
          </button> */}
          {/* <button className="text-gray-400 px-4 py-2 rounded-md">Charts</button> */}
        </div>
        <div className="flex space-x-2">
          <button className="bg-[#2c3038] text-white px-3 py-1 rounded-md text-sm">
            5M
          </button>
          <button className="text-gray-400 px-3 py-1 rounded-md text-sm">
            H
          </button>
          <button className="text-gray-400 px-3 py-1 rounded-md text-sm">
            D
          </button>
          <button className="text-gray-400 px-3 py-1 rounded-md text-sm">
            W
          </button>
          <button className="text-gray-400 px-3 py-1 rounded-md text-sm">
            M
          </button>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: chartPosition.top,
              left: chartPosition.left,
              width: "350px", // Reduced from 500px
              height: "220px", // Reduced from 300px
            }}
          >
            <DetailedChart symbol={hoveredCurrency} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <PerformanceChart />
      </div>
    </div>
  );
}
