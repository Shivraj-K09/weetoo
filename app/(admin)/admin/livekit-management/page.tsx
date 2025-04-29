"use client";

import { useState, useCallback } from "react";
import { ChevronDown, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LiveKitUsageChart } from "@/components/livekit/livekit-usage-chart";
import { LiveKitUsageTable } from "@/components/livekit/livekit-usage-table";
import { LiveKitUserDetails } from "@/components/livekit/livekit-user-details";
import type { DateRange } from "react-day-picker";

export default function LiveKitDashboard() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 space-y-6">
        {/* Stats Cards */}
        <div className="*:data-[slot=card]:shadow-none @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
          <Card className="@container/card shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
            <CardHeader className="relative">
              <CardDescription>Total Broadcast Time</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                1,284 hours
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge
                  variant="outline"
                  className="flex gap-1 rounded-lg text-xs"
                >
                  <TrendingUpIcon className="size-3" />
                  +12%
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending up this month <TrendingUpIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Compared to previous month
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
            <CardHeader className="relative">
              <CardDescription>Active Broadcasters</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                24 users
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge
                  variant="outline"
                  className="flex gap-1 rounded-lg text-xs"
                >
                  <TrendingUpIcon className="size-3" />
                  +8%
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Growing user base <TrendingUpIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                2 new broadcasters this month
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
            <CardHeader className="relative">
              <CardDescription>Avg. Session Duration</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                42 minutes
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge
                  variant="outline"
                  className="flex gap-1 rounded-lg text-xs"
                >
                  <TrendingDownIcon className="size-3" />
                  -5%
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Slightly shorter sessions{" "}
                <TrendingDownIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Down from 44 minutes last month
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
            <CardHeader className="relative">
              <CardDescription>Estimated Cost</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                $128.40
              </CardTitle>
              <div className="absolute right-4 top-4">
                <Badge
                  variant="outline"
                  className="flex gap-1 rounded-lg text-xs"
                >
                  <TrendingUpIcon className="size-3" />
                  +10%
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Increased usage <TrendingUpIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Based on current LiveKit rates
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Usage Chart and Top Users */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 shadow-none">
            <CardHeader>
              <CardTitle>Usage Over Time</CardTitle>
              <CardDescription>
                Broadcasting and listener minutes over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <LiveKitUsageChart />
            </CardContent>
          </Card>

          <Card className="col-span-3 shadow-none">
            <CardHeader>
              <CardTitle>Top Users</CardTitle>
              <CardDescription>
                Users with the most broadcast time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveKitUsageTable />
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>
                Detailed usage statistics by user
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Most active</DropdownMenuItem>
                <DropdownMenuItem>Recently active</DropdownMenuItem>
                <DropdownMenuItem>Alphabetical</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <LiveKitUserDetails
                userId={selectedUser}
                onBack={() => setSelectedUser(null)}
              />
            ) : (
              <LiveKitUsageTable onUserSelect={setSelectedUser} />
            )}
          </CardContent>
        </Card>

        {/* Room Usage */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Room Statistics</CardTitle>
            <CardDescription>
              LiveKit usage statistics by trading room
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiveKitUsageTable isRoomView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
