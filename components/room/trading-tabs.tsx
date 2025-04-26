"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderBook } from "./order-book";
import { RecentTrades } from "./recent-trades";

// Suppress WebSocket errors globally
if (typeof window !== "undefined") {
  window.addEventListener(
    "error",
    (event) => {
      if (event.target instanceof WebSocket) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },
    true
  );
}

// Trade history interface
interface TradeHistoryItem {
  id: string;
  price: string;
  quantity: string;
  time: number;
  isBuyer: boolean;
}

// Trade for buy/sell ratio
interface TradeRatio {
  isSell: boolean;
  quantity: number;
}

// Define OrderBookEntry interface
interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

// Define OrderBookData interface
interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  currentPrice: string;
  priceDirection: "up" | "down" | "none";
  priceChange: number;
  priceChangePercent: number;
  buyPercentage: number;
  sellPercentage: number;
}

// Define WebSocket update data interface
interface DepthUpdateData {
  a: string[][]; // asks updates
  b: string[][]; // bids updates
  u: number; // final update id
  U: number; // first update id
}

// Update the onPriceUpdate interface to include quoteVolume
interface TradingTabsProps {
  symbol?: string;
  onPriceUpdate?: (data: {
    currentPrice: string;
    priceDirection: "up" | "down" | "none";
    priceChange: number;
    priceChangePercent: number;
    indexPrice?: string;
    highPrice?: string;
    lowPrice?: string;
    quoteVolume?: string;
    volume?: string; // Add volume parameter
  }) => void;
}

// Properly typed debounce function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<F>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
};

export function TradingTabs({
  symbol = "BTCUSDT",
  onPriceUpdate,
}: TradingTabsProps) {
  const [pricePrecision, setPricePrecision] = useState<string>("0.01");
  const [activeTab, setActiveTab] = useState<string>("tab-1");
  const [orderBookView, setOrderBookView] = useState<"all" | "buy" | "sell">(
    "all"
  );

  // Parse the trading pair to get base and quote currencies
  const baseCurrency = symbol.replace(/USDT$/, "") || "BTC";
  const quoteCurrency = "USDT";

  // Trade history for buy/sell ratio
  const tradeRatioHistory = useRef<TradeRatio[]>([]);
  const tradeHistoryLimit = 100;

  // WebSocket refs
  const wsDepth = useRef<WebSocket | null>(null);
  const wsTicker = useRef<WebSocket | null>(null);
  const wsTrade = useRef<WebSocket | null>(null);

  // Data state with proper typing
  const [orderBookData, setOrderBookData] = useState<OrderBookData>({
    asks: [],
    bids: [],
    currentPrice: "0",
    priceDirection: "none",
    priceChange: 0,
    priceChangePercent: 0,
    buyPercentage: 50,
    sellPercentage: 50,
  });

  // Recent trades state
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryItem[]>([]);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);

  // Change the limit variable to be dynamic based on the view mode
  const defaultLimit = 12;
  const filteredViewLimit = 25; // Adjusted to 25 entries as requested

  // Replace the static limit declaration with this
  const getLimit = () =>
    orderBookView === "all" ? defaultLimit : filteredViewLimit;

  const lastUpdateId = useRef(0);
  const isComponentMounted = useRef(false);

  // Connect to WebSockets at the TradingTabs level
  useEffect(() => {
    isComponentMounted.current = true;

    // Only establish connections if not already connected
    if (!isConnected) {
      connectWebSockets();
    }

    return () => {
      isComponentMounted.current = false;
      closeAllWebSockets();
    };
  }, []);

  // Update trade ratio
  const updateTradeRatio = () => {
    const trades = tradeRatioHistory.current;
    let sellCount = 0;
    let buyCount = 0;

    trades.forEach((trade) => {
      if (trade.isSell) sellCount++;
      else buyCount++;
    });

    const total = sellCount + buyCount;
    const sellPercent = total > 0 ? (sellCount / total) * 100 : 0;
    const buyPercent = total > 0 ? (buyCount / total) * 100 : 0;

    setOrderBookData((prev: OrderBookData) => ({
      ...prev,
      buyPercentage: buyPercent,
      sellPercentage: sellPercent,
    }));
  };

  // Safely close a WebSocket
  const safeCloseWebSocket = (ws: React.MutableRefObject<WebSocket | null>) => {
    if (ws.current) {
      try {
        // Remove all event listeners
        ws.current.onopen = null;
        ws.current.onmessage = null;
        ws.current.onerror = null;
        ws.current.onclose = null;

        // Only close if open
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.close();
        }
      } catch (e) {
        // Silently handle errors
      }
      ws.current = null;
    }
  };

  // Close all WebSockets
  const closeAllWebSockets = () => {
    safeCloseWebSocket(wsDepth);
    safeCloseWebSocket(wsTicker);
    safeCloseWebSocket(wsTrade);
    setIsConnected(false);
  };

  // Connect all WebSockets with exponential backoff
  const connectWebSockets = () => {
    // Fetch initial order book data
    fetchOrderBook();

    // Fetch initial trade history
    fetchTradeHistory();

    // Connect to all WebSockets with proper error handling
    connectWithBackoff(connectDepthWs, "Depth");
    connectWithBackoff(connectTickerWs, "Ticker");
    connectWithBackoff(connectTradeWs, "Trade");

    setIsConnected(true);
  };

  // Helper function for connection with exponential backoff
  const connectWithBackoff = (
    connectFn: () => void,
    name: string,
    attempt = 1
  ) => {
    const maxAttempts = 5;
    const baseDelay = 1000;

    try {
      connectFn();
    } catch (error) {
      if (attempt <= maxAttempts && isComponentMounted.current) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
        console.log(
          `${name} WebSocket connection failed. Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`
        );

        setTimeout(() => {
          if (isComponentMounted.current) {
            connectWithBackoff(connectFn, name, attempt + 1);
          }
        }, delay);
      }
    }
  };

  // Update the fetchOrderBook function to use the dynamic limit
  const fetchOrderBook = async () => {
    try {
      // Use the maximum limit for fetching to have enough data for all views
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=${filteredViewLimit}`
      );
      const data = await response.json();

      if (data.lastUpdateId) {
        lastUpdateId.current = data.lastUpdateId;
      }

      const processedData = processOrderBookData(data);

      setOrderBookData((prev: OrderBookData) => ({
        ...prev,
        asks: processedData.asks,
        bids: processedData.bids,
      }));

      // Set initial price
      if (processedData.bids.length > 0 && processedData.asks.length > 0) {
        const highestBid = processedData.bids[0].price;
        const lowestAsk = processedData.asks[0].price;
        const midPrice = (
          (Number.parseFloat(highestBid) + Number.parseFloat(lowestAsk)) /
          2
        ).toFixed(getPriceDecimals());

        setOrderBookData((prev: OrderBookData) => ({
          ...prev,
          currentPrice: midPrice,
        }));

        // Add this to send initial price data to parent
        if (onPriceUpdate) {
          onPriceUpdate({
            currentPrice: midPrice,
            priceDirection: "none",
            priceChange: 0,
            priceChangePercent: 0,
            indexPrice: midPrice,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching order book:", error);
    }
  };

  // Fetch initial trade history
  const fetchTradeHistory = async () => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=32`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const trades = data.map((trade) => ({
          id: trade.id.toString(),
          price: trade.price,
          quantity: trade.qty,
          time: trade.time,
          isBuyer: !trade.isBuyerMaker, // Inverse of isBuyerMaker
        }));

        setTradeHistory(trades);

        // Initialize trade ratio history
        tradeRatioHistory.current = data.map((trade) => ({
          isSell: trade.isBuyerMaker,
          quantity: Number.parseFloat(trade.qty),
        }));

        // Update the trade ratio
        updateTradeRatio();
      }
    } catch (error) {
      console.error("Error fetching trade history:", error);
    }
  };

  // Update the processOrderBookData function to use the dynamic limit
  const processOrderBookData = (data: any) => {
    if (!data) return { asks: [], bids: [] };

    const currentLimit = getLimit();

    const processedAsks = data.asks
      ? data.asks
          .slice(0, filteredViewLimit) // Always process the maximum
          .map((ask: string[]) => {
            const price = ask[0];
            const amount = ask[1];
            const total = (
              Number.parseFloat(price) * Number.parseFloat(amount)
            ).toString();

            return { price, amount, total };
          })
          .sort(
            (a: any, b: any) =>
              Number.parseFloat(a.price) - Number.parseFloat(b.price)
          )
      : [];

    const processedBids = data.bids
      ? data.bids
          .slice(0, filteredViewLimit) // Always process the maximum
          .map((bid: string[]) => {
            const price = bid[0];
            const amount = bid[1];
            const total = (
              Number.parseFloat(price) * Number.parseFloat(amount)
            ).toString();

            return { price, amount, total };
          })
          .sort(
            (a: any, b: any) =>
              Number.parseFloat(b.price) - Number.parseFloat(a.price)
          )
      : [];

    return { asks: processedAsks, bids: processedBids };
  };

  // Get decimal places based on price precision
  const getPriceDecimals = () => {
    switch (pricePrecision) {
      case "0.01":
        return 2;
      case "0.1":
        return 1;
      case "1":
        return 0;
      default:
        return 2;
    }
  };

  // Connect to depth WebSocket
  const connectDepthWs = () => {
    if (wsDepth.current) {
      safeCloseWebSocket(wsDepth);
    }

    try {
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`
      );
      wsDepth.current = ws;

      ws.onopen = () => {
        console.log("Depth WebSocket connected");
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return;

        try {
          const data = JSON.parse(event.data) as DepthUpdateData;

          // Check if we need to resync
          if (data.u <= lastUpdateId.current) return;
          if (data.U > lastUpdateId.current + 1) {
            console.warn("Missing data. Resyncing...");
            fetchOrderBook();
            return;
          }

          // Only process if the active tab is the order book
          if (activeTab === "tab-1") {
            debouncedUpdateOrderBook(data);
          }

          lastUpdateId.current = data.u;
        } catch (error) {
          // Silently handle parsing errors
        }
      };

      // Create debounced update function with proper typing
      const debouncedUpdateOrderBook = debounce((data: DepthUpdateData) => {
        setOrderBookData((prev) => {
          // Apply updates to asks
          const updatedAsks = applyAsksUpdate(data.a || [], prev.asks);

          // Apply updates to bids
          const updatedBids = applyBidsUpdate(data.b || [], prev.bids);

          return {
            ...prev,
            asks: updatedAsks,
            bids: updatedBids,
          };
        });
      }, 100); // Update at most every 100ms

      ws.onerror = () => {
        // Completely suppress all errors
        return false;
      };

      ws.onclose = () => {
        if (!isComponentMounted.current) return;

        console.log("Depth WebSocket disconnected. Reconnecting...");
        setTimeout(() => {
          if (isComponentMounted.current) {
            connectDepthWs();
          }
        }, 5000);
      };
    } catch (error) {
      // Silently handle connection errors
    }
  };

  // Connect to ticker WebSocket
  const connectTickerWs = () => {
    if (wsTicker.current) {
      safeCloseWebSocket(wsTicker);
    }

    try {
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
      );
      wsTicker.current = ws;

      ws.onopen = () => {
        console.log("Ticker WebSocket connected");
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return;

        try {
          const data = JSON.parse(event.data);

          // Process ticker data regardless of active tab
          if (data.c) {
            setOrderBookData((prev: OrderBookData) => {
              const newPrice = Number.parseFloat(data.c).toFixed(
                getPriceDecimals()
              );
              let direction = prev.priceDirection;

              // Determine price direction
              if (
                Number.parseFloat(newPrice) >
                Number.parseFloat(prev.currentPrice)
              ) {
                direction = "up";
              } else if (
                Number.parseFloat(newPrice) <
                Number.parseFloat(prev.currentPrice)
              ) {
                direction = "down";
              }

              return {
                ...prev,
                currentPrice: newPrice,
                priceDirection: direction,
                priceChange: data.p
                  ? Number.parseFloat(data.p)
                  : prev.priceChange,
                priceChangePercent: data.P
                  ? Number.parseFloat(data.P)
                  : prev.priceChangePercent,
              };
            });

            // Inside the ticker WebSocket onmessage handler, after setting orderBookData
            if (data.c && onPriceUpdate) {
              const newPrice = Number.parseFloat(data.c).toFixed(
                getPriceDecimals()
              );
              // Access prev from the outer scope
              let direction = orderBookData.priceDirection;

              // Determine price direction
              if (
                Number.parseFloat(newPrice) >
                Number.parseFloat(orderBookData.currentPrice)
              ) {
                direction = "up";
              } else if (
                Number.parseFloat(newPrice) <
                Number.parseFloat(orderBookData.currentPrice)
              ) {
                direction = "down";
              }

              onPriceUpdate({
                currentPrice: newPrice,
                priceDirection: direction,
                priceChange: data.p
                  ? Number.parseFloat(data.p)
                  : orderBookData.priceChange,
                priceChangePercent: data.P
                  ? Number.parseFloat(data.P)
                  : orderBookData.priceChangePercent,
                indexPrice: data.i || orderBookData.currentPrice, // Use index price if available
                highPrice: data.h,
                lowPrice: data.l,
                quoteVolume: data.q, // Add quoteVolume to the update
                volume: data.v, // Add volume to the update
              });
            }
          }
        } catch (error) {
          // Silently handle parsing errors
        }
      };

      ws.onerror = () => {
        // Completely suppress all errors
        return false;
      };

      ws.onclose = () => {
        if (!isComponentMounted.current) return;

        console.log("Ticker WebSocket disconnected. Reconnecting...");
        setTimeout(() => {
          if (isComponentMounted.current) {
            connectTickerWs();
          }
        }, 5000);
      };
    } catch (error) {
      // Silently handle connection errors
    }
  };

  // Connect to trade WebSocket
  const connectTradeWs = () => {
    if (wsTrade.current) {
      safeCloseWebSocket(wsTrade);
    }

    try {
      const ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
      );
      wsTrade.current = ws;

      ws.onopen = () => {
        console.log("Trade WebSocket connected");
      };

      ws.onmessage = (event) => {
        if (!isComponentMounted.current) return;

        try {
          const data = JSON.parse(event.data);

          // Process for buy/sell ratio
          if (data && data.m !== undefined) {
            const isSell = data.m;
            const quantity = Number.parseFloat(data.q);

            // Add to trade history for ratio calculation
            tradeRatioHistory.current.unshift({ isSell, quantity });

            // Keep history within limit
            if (tradeRatioHistory.current.length > tradeHistoryLimit) {
              tradeRatioHistory.current.pop();
            }

            // Update the trade ratio
            updateTradeRatio();
          }

          // Process for recent trades tab
          if (data && data.p && data.q && data.T) {
            const newTrade = {
              id: data.t.toString(),
              price: data.p,
              quantity: data.q,
              time: data.T,
              isBuyer: !data.m, // Inverse of m (m is true for sell)
            };

            setTradeHistory((prev) => {
              // Add to beginning of array and limit to 32 items
              return [newTrade, ...prev].slice(0, 32);
            });
          }
        } catch (error) {
          // Silently handle parsing errors
        }
      };

      ws.onerror = () => {
        // Completely suppress all errors
        return false;
      };

      ws.onclose = () => {
        if (!isComponentMounted.current) return;

        console.log("Trade WebSocket disconnected. Reconnecting...");
        setTimeout(() => {
          if (isComponentMounted.current) {
            connectTradeWs();
          }
        }, 5000);
      };
    } catch (error) {
      // Silently handle connection errors
    }
  };

  // Update the applyAsksUpdate and applyBidsUpdate functions to use the dynamic limit
  const applyAsksUpdate = (
    asksUpdate: string[][],
    currentAsks: OrderBookEntry[]
  ) => {
    const updatedAsks = [...currentAsks];
    const asksMap = new Map(updatedAsks.map((ask) => [ask.price, ask]));

    asksUpdate.forEach(([price, amount]) => {
      const priceStr = price;
      const amountNum = Number.parseFloat(amount);

      if (amountNum === 0) {
        asksMap.delete(priceStr);
      } else {
        asksMap.set(priceStr, {
          price: priceStr,
          amount: amount,
          total: (Number.parseFloat(priceStr) * amountNum).toString(),
        });
      }
    });

    return Array.from(asksMap.values())
      .sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
      .slice(0, filteredViewLimit); // Always keep the maximum available
  };

  // Apply updates to bids
  const applyBidsUpdate = (
    bidsUpdate: string[][],
    currentBids: OrderBookEntry[]
  ) => {
    const updatedBids = [...currentBids];
    const bidsMap = new Map(updatedBids.map((bid) => [bid.price, bid]));

    bidsUpdate.forEach(([price, amount]) => {
      const priceStr = price;
      const amountNum = Number.parseFloat(amount);

      if (amountNum === 0) {
        bidsMap.delete(priceStr);
      } else {
        bidsMap.set(priceStr, {
          price: priceStr,
          amount: amount,
          total: (Number.parseFloat(priceStr) * amountNum).toString(),
        });
      }
    });

    return Array.from(bidsMap.values())
      .sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
      .slice(0, filteredViewLimit); // Always keep the maximum available
  };

  // Handle accent box clicks
  const handleAccentBoxClick = (viewMode: "all" | "buy" | "sell") => {
    setOrderBookView(viewMode);
  };

  return (
    <Tabs defaultValue="tab-1" onValueChange={setActiveTab}>
      <TabsList className="h-auto rounded-none bg-transparent p-0">
        <TabsTrigger
          value="tab-1"
          className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer"
        >
          호가창
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer"
        >
          최근거래
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1" className="text-white px-1">
        <div className="flex justify-between items-center w-full mb-3">
          <div className="flex gap-1">
            <div
              className={`w-6 h-6 bg-accent flex p-0.5 cursor-pointer ${
                orderBookView === "all" ? "ring-1 ring-[#f97316]" : ""
              }`}
              onClick={() => handleAccentBoxClick("all")}
            >
              <div className="w-1/2 h-full flex flex-col mr-0.5">
                <div className="w-full h-1/2 bg-red-500 mb-0.5"></div>
                <div className="w-full h-1/2 bg-green-500"></div>
              </div>
              <div className="w-1/2 h-full flex flex-col space-y-[2px] py-[1px]">
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
              </div>
            </div>
            <div
              className={`w-6 h-6 bg-accent flex p-0.5 cursor-pointer ${
                orderBookView === "buy" ? "ring-1 ring-[#f97316]" : ""
              }`}
              onClick={() => handleAccentBoxClick("buy")}
            >
              <div className="w-1/2 h-full bg-green-500 mr-0.5"></div>
              <div className="w-1/2 h-full flex flex-col space-y-[2px] py-[1px]">
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
              </div>
            </div>
            <div
              className={`w-6 h-6 bg-accent flex p-0.5 cursor-pointer ${
                orderBookView === "sell" ? "ring-1 ring-[#f97316]" : ""
              }`}
              onClick={() => handleAccentBoxClick("sell")}
            >
              <div className="w-1/2 h-full bg-red-500 mr-0.5"></div>
              <div className="w-1/2 h-full flex flex-col space-y-[2px] py-[1px]">
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
                <div className="w-full h-[1px] bg-gray-500"></div>
              </div>
            </div>
          </div>

          <Select
            defaultValue="0.01"
            onValueChange={(value) => setPricePrecision(value)}
          >
            <SelectTrigger className="w-[100px] h-8 rounded-none bg-[#171920] border-none text-white">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="!min-w-[100px] rounded-none bg-[#171920] border-none text-white">
              <SelectItem value="0.01" className="!h-8 rounded-none">
                0.01
              </SelectItem>
              <SelectItem value="0.1" className="!h-8 rounded-none">
                0.1
              </SelectItem>
              <SelectItem value="1" className="!h-8 rounded-none">
                1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order Book Component */}
        <OrderBook
          data={orderBookData}
          pricePrecision={pricePrecision}
          viewMode={orderBookView}
          symbol={symbol}
        />
      </TabsContent>
      <TabsContent value="tab-2" className="text-white px-1">
        {/* Recent Trades Component - No header section */}
        <RecentTrades
          trades={tradeHistory}
          pricePrecision={pricePrecision}
          symbol={symbol}
        />
      </TabsContent>
    </Tabs>
  );
}
