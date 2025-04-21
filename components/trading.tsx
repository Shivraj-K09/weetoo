"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";

export function Trading() {
  const container = useRef<HTMLDivElement>(null);
  const [selectedSymbol, setSelectedSymbol] =
    useState<string>("BINANCE:ETHUSDT");
  const [cryptoValue, setCryptoValue] = useState<string>("");
  const [currencyValue, setCurrencyValue] = useState<string>("");
  const [indexValue, setIndexValue] = useState<string>("");
  const [commodityValue, setCommodityValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Capture the current DOM node once
    const containerEl = container.current;

    if (containerEl) {
      containerEl.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = `{
      "autosize": true,
      "symbol": "${selectedSymbol}",
      "interval": "D",
      "timezone": "Asia/Seoul",
      "theme": "light",
      "style": "1",
      "locale": "kr",
      "hide_top_toolbar": true,
      "allow_symbol_change": true,
      "save_image": false,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    }`;

    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      console.error("TradingView widget failed to load");
      setIsLoading(false);
    };

    if (containerEl) {
      containerEl.appendChild(script);
    }

    return () => {
      if (containerEl) {
        containerEl.innerHTML = "";
      }
      setIsLoading(true);
    };
  }, [selectedSymbol]);

  return (
    <div>
      <div className="flex gap-3 py-3 items-center justify-center w-full">
        <Select
          value={cryptoValue}
          onValueChange={(value) => {
            // Only update necessary states
            setCryptoValue(value);
            setCurrencyValue("");
            setIndexValue("");
            setCommodityValue("");

            // Map the dropdown values to TradingView symbols
            const symbolMap: Record<string, string> = {
              BTCUSDT: "BINANCE:BTCUSDT",
              ETHUSDT: "BINANCE:ETHUSDT",
              XRPUSDT: "BINANCE:XRPUSDT",
              SOLUSDT: "BINANCE:SOLUSDT",
            };
            setSelectedSymbol(symbolMap[value] || "CAPITALCOM:US30");
          }}
        >
          <SelectTrigger
            className={`h-8 w-32 shadow-none bg-[#D9D9D9] dark:bg-background cursor-pointer ${
              cryptoValue ? "text-red-500 font-semibold" : "text-white"
            }`}
            aria-label="암호화폐"
          >
            <SelectValue placeholder="암호화폐" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BTCUSDT" className="text-sm py-0.5">
              BTCUSDT
            </SelectItem>
            <SelectItem value="ETHUSDT" className="text-sm py-0.5">
              ETHUSDT
            </SelectItem>
            <SelectItem value="XRPUSDT" className="text-sm py-0.5">
              XRPUSDT
            </SelectItem>
            <SelectItem value="SOLUSDT" className="text-sm py-0.5">
              SOLUSDT
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currencyValue}
          onValueChange={(value) => {
            // Only update necessary states
            setCurrencyValue(value);
            setCryptoValue("");
            setIndexValue("");
            setCommodityValue("");

            // Map the dropdown values to TradingView symbols
            const symbolMap: Record<string, string> = {
              EURUSD: "FX:EURUSD",
              GBPUSD: "FX:GBPUSD",
              USDJPY: "FX:USDJPY",
            };
            setSelectedSymbol(symbolMap[value] || "CAPITALCOM:US30");
          }}
        >
          <SelectTrigger
            className={`h-8 w-32 shadow-none bg-[#D9D9D9] dark:bg-background cursor-pointer ${
              currencyValue ? "text-red-500 font-semibold" : "text-white"
            }`}
            aria-label="통화"
          >
            <SelectValue placeholder="통화" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EURUSD" className="text-sm py-0.5">
              EURUSD
            </SelectItem>
            <SelectItem value="GBPUSD" className="text-sm py-0.5">
              GBPUSD
            </SelectItem>
            <SelectItem value="USDJPY" className="text-sm py-0.5">
              USDJPY
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={indexValue}
          onValueChange={(value) => {
            // Only update necessary states
            setIndexValue(value);
            setCryptoValue("");
            setCurrencyValue("");
            setCommodityValue("");

            // Map the dropdown values to TradingView symbols
            const symbolMap: Record<string, string> = {
              "NAS 100": "NASDAQ:NDX",
              "SP 500": "FOREXCOM:SPXUSD",
              HSI: "HSI:HSI",
              DXY: "CAPITALCOM:DXY",
            };
            setSelectedSymbol(symbolMap[value] || "CAPITALCOM:US30");
          }}
        >
          <SelectTrigger
            className={`h-8 w-32 shadow-none bg-[#D9D9D9] dark:bg-background cursor-pointer ${
              indexValue ? "text-red-500 font-semibold" : "text-white"
            }`}
            aria-label="지수"
          >
            <SelectValue placeholder="지수" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NAS 100" className="text-sm py-0.5">
              NAS 100
            </SelectItem>
            <SelectItem value="SP 500" className="text-sm py-0.5">
              SP 500
            </SelectItem>
            <SelectItem value="HSI" className="text-sm py-0.5">
              HSI
            </SelectItem>
            <SelectItem value="DXY" className="text-sm py-0.5">
              DXY
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={commodityValue}
          onValueChange={(value) => {
            // Only update necessary states
            setCommodityValue(value);
            setCryptoValue("");
            setCurrencyValue("");
            setIndexValue("");

            // Map the dropdown values to TradingView symbols
            const symbolMap: Record<string, string> = {
              XAUUSD: "OANDA:XAUUSD",
              XAGUSD: "OANDA:XAGUSD",
              "CL1!": "NYMEX:CL1!",
              "NG1!": "NYMEX:NG1!",
              UKOIL: "OANDA:BCOUSD",
            };
            setSelectedSymbol(symbolMap[value] || "CAPITALCOM:US30");
          }}
        >
          <SelectTrigger
            className={`h-8 w-32 shadow-none bg-[#D9D9D9] dark:bg-background cursor-pointer ${
              commodityValue ? "text-red-500 font-semibold" : "text-white"
            }`}
            aria-label="원자재"
          >
            <SelectValue placeholder="원자재" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="XAUUSD" className="text-sm py-0.5">
              XAUUSD
            </SelectItem>
            <SelectItem value="XAGUSD" className="text-sm py-0.5">
              XAGUSD
            </SelectItem>
            <SelectItem value="CL1!" className="text-sm py-0.5">
              CL1!
            </SelectItem>
            <SelectItem value="NG1!" className="text-sm py-0.5">
              NG1!
            </SelectItem>
            <SelectItem value="UKOIL" className="text-sm py-0.5">
              UKOIL
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[25rem] w-full pb-4">
        {isLoading && (
          <div className="h-full w-full bg-gray-200 animate-pulse rounded-sm flex items-center justify-center">
            Loading chart...
          </div>
        )}
        <div
          className="tradingview-widget-container"
          ref={container}
          style={{
            height: "100%",
            width: "100%",
            display: isLoading ? "none" : "block",
          }}
        >
          <div
            className="tradingview-widget-container__widget"
            style={{ height: "calc(100% - 32px)", width: "100%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
