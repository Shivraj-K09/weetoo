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
import type { DailySignupStats } from "@/lib/supabase/user-queries";

export function DailySignupsCard() {
  const [stats, setStats] = useState<DailySignupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailySignups() {
      try {
        setLoading(true);
        const response = await fetch("/api/users/daily");

        if (!response.ok) {
          throw new Error("Failed to fetch daily signup statistics");
        }

        const { data } = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching daily signup stats:", err);
        setError("Failed to load daily signup data");
      } finally {
        setLoading(false);
      }
    }

    fetchDailySignups();

    // Set up polling to refresh data every 5 minutes
    const intervalId = setInterval(fetchDailySignups, 5 * 60 * 1000);

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
          <CardDescription>New signups daily</CardDescription>
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
          <CardDescription>New signups daily</CardDescription>
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

  // Customize messages based on trend
  const trendText =
    stats.direction === "up"
      ? `Up ${stats.percentageChange}% from yesterday`
      : `Down ${stats.percentageChange}% from yesterday`;

  const subtextMessage =
    stats.direction === "up"
      ? "Acquisition strategy working well"
      : "Acquisition needs attention";

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>New signups daily</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {formatNumber(stats.dailySignups)}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge
            variant="outline"
            className={`flex gap-1 rounded-lg text-xs ${trendColor}`}
          >
            <TrendIcon className="size-3" />
            {stats.direction === "up" ? "+" : "-"}
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
