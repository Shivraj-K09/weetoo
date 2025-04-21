"use client";

import { useEffect, useRef } from "react";

interface RoomData {
  trading_pairs: string[];
}

export function useTradingChart(roomDetails: RoomData | null) {
  const container = useRef<HTMLDivElement>(null);

  // Set up TradingView widget
  useEffect(() => {
    if (!roomDetails || !container.current) return;

    // Clear any existing content
    container.current.innerHTML = "";

    const symbol = roomDetails.trading_pairs[0] || "BTCUSDT";

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

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [roomDetails]);

  return container;
}
