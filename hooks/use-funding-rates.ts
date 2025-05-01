"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getLatestFundingRate,
  getNextFundingTime,
  fetchAndStoreFundingRates,
} from "@/app/actions/funding-actions";

// Create a cache for funding rates to avoid redundant fetches
const fundingRateCache: Record<
  string,
  {
    rate: number;
    nextFundingTime: Date;
    timestamp: number;
  }
> = {};

// Custom hook to get and display funding rate information
export function useFundingRate(symbol: string) {
  const [fundingRate, setFundingRate] = useState<number | null>(null);
  const [nextFundingTime, setNextFundingTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the latest funding rate and next funding time
  const fetchFundingInfo = useCallback(async () => {
    if (!symbol) return;

    // Check if we have a recent cache (less than 5 minutes old)
    const cache = fundingRateCache[symbol];
    const now = Date.now();
    if (cache && now - cache.timestamp < 5 * 60 * 1000) {
      // Use cached data
      setFundingRate(cache.rate);
      setNextFundingTime(cache.nextFundingTime);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use Promise.all to fetch both rate and time in parallel
      const [rateResult, timeResult] = await Promise.all([
        getLatestFundingRate(symbol),
        getNextFundingTime(symbol),
      ]);

      // Process funding rate
      if (rateResult.success && rateResult.data) {
        setFundingRate(rateResult.data.funding_rate);
      } else {
        console.error("Error fetching funding rate:", rateResult.error);
        setError("Could not load funding rate");

        // If we failed to get data from DB, trigger a fetch from Binance
        // but don't wait for it to complete
        fetchAndStoreFundingRates().catch((err) =>
          console.error("Background funding rate fetch failed:", err)
        );
      }

      // Process next funding time
      if (timeResult.success && timeResult.nextFundingTime) {
        const nextTime = new Date(timeResult.nextFundingTime);
        setNextFundingTime(nextTime);

        // Update cache
        if (rateResult.success && rateResult.data) {
          fundingRateCache[symbol] = {
            rate: rateResult.data.funding_rate,
            nextFundingTime: nextTime,
            timestamp: now,
          };
        }
      } else {
        console.error("Error fetching next funding time:");
      }
    } catch (err) {
      console.error("Unexpected error in useFundingRate:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchFundingInfo();

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchFundingInfo, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [symbol, fetchFundingInfo]);

  // Update the time remaining countdown every second
  useEffect(() => {
    if (!nextFundingTime) return;

    // Special case: if we're already past the funding time, refresh the data
    const now = new Date();
    if (nextFundingTime.getTime() <= now.getTime()) {
      console.log("Past funding time, refreshing data");
      // Wait a bit to avoid rate limits, then fetch new data
      const refreshTimeout = setTimeout(() => {
        fetchFundingInfo();
      }, 5000);

      return () => clearTimeout(refreshTimeout);
    }

    function updateTimeRemaining() {
      const now = new Date();
      const diff = nextFundingTime
        ? nextFundingTime.getTime() - now.getTime()
        : 0;

      if (diff <= 0) {
        // If we've passed the funding time, refresh the data
        setTimeRemaining("00:00:00");

        // Refresh the funding data when we hit zero
        // This will fetch new funding times and rates
        const refreshTimeout = setTimeout(() => {
          // Fetch new funding data
          fetchFundingInfo();
        }, 5000); // Wait 5 seconds before refreshing to avoid rate limits

        return () => clearTimeout(refreshTimeout);
      }

      // Calculate hours, minutes, seconds
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format as HH:MM:SS
      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }

    // Update immediately and then every second
    updateTimeRemaining();
    const intervalId = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(intervalId);
  }, [nextFundingTime, fetchFundingInfo]);

  // Format the funding rate as a percentage with sign
  const formattedRate =
    fundingRate !== null
      ? `${fundingRate > 0 ? "+" : ""}${(fundingRate * 100).toFixed(4)}%`
      : "-";

  return {
    fundingRate,
    formattedRate,
    nextFundingTime,
    timeRemaining,
    isLoading,
    error,
  };
}
