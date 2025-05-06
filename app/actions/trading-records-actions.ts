"use server";

import { createClient } from "@/lib/supabase/server";

// Simple interface for trading records
interface TradingRecord {
  buy_count: number;
  buy_profit_percentage: number;
  sell_count: number;
  sell_profit_percentage: number;
}

// Get trading records for a room
export async function getRoomTradingRecords(roomId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: "Not authenticated",
        daily: {
          buy: { count: 0, percentage: 0 },
          sell: { count: 0, percentage: 0 },
        },
        total: {
          buy: { count: 0, percentage: 0 },
          sell: { count: 0, percentage: 0 },
        },
      };
    }

    // Get today's records
    const { data: dailyRecord, error: dailyError } = await supabase
      .from("trading_records")
      .select("*")
      .eq("room_id", roomId)
      .eq("is_daily", true)
      .eq("record_date", new Date().toISOString().split("T")[0])
      .single();

    // Get total records
    const { data: totalRecord, error: totalError } = await supabase
      .from("trading_records")
      .select("*")
      .eq("room_id", roomId)
      .eq("is_daily", false)
      .single();

    // Format the records
    const daily = {
      buy: {
        count: dailyRecord?.buy_count || 0,
        percentage: calculateAverageProfit(
          dailyRecord?.buy_count || 0,
          dailyRecord?.buy_profit_percentage || 0
        ),
      },
      sell: {
        count: dailyRecord?.sell_count || 0,
        percentage: calculateAverageProfit(
          dailyRecord?.sell_count || 0,
          dailyRecord?.sell_profit_percentage || 0
        ),
      },
    };

    const total = {
      buy: {
        count: totalRecord?.buy_count || 0,
        percentage: calculateAverageProfit(
          totalRecord?.buy_count || 0,
          totalRecord?.buy_profit_percentage || 0
        ),
      },
      sell: {
        count: totalRecord?.sell_count || 0,
        percentage: calculateAverageProfit(
          totalRecord?.sell_count || 0,
          totalRecord?.sell_profit_percentage || 0
        ),
      },
    };

    return {
      success: true,
      message: "Trading records retrieved successfully",
      daily,
      total,
    };
  } catch (error) {
    console.error("[getRoomTradingRecords] Error:", error);
    return {
      success: false,
      message: "An error occurred while retrieving trading records",
      daily: {
        buy: { count: 0, percentage: 0 },
        sell: { count: 0, percentage: 0 },
      },
      total: {
        buy: { count: 0, percentage: 0 },
        sell: { count: 0, percentage: 0 },
      },
    };
  }
}

// Calculate average profit percentage
function calculateAverageProfit(
  count: number,
  totalPercentage: number
): number {
  if (count === 0) return 0;
  return totalPercentage / count;
}
