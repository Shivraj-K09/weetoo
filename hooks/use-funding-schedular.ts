"use client";

import { useEffect, useRef } from "react";
import { fetchAndStoreFundingRates } from "@/app/actions/funding-actions";
import { applyFundingFees } from "@/app/actions/funding-calculations";

// This hook handles funding operations without relying on server-side cron jobs
export function useFundingScheduler() {
  const lastFundingCheckRef = useRef<number>(0);
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    // Function to check if it's time for a funding event
    async function checkFundingTime() {
      const now = new Date();
      const currentHour = now.getUTCHours();
      const currentMinute = now.getUTCMinutes();

      // Funding times are at 00:00, 08:00, and 16:00 UTC
      // We'll check if we're within the first 5 minutes of these hours
      const isFundingHour =
        currentHour === 0 || currentHour === 8 || currentHour === 16;
      const isWithinFirstFiveMinutes = currentMinute < 5;

      if (isFundingHour && isWithinFirstFiveMinutes) {
        // Check if we've already processed funding in this window
        // This prevents multiple executions if the page stays open
        const currentTimestamp = Math.floor(now.getTime() / (5 * 60 * 1000)); // Round to 5-minute windows

        if (currentTimestamp > lastFundingCheckRef.current) {
          console.log(
            "[useFundingScheduler] Funding time detected, applying funding fees"
          );

          // Update the timestamp first to prevent duplicate runs
          lastFundingCheckRef.current = currentTimestamp;

          try {
            // First refresh funding rates
            await fetchAndStoreFundingRates();

            // Then apply funding fees
            const result = await applyFundingFees();
            console.log("[useFundingScheduler] Funding fees applied:", result);
          } catch (error) {
            console.error(
              "[useFundingScheduler] Error applying funding fees:",
              error
            );
          }
        }
      }

      // Fetch funding rates every 30 minutes if needed
      const thirtyMinutesAgo = now.getTime() - 30 * 60 * 1000;
      if (lastFetchRef.current < thirtyMinutesAgo) {
        lastFetchRef.current = now.getTime();

        try {
          await fetchAndStoreFundingRates();
        } catch (error) {
          console.error(
            "[useFundingScheduler] Error fetching funding rates:",
            error
          );
        }
      }
    }

    // Run immediately on component mount
    checkFundingTime();

    // Then check every minute
    const intervalId = setInterval(checkFundingTime, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
}
