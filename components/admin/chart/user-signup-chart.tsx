"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

// Sample data for user sign-ups and UID registrations
const chartData = [
  {
    day: "Monday",
    signups: 180,
    registrations: 120,
  },
  {
    day: "Tuesday",
    signups: 220,
    registrations: 150,
  },
  {
    day: "Wednesday",
    signups: 240,
    registrations: 170,
  },
  {
    day: "Thursday",
    signups: 190,
    registrations: 130,
  },
  {
    day: "Friday",
    signups: 210,
    registrations: 160,
  },
  {
    day: "Saturday",
    signups: 120,
    registrations: 90,
  },
  {
    day: "Sunday",
    signups: 100,
    registrations: 70,
  },
];

const chartConfig = {
  signups: {
    label: "New Sign-ups",
    color: "hsl(215, 100%, 50%)",
  },
  registrations: {
    label: "UID Registration",
    color: "hsl(340, 100%, 60%)",
  },
} satisfies ChartConfig;

export function UserSignupChart() {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>User Sign-Up trends</CardTitle>
        <CardDescription>
          Daily new sign-ups and UID registration status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
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
              dataKey="day"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 250]}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="signups"
              fill="hsl(215, 100%, 50%)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="registrations"
              fill="hsl(340, 100%, 60%)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(215,100%,50%)]"></div>
            <span>New Sign-ups</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[hsl(340,100%,60%)]"></div>
            <span>UID Registration</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
