"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber } from "@/utils/format-utils";

interface LeaderboardUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_volume: number;
  profit_rate: number;
  win_count: number;
  loss_count: number;
}

interface TradingLeaderboardProps {
  roomId: string;
}

export function TradingLeaderboard({ roomId }: TradingLeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Get users who have traded in this room
        const { data, error } = await supabase
          .from("user_trading_metrics")
          .select(
            `
            user_id,
            total_volume,
            profit_rate,
            win_count,
            loss_count,
            users:user_id(username, avatar_url)
          `
          )
          .order("profit_rate", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching leaderboard:", error);
          return;
        }

        // Format the data - fix the type issue here
        const formattedData = data.map((item) => ({
          user_id: item.user_id,
          username: item.users
            ? (item.users as any).username || "Anonymous"
            : "Anonymous",
          avatar_url: item.users ? (item.users as any).avatar_url : null,
          total_volume: item.total_volume,
          profit_rate: item.profit_rate,
          win_count: item.win_count,
          loss_count: item.loss_count,
        }));

        setUsers(formattedData);
      } catch (error) {
        console.error("Error in fetchLeaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="bg-[#212631] p-4 rounded border border-[#3f445c] text-center text-white/70">
        Loading leaderboard...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-[#212631] p-4 rounded border border-[#3f445c] text-center text-white/70">
        No trading data available yet
      </div>
    );
  }

  return (
    <div className="bg-[#212631] rounded border border-[#3f445c] overflow-hidden">
      <div className="bg-[#1a1e27] px-4 py-2 border-b border-[#3f445c]">
        <h3 className="text-white font-medium">Trading Leaderboard</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-xs text-white/70 bg-[#1a1e27]">
            <tr>
              <th className="px-4 py-2 text-left">Rank</th>
              <th className="px-4 py-2 text-left">Trader</th>
              <th className="px-4 py-2 text-right">Volume</th>
              <th className="px-4 py-2 text-right">Profit Rate</th>
              <th className="px-4 py-2 text-right">Win/Loss</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.user_id} className="border-t border-[#3f445c]">
                <td className="px-4 py-3 text-left">{index + 1}</td>
                <td className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(user.total_volume)}
                </td>
                <td
                  className={`px-4 py-3 text-right ${user.profit_rate >= 0 ? "text-[#00C879]" : "text-[#FF5252]"}`}
                >
                  {formatNumber(user.profit_rate)}%
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[#00C879]">{user.win_count}</span>
                  <span className="mx-1">/</span>
                  <span className="text-[#FF5252]">{user.loss_count}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
