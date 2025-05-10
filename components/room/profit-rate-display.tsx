"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getUserProfitRate,
  resetNegativeProfitRate,
} from "@/app/actions/profit-rate-actions";
import { useEffect } from "react";
import { toast } from "sonner";
interface ProfitRateDisplayProps {
  className?: string;
}

export function ProfitRateDisplay({ className = "" }: ProfitRateDisplayProps) {
  const [profitRate, setProfitRate] = useState<number | null>(null);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchProfitRate = async () => {
    setIsLoading(true);
    try {
      const result = await getUserProfitRate();
      if (result.success) {
        setProfitRate(result.profitRate);
        setTotalRooms(result.totalRooms);
      } else {
        console.error("Error fetching profit rate:", result.error);
      }
    } catch (error) {
      console.error("Error in fetchProfitRate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const result = await resetNegativeProfitRate();
      if (result.success) {
        toast.success(result.message || "Profit rate reset successfully");
        // Refresh the profit rate after reset
        fetchProfitRate();
      } else {
        toast.error(result.error || "Failed to reset profit rate");
      }
    } catch (error) {
      console.error("Error in handleReset:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchProfitRate();
    // Set up polling to refresh the profit rate every minute
    const intervalId = setInterval(fetchProfitRate, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading && profitRate === null) {
    return <div className={`text-sm ${className}`}>Loading profit rate...</div>;
  }

  if (profitRate === null) {
    return null;
  }

  const isNegative = profitRate < 0;
  const formattedRate = `${profitRate >= 0 ? "+" : ""}${profitRate.toFixed(2)}%`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center flex-col">
        <span className="text-sm font-medium">Cumulative Profit Rate:</span>
        <span
          className={`font-bold ${
            profitRate > 0
              ? "text-green-500"
              : profitRate < 0
                ? "text-red-500"
                : "text-gray-400"
          }`}
        >
          {formattedRate}
        </span>
        {/* <span className="text-xs text-gray-400">({totalRooms} rooms)</span> */}
      </div>

      {isNegative && (
        <Button
          size="sm"
          onClick={handleReset}
          disabled={isResetting}
          className="self-start text-xs bg-none border"
        >
          {isResetting ? "Resetting..." : "Reset Trade History"}
        </Button>
      )}
    </div>
  );
}
