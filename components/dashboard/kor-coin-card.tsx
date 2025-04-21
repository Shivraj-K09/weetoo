"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import type { KorCoinStats } from "@/lib/supabase/queries";

// Local storage key for previous total
const KOR_COIN_HISTORY_KEY = "kor_coin_previous_total";

export function KorCoinCard() {
  const [stats, setStats] = useState<KorCoinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKorCoinStats() {
      try {
        setLoading(true);
        const response = await fetch("/api/kor-coins");

        if (!response.ok) {
          throw new Error("Failed to fetch KOR_Coin statistics");
        }

        const { data } = await response.json();

        // Get previous total from localStorage
        let previousTotal = 0;
        try {
          const savedData = localStorage.getItem(KOR_COIN_HISTORY_KEY);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            previousTotal = parsed.totalCoins || 0;
          }
        } catch (e) {
          console.error("Error reading from localStorage:", e);
        }

        // Calculate percentage change
        let percentageChange = 0;
        let direction: "up" | "down" = "up";

        if (previousTotal > 0) {
          const difference = data.totalCoins - previousTotal;
          percentageChange =
            Math.round((difference / previousTotal) * 1000) / 10;
          direction = percentageChange >= 0 ? "up" : "down";
        }

        // Save current total for next time
        try {
          localStorage.setItem(
            KOR_COIN_HISTORY_KEY,
            JSON.stringify({
              totalCoins: data.totalCoins,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }

        // Update stats with calculated trend
        setStats({
          ...data,
          percentageChange: Math.abs(percentageChange),
          direction,
        });
      } catch (err) {
        console.error("Error fetching KOR_Coin stats:", err);
        setError("Failed to load KOR_Coin data");
      } finally {
        setLoading(false);
      }
    }

    fetchKorCoinStats();

    // Set up polling to refresh data every 5 minutes
    const intervalId = setInterval(fetchKorCoinStats, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>KOR_Coin</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            Loading...
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Fetching latest data...
          </div>
        </CardFooter>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>KOR_Coin</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            --
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-destructive">
            {error || "Failed to load data"}
          </div>
        </CardFooter>
      </Card>
    );
  }

  const TrendIcon =
    stats.direction === "up" ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = stats.direction === "up" ? "" : "text-destructive";
  const trendText =
    stats.direction === "up"
      ? "Trending up this period"
      : "Trending down this period";
  const subtextMessage =
    stats.direction === "up"
      ? "More users purchasing KOR_Coins"
      : "Users spending more KOR_Coins";

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>KOR_Coin</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {formatNumber(stats.totalCoins)}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge
            variant="outline"
            className={`flex gap-1 rounded-lg text-xs ${trendColor}`}
          >
            <TrendIcon className="size-3" />
            {stats.direction === "up" ? "+" : ""}
            {stats.percentageChange}%
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {trendText} <TrendIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{subtextMessage}</div>
      </CardFooter>
    </Card>
  );
}
