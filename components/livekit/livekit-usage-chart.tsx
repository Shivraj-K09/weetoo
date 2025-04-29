"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// This is sample data - would be replaced with real data from your API
const data = [
  { name: "Jan 1", broadcast: 40, listeners: 24 },
  { name: "Jan 2", broadcast: 30, listeners: 13 },
  { name: "Jan 3", broadcast: 20, listeners: 98 },
  { name: "Jan 4", broadcast: 27, listeners: 39 },
  { name: "Jan 5", broadcast: 18, listeners: 48 },
  { name: "Jan 6", broadcast: 23, listeners: 38 },
  { name: "Jan 7", broadcast: 34, listeners: 43 },
  { name: "Jan 8", broadcast: 45, listeners: 30 },
  { name: "Jan 9", broadcast: 65, listeners: 40 },
  { name: "Jan 10", broadcast: 78, listeners: 50 },
  { name: "Jan 11", broadcast: 90, listeners: 45 },
  { name: "Jan 12", broadcast: 85, listeners: 60 },
  { name: "Jan 13", broadcast: 92, listeners: 70 },
  { name: "Jan 14", broadcast: 75, listeners: 55 },
];

export function LiveKitUsageChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" opacity={0.3} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            borderRadius: "0.375rem",
            color: "#f3f4f6",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="broadcast"
          stroke="#f97316"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="listeners"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
