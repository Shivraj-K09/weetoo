"use client";

import { useMemo } from "react";
import { ArrowLeft, Clock, Mic } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample user data - would be replaced with real data from your API
const userData = {
  id: "1",
  name: "Alex Thompson",
  email: "alex@example.com",
  totalBroadcastTime: "42h 15m",
  totalListenerTime: "12h 30m",
  averageSessionDuration: "35m",
  lastActive: "2 hours ago",
  sessions: [
    {
      id: "s1",
      roomName: "Bitcoin Trading Room",
      startTime: "2023-04-07T14:30:00",
      endTime: "2023-04-07T15:45:00",
      duration: "1h 15m",
      type: "broadcast",
    },
    {
      id: "s2",
      roomName: "Forex Strategies",
      startTime: "2023-04-06T10:15:00",
      endTime: "2023-04-06T11:30:00",
      duration: "1h 15m",
      type: "broadcast",
    },
    {
      id: "s3",
      roomName: "Crypto Analysis",
      startTime: "2023-04-05T16:00:00",
      endTime: "2023-04-05T17:15:00",
      duration: "1h 15m",
      type: "listener",
    },
    {
      id: "s4",
      roomName: "Stock Market Live",
      startTime: "2023-04-04T09:30:00",
      endTime: "2023-04-04T10:45:00",
      duration: "1h 15m",
      type: "broadcast",
    },
    {
      id: "s5",
      roomName: "Trading Beginners",
      startTime: "2023-04-03T13:00:00",
      endTime: "2023-04-03T14:00:00",
      duration: "1h",
      type: "listener",
    },
  ],
  dailyUsage: [
    { date: "2023-04-01", broadcastMinutes: 120, listenerMinutes: 45 },
    { date: "2023-04-02", broadcastMinutes: 90, listenerMinutes: 30 },
    { date: "2023-04-03", broadcastMinutes: 150, listenerMinutes: 60 },
    { date: "2023-04-04", broadcastMinutes: 180, listenerMinutes: 45 },
    { date: "2023-04-05", broadcastMinutes: 120, listenerMinutes: 75 },
    { date: "2023-04-06", broadcastMinutes: 210, listenerMinutes: 30 },
    { date: "2023-04-07", broadcastMinutes: 150, listenerMinutes: 60 },
  ],
};

interface LiveKitUserDetailsProps {
  userId: string;
  onBack: () => void;
}

export function LiveKitUserDetails({
  userId,
  onBack,
}: LiveKitUserDetailsProps) {
  // In a real implementation, you would fetch the user data based on the userId
  // For now, we'll just use the sample data

  // Format the data for the chart
  const chartData = useMemo(() => {
    return userData.dailyUsage.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      broadcastHours: +(item.broadcastMinutes / 60).toFixed(1),
      listenerHours: +(item.listenerMinutes / 60).toFixed(1),
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="mr-2" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">{userData.name}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
          <CardHeader>
            <CardDescription>Total Broadcast Time</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              {userData.totalBroadcastTime}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
          <CardHeader>
            <CardDescription>Total Listener Time</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {userData.totalListenerTime}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-none bg-gradient-to-t from-primary/5 to-card dark:bg-card">
          <CardHeader>
            <CardDescription>Average Session Duration</CardDescription>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {userData.averageSessionDuration}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Usage Over Time</CardTitle>
          <CardDescription>Daily broadcast and listener time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              broadcastHours: {
                label: "Broadcast Hours",
                color: "hsl(var(--chart-1))",
              },
              listenerHours: {
                label: "Listener Hours",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${value} hours`,
                    name === "broadcastHours"
                      ? "Broadcast Hours"
                      : "Listener Hours",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="broadcastHours"
                  stroke="var(--color-broadcastHours)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="listenerHours"
                  stroke="var(--color-listenerHours)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Last 5 LiveKit sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userData.sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {session.roomName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {session.type === "broadcast" ? (
                        <>
                          <Mic className="h-4 w-4 text-primary" />
                          Broadcaster
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Listener
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(session.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{session.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
