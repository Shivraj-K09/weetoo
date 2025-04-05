"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Sample data for KOR_Coin activities
const chartData = [
  {
    month: "1월",
    deposits: 850000,
    withdrawals: 700000,
    activityPoints: 380000,
    usageAmount: 450000,
  },
  {
    month: "2월",
    deposits: 900000,
    withdrawals: 720000,
    activityPoints: 350000,
    usageAmount: 430000,
  },
  {
    month: "3월",
    deposits: 880000,
    withdrawals: 700000,
    activityPoints: 370000,
    usageAmount: 450000,
  },
  {
    month: "4월",
    deposits: 1100000,
    withdrawals: 850000,
    activityPoints: 450000,
    usageAmount: 520000,
  },
  {
    month: "5월",
    deposits: 1350000,
    withdrawals: 1050000,
    activityPoints: 500000,
    usageAmount: 580000,
  },
  {
    month: "6월",
    deposits: 1400000,
    withdrawals: 1000000,
    activityPoints: 520000,
    usageAmount: 600000,
  },
  {
    month: "7월",
    deposits: 1350000,
    withdrawals: 950000,
    activityPoints: 500000,
    usageAmount: 580000,
  },
  {
    month: "8월",
    deposits: 1200000,
    withdrawals: 850000,
    activityPoints: 450000,
    usageAmount: 550000,
  },
  {
    month: "9월",
    deposits: 1100000,
    withdrawals: 800000,
    activityPoints: 420000,
    usageAmount: 520000,
  },
  {
    month: "10월",
    deposits: 950000,
    withdrawals: 750000,
    activityPoints: 400000,
    usageAmount: 500000,
  },
  {
    month: "11월",
    deposits: 980000,
    withdrawals: 730000,
    activityPoints: 380000,
    usageAmount: 480000,
  },
  {
    month: "12월",
    deposits: 1080000,
    withdrawals: 820000,
    activityPoints: 420000,
    usageAmount: 520000,
  },
];

const chartConfig = {
  deposits: {
    label: "Deposits",
    color: "hsl(215, 100%, 50%)",
  },
  withdrawals: {
    label: "Withdrawals",
    color: "hsl(340, 100%, 60%)",
  },
  activityPoints: {
    label: "Activity Points",
    color: "hsl(145, 80%, 50%)",
  },
  usageAmount: {
    label: "Usage Amount",
    color: "hsl(45, 100%, 50%)",
  },
} satisfies ChartConfig;

export function KorcoinChart() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>KOR_Coin Activities</CardTitle>
        <CardDescription>
          Deposits, withdrawals, activity points, usage trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) =>
                value === 0 ? "0" : `${value / 1000}k`
              }
              domain={[0, 1400000]}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="deposits"
              type="monotone"
              stroke="hsl(215, 100%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="withdrawals"
              type="monotone"
              stroke="hsl(340, 100%, 60%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="activityPoints"
              type="monotone"
              stroke="hsl(145, 80%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="usageAmount"
              type="monotone"
              stroke="hsl(45, 100%, 50%)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(215,100%,50%)]"></div>
            <span>Deposits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(340,100%,60%)]"></div>
            <span>Withdrawals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(145,80%,50%)]"></div>
            <span>Activity Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(45,100%,50%)]"></div>
            <span>Usage Amount</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
