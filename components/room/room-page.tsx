"use client";

import { TradingMarketPlace } from "@/components/room/trading-market-place";
import { TradingTabs } from "@/components/room/trading-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, VideoIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriceInfoBar } from "@/components/room/price-info-bar";
import { WarningDialog } from "@/components/room/warning-dialog";

// Define privacy type as a union type for better type safety
type Privacy = "private" | "public";

// Define the room details type
interface RoomData {
  id: string;
  room_name: string;
  room_type: Privacy;
  trading_pairs: string[];
  current_participants: number;
  max_participants: number;
  owner_id: string;
  participants: string[];
  created_at: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
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
  openInterest: string | null; // Add openInterest property
}

// Add interface for funding rate data
interface FundingRateData {
  rate: number | null;
  nextFundingTime: number | null;
  countdown: string | null;
}

export default function TradingRoomPage({ roomData }: { roomData: RoomData }) {
  const params = useParams();
  const router = useRouter();
  const roomNameParam = params.roomName as string;
  const container = useRef<HTMLDivElement>(null);
  // Initialize message as empty string to avoid uncontrolled to controlled warning
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Extract room ID from the URL - properly handle UUID format
  // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
  const roomId =
    roomData?.id || (roomNameParam ? roomNameParam.substring(0, 36) : "");

  // State for the room details and user
  const [roomDetails, setRoomDetails] = useState<RoomData | null>(
    roomData || null
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!roomData);
  const [participants, setParticipants] = useState<User[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [priceDataLoaded, setPriceDataLoaded] = useState(false);

  const [showWarning, setShowWarning] = useState(false);

  // Add this near the other state declarations
  // Update the initial state to include volume
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
    openInterest: null, // Initialize openInterest as null
  });

  // Add state for funding rate data
  const [fundingData, setFundingData] = useState<FundingRateData>({
    rate: null,
    nextFundingTime: null,
    countdown: null,
  });

  // WebSocket refs
  const wsTicker = useRef<WebSocket | null>(null);
  const wsFunding = useRef<WebSocket | null>(null); // Add this line

  // Ref to track the last update time to prevent too frequent updates
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 500; // Update at most every 500ms

  // Format price to 2 decimal places
  const formatPrice = (price: string | number): string => {
    const numPrice =
      typeof price === "string" ? Number.parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  // Format large numbers with commas
  const formatLargeNumber = (num: number | string): string => {
    if (typeof num === "string") {
      num = Number.parseFloat(num);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  // Format countdown time (HH:MM:SS)
  const formatCountdown = (milliseconds: number): string => {
    if (milliseconds <= 0) return "00:00:00";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Extract base and quote currency from symbol
  const extractCurrencies = (
    symbol: string
  ): { base: string; quote: string } => {
    // Common quote currencies
    const quoteCurrencies = ["USDT", "BTC", "ETH", "BNB", "BUSD"];

    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        return {
          base: symbol.slice(0, symbol.length - quote.length),
          quote,
        };
      }
    }

    // Default fallback
    return {
      base: symbol.slice(0, -4),
      quote: symbol.slice(-4),
    };
  };

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Fetch user data
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            return;
          }

          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, []);

  // Fetch room details if not provided
  useEffect(() => {
    if (roomData) {
      setRoomDetails(roomData);
      setIsLoading(false);

      // Set the selected symbol
      if (roomData.trading_pairs && roomData.trading_pairs.length > 0) {
        setSelectedSymbol(roomData.trading_pairs[0]);
      }

      // Fetch owner name
      const fetchOwner = async () => {
        try {
          if (!roomData.owner_id) {
            console.log("No owner ID available");
            setOwnerName("Unknown");
            return;
          }

          const { data: ownerData, error: ownerError } = await supabase
            .from("users")
            .select("first_name, last_name")
            .eq("id", roomData.owner_id)
            .single();

          if (ownerError) {
            console.error("Error fetching owner data:", ownerError);
            setOwnerName("Unknown");
          } else if (ownerData) {
            setOwnerName(`${ownerData.first_name} ${ownerData.last_name}`);
          } else {
            setOwnerName("Unknown");
          }
        } catch (error) {
          console.error("Failed to fetch owner:", error);
          setOwnerName("Unknown");
        }
      };

      // Always fetch participants, even if the array appears empty
      const fetchParticipants = async () => {
        try {
          if (!roomData.participants || roomData.participants.length === 0) {
            console.log("No participants to fetch");
            setParticipants([]);
            return;
          }

          console.log("Fetching participants:", roomData.participants);

          const { data: participantsData, error: participantsError } =
            await supabase
              .from("users")
              .select("id, first_name, last_name, email, avatar_url")
              .in("id", roomData.participants);

          if (participantsError) {
            console.error("Error fetching participants:", participantsError);
            setParticipants([]);
          } else {
            console.log("Participants fetched:", participantsData);
            setParticipants(participantsData || []);
          }
        } catch (error) {
          console.error("Failed to fetch participants:", error);
          setParticipants([]);
        }
      };

      fetchOwner();

      fetchParticipants();
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);

        if (!roomId) {
          console.error("No room ID available");
          router.push("/");
          return;
        }

        console.log("Fetching room details for ID:", roomId);

        const { data, error } = await supabase
          .from("trading_rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (error) {
          console.error("Error fetching room details:", error);
          toast.error("Failed to load room details");
          router.push("/");
          return;
        }

        setRoomDetails(data);

        // Set the selected symbol
        if (data.trading_pairs && data.trading_pairs.length > 0) {
          setSelectedSymbol(data.trading_pairs[0]);
        }

        // Fetch owner name
        try {
          if (data.owner_id) {
            const { data: ownerData, error: ownerError } = await supabase
              .from("users")
              .select("first_name, last_name")
              .eq("id", data.owner_id)
              .single();

            if (ownerError) {
              console.error("Error fetching owner data:", ownerError);
              setOwnerName("Unknown");
            } else if (ownerData) {
              setOwnerName(`${ownerData.first_name} ${ownerData.last_name}`);
            } else {
              setOwnerName("Unknown");
            }
          } else {
            setOwnerName("Unknown");
          }
        } catch (error) {
          console.error("Failed to fetch owner:", error);
          setOwnerName("Unknown");
        }

        // Always fetch participants, even if the array appears empty
        try {
          if (!data.participants || data.participants.length === 0) {
            console.log("No participants to fetch");
            setParticipants([]);
          } else {
            console.log("Fetching participants:", data.participants);

            const { data: participantsData, error: participantsError } =
              await supabase
                .from("users")
                .select("id, first_name, last_name, email, avatar_url")
                .in("id", data.participants);

            if (participantsError) {
              console.error("Error fetching participants:", participantsError);
              setParticipants([]);
            } else {
              console.log("Participants fetched:", participantsData);
              setParticipants(participantsData || []);
            }
          }
        } catch (error) {
          console.error("Failed to fetch participants:", error);
          setParticipants([]);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }

    // Set up real-time subscription for room updates
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          const updatedRoom = payload.new as RoomData;
          setRoomDetails(updatedRoom);

          // When room is updated, also refresh participants
          if (updatedRoom.participants && updatedRoom.participants.length > 0) {
            console.log(
              "Room updated, refreshing participants:",
              updatedRoom.participants
            );

            const { data: participantsData, error: participantsError } =
              await supabase
                .from("users")
                .select("id, first_name, last_name, email, avatar_url")
                .in("id", updatedRoom.participants);

            if (participantsError) {
              console.error(
                "Error fetching participants after update:",
                participantsError
              );
            } else {
              console.log("Participants refreshed:", participantsData);
              setParticipants(participantsData || []);
            }
          } else {
            setParticipants([]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSubscription);
    };
  }, [roomId, router, roomData]);

  // Add this new useEffect after the existing ones
  useEffect(() => {
    // Only attempt to refresh participants if we have room details
    if (roomDetails) {
      refreshParticipants();
    }

    // Set up interval to periodically refresh participants
    // but only if we have room details
    let intervalId: NodeJS.Timeout | null = null;

    if (roomDetails) {
      intervalId = setInterval(() => {
        // Only refresh if component is still mounted and we have room details
        if (roomDetails) {
          refreshParticipants();
        }
      }, 60000); // Reduced frequency to once per minute to minimize potential errors
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [roomDetails, user?.id]);

  // Fetch 24hr ticker data and set up WebSocket for real-time updates
  useEffect(() => {
    if (!selectedSymbol) return;

    // Initial fetch of 24hr ticker data
    // Update the fetchTickerData function to capture volume
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
            volume: data.volume ? data.volume : prev.volume, // Add volume data
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
                volume: data.v ? data.v : prev.volume, // Add volume data
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
  }, [selectedSymbol, fundingData.nextFundingTime]);

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
      const currentContainer = container.current;
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [roomDetails]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !roomDetails) return;

    try {
      // In a real app, you would save this to a messages table
      // For now, we'll just add it to the local state
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}`,
        created_at: new Date().toISOString(),
      };

      setMessages([...messages, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Get room name initial for avatar
  const getRoomInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "R";
  };

  const handleStartStreaming = () => {
    toast.success("Streaming started successfully");
    // Here you would implement the actual streaming functionality
    // This could involve WebRTC, socket connections, or other streaming technologies
  };

  // Add this function before the return statement
  // Update the handlePriceUpdate function to include volume
  const handlePriceUpdate = (data: {
    currentPrice: string;
    priceDirection: "up" | "down" | "none";
    priceChange: number;
    priceChangePercent: number;
    indexPrice?: string;
    highPrice?: string;
    lowPrice?: string;
    quoteVolume?: string;
    volume?: string;
    openInterest?: string; // Add openInterest parameter
  }) => {
    // Throttle updates to prevent flickering
    const now = Date.now();
    if (now - lastUpdateTime.current < updateInterval) {
      return;
    }

    lastUpdateTime.current = now;

    setPriceData((prev) => {
      const newPrice = data.currentPrice;
      let direction = data.priceDirection;

      // Determine price direction if not provided
      if (direction === "none" && prev.currentPrice) {
        if (Number(newPrice) > Number(prev.currentPrice)) {
          direction = "up";
        } else if (Number(newPrice) < Number(prev.currentPrice)) {
          direction = "down";
        }
      }

      return {
        ...prev,
        currentPrice: newPrice,
        priceDirection: direction,
        priceChange: data.priceChange,
        priceChangePercent: data.priceChangePercent,
        indexPrice: data.indexPrice || newPrice,
        highPrice: data.highPrice
          ? formatPrice(data.highPrice)
          : prev.highPrice,
        lowPrice: data.lowPrice ? formatPrice(data.lowPrice) : prev.lowPrice,
        quoteVolume: data.quoteVolume || prev.quoteVolume,
        volume: data.volume || prev.volume,
        openInterest: data.openInterest || prev.openInterest, // Add openInterest
      };
    });

    setPriceDataLoaded(true);
  };

  // Handle symbol change
  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    // Reset price data loaded state when changing symbols
    setPriceDataLoaded(false);
  };

  const refreshParticipants = async () => {
    try {
      if (!roomDetails || !roomDetails.participants) {
        setParticipants([]);
        return;
      }

      // Check if participants array is empty
      if (roomDetails.participants.length === 0) {
        setParticipants([]);
        return;
      }

      // Skip the refresh if we already have participants data
      // This reduces unnecessary API calls that might fail
      if (participants.length > 0) {
        return;
      }

      console.log(
        "Refreshing participants on mount/user change:",
        roomDetails.participants
      );

      // Check if Supabase client is available
      if (!supabase || typeof supabase.from !== "function") {
        console.error("Supabase client is not properly initialized");
        return;
      }

      try {
        const { data: participantsData, error: participantsError } =
          await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url")
            .in("id", roomDetails.participants);

        if (participantsError) {
          console.error("Error refreshing participants:", participantsError);
        } else if (participantsData) {
          console.log("Participants refreshed:", participantsData);
          setParticipants(participantsData);
        }
      } catch (fetchError) {
        console.error(
          "Network error when refreshing participants:",
          fetchError
        );
        // Don't update state on network error - keep existing participants
      }
    } catch (error) {
      console.error("Failed to refresh participants:", error);
      // Don't throw or update state on error
    }
  };

  // Check if warning should be shown
  useEffect(() => {
    const checkWarningDismissed = () => {
      const dismissedTime = localStorage.getItem("trading-warning-dismissed");

      if (!dismissedTime) {
        setShowWarning(true);
        return;
      }

      // Check if 24 hours have passed since last dismissal
      const lastDismissed = Number.parseInt(dismissedTime, 10);
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;

      if (Date.now() - lastDismissed > twentyFourHoursMs) {
        setShowWarning(true);
        localStorage.removeItem("trading-warning-dismissed");
      }
    };

    // Small delay to ensure the component is mounted
    const timer = setTimeout(() => {
      checkWarningDismissed();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle warning confirmation
  const handleWarningConfirm = () => {
    setShowWarning(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E74C3C]"></div>
      </div>
    );
  }

  if (!roomDetails) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-white mb-4">Room not found</p>
        <Link href="/">
          <Button className="bg-[#E74C3C] hover:bg-[#E74C3C]/90">
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <WarningDialog isOpen={showWarning} onConfirm={handleWarningConfirm} />

      <div className="p-4 w-full flex gap-1.5 bg-[#181a20]">
        <div className="h-full text-white rounded-md shadow-sm flex-1 w-full">
          <div className="flex flex-col gap-1.5">
            {/* New Header Design */}
            <div className="w-full bg-[#1a1e27] border border-[#3f445c] rounded-md">
              <div className="flex items-center p-3">
                {/* Avatar and Room Info */}
                <div className="flex items-center">
                  <Avatar className="h-16 w-16 bg-green-700 border-2 border-green-500">
                    <AvatarFallback className="bg-green-700 text-white text-2xl">
                      {getRoomInitial(roomDetails.room_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h2 className="text-lg font-bold">
                      {roomDetails.room_name}
                    </h2>
                    <p className="text-sm text-gray-400">{ownerName}</p>
                    <div className="flex items-center mt-1 text-xs">
                      <span className="text-yellow-500 mr-2">
                        {roomDetails.current_participants}/
                        {roomDetails.max_participants}
                      </span>
                      <span className="flex items-center text-yellow-500 mr-1">
                        <span className="mr-1">•</span> {participants.length}
                      </span>
                      <span className="flex items-center text-yellow-500">
                        <span className="mr-1">•</span> 13
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trading Assets */}
                <div className="ml-10 border-l border-[#3f445c] pl-6">
                  <div className="text-sm font-medium text-gray-400 mb-1">
                    Trading Asset
                  </div>
                  <div className="flex flex-col">
                    {roomDetails.trading_pairs.map((pair, index) => (
                      <div key={index} className="font-bold">
                        {pair}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today Records */}
                <div className="ml-10 border-l border-[#3f445c] pl-6">
                  <div className="text-sm font-medium text-gray-400 mb-1">
                    Today Records
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-blue-500 font-bold mr-2">BUY</span>
                      <span className="text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" /> 20%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-500 font-bold mr-2">SELL</span>
                      <span className="text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" /> 150%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Records */}
                <div className="ml-10 border-l border-[#3f445c] pl-6">
                  <div className="text-sm font-medium text-gray-400 mb-1">
                    Total Records
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-blue-500 font-bold mr-2">BUY</span>
                      <span className="text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" /> 17,102%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-red-500 font-bold mr-2">SELL</span>
                      <span className="text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1" /> 34,141%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Start Streaming Button - Only visible to room owner */}
                {user && user.id === roomDetails.owner_id && (
                  <div className="ml-auto flex items-center mr-4">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2"
                      onClick={handleStartStreaming}
                    >
                      <VideoIcon className="h-5 w-5" />
                      Start Broadcasting
                    </Button>
                  </div>
                )}

                {/* Donate KOR Coin */}
                <div
                  className={`flex items-center ${!(user && user.id === roomDetails.owner_id) ? "ml-auto" : ""}`}
                >
                  <div className="flex flex-col items-end mr-3">
                    <div className="text-lg font-bold">Donate Kor coin</div>
                    <div className="text-yellow-500 font-medium">
                      300,000 kor.coin
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-yellow-500 flex items-center justify-center text-2xl font-bold">
                      P
                    </div>
                    <Button className="mt-1 bg-blue-600 hover:bg-blue-700 text-xs px-2 py-0 h-6">
                      Recharge
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className=" bg-[#212631] rounded-md w-full">
              <PriceInfoBar
                tradingPairs={roomDetails.trading_pairs}
                selectedSymbol={selectedSymbol || roomDetails.trading_pairs[0]}
                priceData={priceData}
                priceDataLoaded={priceDataLoaded}
                fundingData={fundingData}
                onSymbolChange={handleSymbolChange}
                formatLargeNumber={formatLargeNumber}
                extractCurrencies={extractCurrencies}
              />
            </div>

            <div className="flex gap-1.5 w-full ">
              {/* Trading Chart */}
              <div className="bg-[#212631] rounded w-full h-[45rem] border border-[#3f445c]">
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
              {/* Tabs */}
              <div className="bg-[#212631] p-1 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
                <TradingTabs
                  symbol={selectedSymbol || roomDetails.trading_pairs[0]}
                  onPriceUpdate={handlePriceUpdate}
                />
              </div>

              <TradingMarketPlace />
            </div>

            <div className="bg-[#212631] w-full h-[12rem] border border-[#3f445c]"></div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-[19rem] rounded-md text-white flex flex-col gap-1.5">
          <div className="w-full bg-[#212631] h-fit p-4 py-3 text-sm border border-[#3f445c]">
            <div className="w-full bg-[#212631] rounded">
              <div className="flex justify-between text-sm mb-2 text-gray-400">
                <div>
                  Participants ({roomDetails.current_participants}/
                  {roomDetails.max_participants})
                </div>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs mr-2">
                        {participant.first_name?.charAt(0) || ""}
                        {participant.last_name?.charAt(0) || ""}
                      </div>
                      <span>
                        {participant.first_name || ""}{" "}
                        {participant.last_name || ""}
                      </span>
                    </div>
                    {participant.id === roomDetails.owner_id && (
                      <span className="text-xs bg-[#E74C3C] px-2 py-0.5 rounded">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full bg-[#212631] h-full relative border border-[#3f445c]">
            <div className="bg-[#1a1e27] flex items-center justify-between w-full p-2">
              <div className="text-sm">Chat</div>
              <span className="text-xs">채팅방 규정</span>
            </div>
            <div className="flex-1 p-2 overflow-y-auto max-h-[400px]">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-2">
                  <div className="flex items-center">
                    <span className="font-bold text-sm">{msg.user_name}:</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="absolute w-full px-2 bottom-2">
              <div className="relative">
                {user ? (
                  <>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="rounded-none border-[#3f445c] text-white/70 text-sm focus-visible:ring-0 selection:bg-[#f97316] selection:text-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="absolute right-0 top-0 h-full rounded-none border bg-transparent cursor-pointer"
                      onClick={handleSendMessage}
                    >
                      Send
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      value=""
                      disabled
                      placeholder="Please Login to chat"
                      className="rounded-none border-[#3f445c] text-white/70 text-sm focus-visible:ring-0"
                    />
                    <Button
                      variant="outline"
                      className="absolute right-0 top-0 h-full rounded-none border bg-transparent cursor-pointer"
                      disabled
                    >
                      Send
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
