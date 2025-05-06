"use client";

import { useState, useEffect } from "react";
import { getRoomTradingRecords } from "@/app/actions/trading-records-actions";
import { supabase } from "@/lib/supabase/client";

// Types for trading records data
interface TradingStats {
  count: number;
  percentage: number;
}

interface TradingDirection {
  buy: TradingStats;
  sell: TradingStats;
}

interface TradingRecordsData {
  success: boolean;
  message: string;
  daily: TradingDirection;
  total: TradingDirection;
}

export function useTradingRecords(roomId: string) {
  const [data, setData] = useState<TradingRecordsData>({
    success: false,
    message: "Loading...",
    daily: {
      buy: { count: 0, percentage: 0 },
      sell: { count: 0, percentage: 0 },
    },
    total: {
      buy: { count: 0, percentage: 0 },
      sell: { count: 0, percentage: 0 },
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trading records
  const fetchTradingRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getRoomTradingRecords(roomId);
      setData(result);
    } catch (err: any) {
      console.error("Error fetching trading records:", err);
      setError(err.message || "Failed to fetch trading records");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (roomId) {
      fetchTradingRecords();
    }
  }, [roomId]);

  // Set up real-time subscription for trading records
  useEffect(() => {
    if (!roomId) return;

    // Subscribe to changes in trading_records table
    const subscription = supabase
      .channel(`trading_records_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trading_records",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Refresh data when records change
          fetchTradingRecords();
        }
      )
      .subscribe();

    // Also listen for position-closed events
    const handlePositionClosed = () => {
      fetchTradingRecords();
    };

    window.addEventListener("position-closed", handlePositionClosed);

    // Cleanup
    return () => {
      supabase.removeChannel(subscription);
      window.removeEventListener("position-closed", handlePositionClosed);
    };
  }, [roomId]);

  return { ...data, isLoading, error, refetch: fetchTradingRecords };
}
