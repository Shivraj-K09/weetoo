"use client";

import { useState, useEffect, useRef } from "react";

// Throttle function to limit update frequency
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function (
    this: any,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  };
}

// Update the PriceData interface to include volume and openInterest
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

// Add interface for funding rate data
interface FundingRateData {
  rate: number | null;
  nextFundingTime: number | null;
  countdown: string | null;
}

export function usePriceData(selectedSymbol: string) {
  const [priceDataLoaded, setPriceDataLoaded] = useState(false);
  const [priceData, setPriceData] = useState<PriceData>({
    currentPrice: "0",
    priceDirection: "none",
    priceChange: 0,
    priceChangePercent: 0,
    indexPrice: "0",
    highPrice: null,
    lowPrice: null,
    quoteVolume: null,
    volume: null,
    openInterest: null,
  });

  // Add state for funding rate data
  const [fundingData, setFundingData] = useState<FundingRateData>({
    rate: null,
    nextFundingTime: null,
    countdown: null,
  });

  // WebSocket refs
  const wsTicker = useRef<WebSocket | null>(null);
  const wsFunding = useRef<WebSocket | null>(null);

  // Ref to track the last update time to prevent too frequent updates
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 500; // Update at most every 500ms

  // Format price to 2 decimal places
  const formatPrice = (price: string | number): string => {
    const numPrice =
      typeof price === "string" ? Number.parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  // Format countdown time (HH:MM:SS)
  const formatCountdown = (milliseconds: number): string => {
    if (milliseconds <= 0) return "00:00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fetch 24hr ticker data and set up WebSocket for real-time updates
  useEffect(() => {
    if (!selectedSymbol) return;

    // Initial fetch of 24hr ticker data
    const fetchTickerData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedSymbol}`
        );
        const data = await response.json();

        if (data) {
          setPriceData((prev) => ({
            ...prev,
            priceChange: data.priceChange
              ? Number.parseFloat(data.priceChange)
              : prev.priceChange,
            priceChangePercent: data.priceChangePercent
              ? Number.parseFloat(data.priceChangePercent)
              : prev.priceChangePercent,
            highPrice: data.highPrice
              ? formatPrice(data.highPrice)
              : prev.highPrice,
            lowPrice: data.lowPrice
              ? formatPrice(data.lowPrice)
              : prev.lowPrice,
            quoteVolume: data.quoteVolume ? data.quoteVolume : prev.quoteVolume,
            volume: data.volume ? data.volume : prev.volume,
          }));
          setPriceDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching ticker data:", error);
      }
    };

    fetchTickerData();

    // Set up WebSocket for real-time ticker updates
    const connectTickerWs = () => {
      if (wsTicker.current) {
        wsTicker.current.onclose = null;
        wsTicker.current.onerror = null;
        wsTicker.current.onmessage = null;
        wsTicker.current.close();
        wsTicker.current = null;
      }

      try {
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@ticker`
        );
        wsTicker.current = ws;

        ws.onopen = () => {
          console.log("Ticker WebSocket connected");
        };

        // Update the WebSocket onmessage handler to process volume data
        ws.onmessage = (event) => {
          try {
            const now = Date.now();
            // Throttle updates to prevent flickering
            if (now - lastUpdateTime.current < updateInterval) {
              return;
            }

            lastUpdateTime.current = now;
            const data = JSON.parse(event.data);

            if (data) {
              setPriceData((prev) => ({
                ...prev,
                currentPrice: data.c ? formatPrice(data.c) : prev.currentPrice,
                priceDirection:
                  data.c && prev.currentPrice
                    ? Number(data.c) > Number(prev.currentPrice)
                      ? "up"
                      : Number(data.c) < Number(prev.currentPrice)
                        ? "down"
                        : prev.priceDirection
                    : prev.priceDirection,
                priceChange: data.p
                  ? Number.parseFloat(data.p)
                  : prev.priceChange,
                priceChangePercent: data.P
                  ? Number.parseFloat(data.P)
                  : prev.priceChangePercent,
                highPrice: data.h ? formatPrice(data.h) : prev.highPrice,
                lowPrice: data.l ? formatPrice(data.l) : prev.lowPrice,
                quoteVolume: data.q ? data.q : prev.quoteVolume,
                volume: data.v ? data.v : prev.volume,
              }));
              setPriceDataLoaded(true);
            }
          } catch (error) {
            console.error("Error parsing WebSocket data:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("Ticker WebSocket disconnected. Reconnecting...");
          setTimeout(() => {
            connectTickerWs();
          }, 5000);
        };
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
      }
    };

    connectTickerWs();

    return () => {
      if (wsTicker.current) {
        wsTicker.current.onclose = null;
        wsTicker.current.close();
      }
    };
  }, [selectedSymbol]);

  // Add a new useEffect for polling open interest data
  useEffect(() => {
    if (!selectedSymbol) return;

    let isActive = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchOpenInterest = async () => {
      try {
        const response = await fetch(
          `https://fapi.binance.com/fapi/v1/openInterest?symbol=${selectedSymbol}`
        );
        const data = await response.json();

        if (!isActive) return;

        if (data && data.openInterest) {
          setPriceData((prev) => ({
            ...prev,
            openInterest: data.openInterest,
          }));
        }
      } catch (error) {
        console.error("Error fetching open interest:", error);
      } finally {
        // Schedule next poll with a reasonable interval (10 seconds)
        // This is a balance between freshness and not hitting rate limits
        if (isActive) {
          timeoutId = setTimeout(fetchOpenInterest, 10000);
        }
      }
    };

    // Initial fetch
    fetchOpenInterest();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedSymbol]);

  // Add a new useEffect for funding rate data
  useEffect(() => {
    if (!selectedSymbol) return;

    let isActive = true;
    let countdownInterval: NodeJS.Timeout | null = null;

    // Function to update countdown
    const updateCountdown = () => {
      if (!fundingData.nextFundingTime) return;

      const now = Date.now();
      const remaining = fundingData.nextFundingTime - now;

      if (remaining <= 0) {
        // Time to fetch new funding data
        fetchFundingData();
        return;
      }

      setFundingData((prev) => ({
        ...prev,
        countdown: formatCountdown(remaining),
      }));
    };

    // Fetch initial funding rate data
    const fetchFundingData = async () => {
      try {
        const response = await fetch(
          `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${selectedSymbol}`
        );
        const data = await response.json();

        if (!isActive) return;

        if (data) {
          const rate = data.lastFundingRate
            ? Number(data.lastFundingRate) * 100
            : 0;
          const nextFundingTime = data.nextFundingTime;
          const currentTime = data.time;
          const remaining = nextFundingTime - currentTime;

          setFundingData({
            rate,
            nextFundingTime,
            countdown: formatCountdown(remaining),
          });

          // Start countdown
          if (countdownInterval) clearInterval(countdownInterval);
          countdownInterval = setInterval(updateCountdown, 1000);
        }
      } catch (error) {
        console.error("Error fetching funding rate data:", error);
      }
    };

    // Connect to funding rate WebSocket
    const connectFundingWs = () => {
      if (wsFunding.current) {
        wsFunding.current.onclose = null;
        wsFunding.current.onerror = null;
        wsFunding.current.onmessage = null;
        wsFunding.current.close();
        wsFunding.current = null;
      }

      try {
        const ws = new WebSocket(
          `wss://fstream.binance.com/ws/${selectedSymbol.toLowerCase()}@markPrice`
        );
        wsFunding.current = ws;

        ws.onopen = () => {
          console.log("Funding WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data && data.r !== undefined && data.T !== undefined) {
              const rate = Number(data.r) * 100;
              const nextFundingTime = data.T;
              const now = Date.now();
              const remaining = nextFundingTime - now;

              setFundingData({
                rate,
                nextFundingTime,
                countdown: formatCountdown(remaining),
              });
            }
          } catch (error) {
            console.error("Error parsing funding WebSocket data:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("Funding WebSocket error:", error);
        };

        ws.onclose = () => {
          if (!isActive) return;

          console.log("Funding WebSocket disconnected. Reconnecting...");
          setTimeout(() => {
            if (isActive) {
              connectFundingWs();
            }
          }, 5000);
        };
      } catch (error) {
        console.error("Error connecting to funding WebSocket:", error);
      }
    };

    // Initial fetch
    fetchFundingData();

    // Connect to WebSocket
    connectFundingWs();

    return () => {
      isActive = false;

      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      if (wsFunding.current) {
        wsFunding.current.onclose = null;
        wsFunding.current.close();
      }
    };
  }, [selectedSymbol]);

  // Throttled price update handler
  const handlePriceUpdate = throttle(
    (data: {
      currentPrice: string;
      priceDirection: "up" | "down" | "none";
      priceChange: number;
      priceChangePercent: number;
      indexPrice?: string;
      highPrice?: string;
      lowPrice?: string;
      quoteVolume?: string;
      volume?: string;
      openInterest?: string;
    }) => {
      setPriceData((prev) => ({
        ...prev,
        ...data,
      }));
    },
    500
  ); // Update at most every 500ms

  return {
    priceData,
    priceDataLoaded,
    fundingData,
    handlePriceUpdate,
  };
}
