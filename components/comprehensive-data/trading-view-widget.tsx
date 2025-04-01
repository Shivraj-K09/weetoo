"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol: string;
}

// Define proper types for TradingView
interface TradingViewWidgetOptions {
  autosize: boolean;
  symbol: string;
  interval: string;
  timezone: string;
  theme: string;
  style: string;
  locale: string;
  toolbar_bg: string;
  hide_top_toolbar: boolean;
  hide_legend: boolean;
  allow_symbol_change: boolean;
  save_image: boolean;
  hide_volume: boolean;
  container_id: string;
  range: string;
  enabled_features: string[];
  disabled_features: string[];
}

interface TradingViewStatic {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  widget: new (options: TradingViewWidgetOptions) => any;
}

// Update the global declaration with a specific type
declare global {
  interface Window {
    TradingView: TradingViewStatic;
  }
}

function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Map our symbols to TradingView symbols
  const getTradingViewSymbol = (sym: string) => {
    const symbolMap: Record<string, string> = {
      "EUR/USD": "FX:EURUSD",
      "GBP/USD": "FX:GBPUSD",
      "USD/JPY": "FX:USDJPY",
      "USD/CAD": "FX:USDCAD",
      "USD/CHF": "FX:USDCHF",
      "AUD/USD": "FX:AUDUSD",
      "NZD/USD": "FX:NZDUSD",
      "EUR/GBP": "FX:EURGBP",
      "GBP/JPY": "FX:GBPJPY",
      "BTC/USD": "CRYPTO:BTCUSD",
      Gold: "COMEX:GC",
      "Crude Oil WTI": "NYMEX:CL",
    };

    return symbolMap[sym] || "FX:EURUSD";
  };

  useEffect(() => {
    let isMounted = true;
    // Store a reference to the current container element
    const currentContainer = containerRef.current;

    const initializeWidget = () => {
      if (!currentContainer || !isMounted) return;

      // Clean up existing content
      currentContainer.innerHTML = "";

      // Create widget container
      const widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";
      widgetContainer.style.height = "100%";
      widgetContainer.style.width = "100%";

      // Generate unique container ID
      const containerId = `tradingview_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      widgetContainer.id = containerId;

      currentContainer.appendChild(widgetContainer);

      // Create and load TradingView script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;

      script.onload = () => {
        if (!isMounted || typeof window.TradingView === "undefined") return;

        try {
          new window.TradingView.widget({
            autosize: true,
            symbol: getTradingViewSymbol(symbol),
            interval: "D",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            hide_top_toolbar: true,
            hide_legend: true,
            allow_symbol_change: false,
            save_image: false,
            hide_volume: true,
            container_id: containerId,
            range: "1M",
            enabled_features: ["move_logo_to_main_pane"],
            disabled_features: [
              "header_symbol_search",
              "header_screenshot",
              "header_compare",
              "header_saveload",
              "go_to_date",
              "timeframes_toolbar",
              "volume_force_overlay",
              "left_toolbar",
              "show_logo_on_all_charts",
              "copyright",
              "branding_logo",
            ],
          });
        } catch (error) {
          console.error("TradingView widget error:", error);
        }
      };

      scriptRef.current = script;
      document.head.appendChild(script);
    };

    initializeWidget();

    // Cleanup function
    return () => {
      isMounted = false;

      // Clean up script tag
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }

      // Clean up container using the captured reference
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: "100%", width: "100%" }}
    />
  );
}

export default memo(TradingViewWidget);
