import type { TradingRecord } from "@/types";

/**
 * Calculates the average profit percentage for buy or sell trades
 * If count is 0, returns 0 to avoid division by zero
 */
export function calculateAverageProfit(
  count: number,
  totalPercentage: number
): number {
  if (count <= 0) return 0;
  return totalPercentage / count;
}

/**
 * Formats trading records for display
 * Returns an object with formatted values for both daily and total records
 */
export function formatTradingRecords(
  daily?: TradingRecord,
  total?: TradingRecord
) {
  console.log("Formatting trading records:", { daily, total });

  // Default values if records are undefined
  const defaultRecord = {
    buy_count: 0,
    buy_profit_percentage: 0,
    sell_count: 0,
    sell_profit_percentage: 0,
  };

  // Use default values if records are undefined
  const dailyRecord = daily || defaultRecord;
  const totalRecord = total || defaultRecord;

  const formattedRecords = {
    daily: {
      buy: {
        count: dailyRecord.buy_count || 0,
        percentage: calculateAverageProfit(
          dailyRecord.buy_count || 0,
          dailyRecord.buy_profit_percentage || 0
        ),
      },
      sell: {
        count: dailyRecord.sell_count || 0,
        percentage: calculateAverageProfit(
          dailyRecord.sell_count || 0,
          dailyRecord.sell_profit_percentage || 0
        ),
      },
    },
    total: {
      buy: {
        count: totalRecord.buy_count || 0,
        percentage: calculateAverageProfit(
          totalRecord.buy_count || 0,
          totalRecord.buy_profit_percentage || 0
        ),
      },
      sell: {
        count: totalRecord.sell_count || 0,
        percentage: calculateAverageProfit(
          totalRecord.sell_count || 0,
          totalRecord.sell_profit_percentage || 0
        ),
      },
    },
  };

  console.log("Formatted trading records:", formattedRecords);
  return formattedRecords;
}
