"use client";

import { useEffect, useRef, memo } from "react";

interface TradingChartProps {
  symbol: string;
}

// Create a memoized component that only re-renders when the symbol changes
export const TradingChart = memo(function TradingChart({
  symbol,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInitialized = useRef(false);

  // Set up TradingView widget only once or when symbol changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any existing content
    containerRef.current.innerHTML = "";
    chartInitialized.current = false;

    console.log("[TRADING CHART] Initializing chart with symbol:", symbol);

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Asia/Seoul",
        "theme": "dark",
        "style": "1",
        "locale": "kr",
        "withdateranges": true,
        "hide_side_toolbar": false,
        "backgroundColor": "rgba(33, 38, 49, 1)",
        "gridColor": "rgba(33, 38, 49, 1)",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;

    containerRef.current.appendChild(script);
    chartInitialized.current = true;

    return () => {
      // This cleanup function will only run when the component unmounts or symbol changes
      console.log("[TRADING CHART] Cleaning up chart");
    };
  }, [symbol]); // Only re-run if symbol changes

  return (
    <div className="bg-[#212631] rounded w-full h-[45rem] border border-[#3f445c]">
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        ></div>
      </div>
    </div>
  );
});
