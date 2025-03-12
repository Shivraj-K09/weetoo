"use client";

import { TradingRooms } from "@/components/trading-rooms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { TickerTape } from "react-ts-tradingview-widgets";

// Define category types and their corresponding symbols
type Category = "crypto" | "forex" | "indices" | "commodities";

const categorySymbols: Record<Category, string> = {
  crypto: "BITSTAMP:BTCUSD", // Bitcoin
  forex: "FX_IDC:EURUSD", // EUR/USD
  indices: "NASDAQ:AAPL", // Apple (default)
  commodities: "NYMEX:CL1!", // Crude Oil
};

export default function Trader() {
  const container = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>("indices");

  useEffect(() => {
    // Clear previous chart if it exists
    if (container.current) {
      container.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${categorySymbols[selectedCategory]}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;
    container?.current?.appendChild(script);
  }, [selectedCategory]); // Re-run when selected category changes

  return (
    <div className="w-full flex flex-col">
      <div className="py-2">
        <TickerTape
          symbols={[
            { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
            { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
            { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
            { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
            { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
          ]}
          showSymbolLogo={true}
          isTransparent={true}
          displayMode="compact"
          colorTheme="light"
          locale="en"
        />
      </div>

      <div>
        <div className="flex gap-3 py-3 items-center justify-center w-full">
          <Button
            variant="outline"
            className={cn(
              "font-semibold h-8 shadow-none cursor-pointer",
              selectedCategory === "crypto" ? "text-red-500" : ""
            )}
            onClick={() => setSelectedCategory("crypto")}
          >
            암호화폐
          </Button>

          <Button
            variant="outline"
            className={cn(
              "font-semibold h-8 shadow-none cursor-pointer",
              selectedCategory === "forex" ? "text-red-500" : ""
            )}
            onClick={() => setSelectedCategory("forex")}
          >
            통화
          </Button>

          <Button
            variant="outline"
            className={cn(
              "font-semibold h-8 shadow-none cursor-pointer",
              selectedCategory === "indices" ? "text-red-500" : ""
            )}
            onClick={() => setSelectedCategory("indices")}
          >
            지수
          </Button>

          <Button
            variant="outline"
            className={cn(
              "font-semibold h-8 shadow-none cursor-pointer",
              selectedCategory === "commodities" ? "text-red-500" : ""
            )}
            onClick={() => setSelectedCategory("commodities")}
          >
            원자재
          </Button>
        </div>
        <div className="h-[25rem] w-full pb-4">
          <div
            className="tradingview-widget-container"
            ref={container}
            style={{ height: "100%", width: "100%" }}
          >
            <div
              className="tradingview-widget-container__widget"
              style={{ height: "calc(100% - 32px)", width: "100%" }}
            ></div>
          </div>
        </div>
      </div>

      <TradingRooms />
    </div>
  );
}
