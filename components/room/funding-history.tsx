"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFundingPaymentHistory } from "@/app/actions/funding-calculations";
import { formatDistanceToNow } from "date-fns";

interface FundingPayment {
  id: string;
  position_id: string;
  user_id: string;
  room_id: string;
  symbol: string;
  funding_rate: number;
  position_size: number;
  amount: number;
  position_direction: string;
  created_at: string;
}

interface FundingHistoryProps {
  roomId: string;
  userId: string;
}

export function FundingHistory({ roomId, userId }: FundingHistoryProps) {
  const [payments, setPayments] = useState<FundingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch funding payment history
  const fetchFundingHistory = async () => {
    try {
      setIsLoading(true);
      const result = await getFundingPaymentHistory(roomId, userId);
      if (result.success && result.data) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error("Error fetching funding history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFundingHistory();
  }, [roomId, userId]);

  // Listen for funding applied events
  useEffect(() => {
    const handleFundingApplied = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.roomId === roomId) {
        console.log(
          "[FundingHistory] Funding applied event detected, refreshing history"
        );
        fetchFundingHistory();
      }
    };

    window.addEventListener("funding-applied", handleFundingApplied);
    return () => {
      window.removeEventListener("funding-applied", handleFundingApplied);
    };
  }, [roomId, userId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#212631] p-4 rounded-md">
      {payments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No funding payments yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Symbol</th>
                <th className="px-4 py-2 text-left">Position</th>
                <th className="px-4 py-2 text-left">Rate</th>
                <th className="px-4 py-2 text-left">Size</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const isPaid = payment.amount > 0;
                const timeAgo = formatDistanceToNow(
                  new Date(payment.created_at),
                  { addSuffix: true }
                );
                const formattedRate = `${(payment.funding_rate * 100).toFixed(4)}%`;

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-700 hover:bg-gray-800"
                  >
                    <td className="px-4 py-2">{payment.symbol}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          payment.position_direction.toLowerCase() === "buy"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {payment.position_direction.toLowerCase() === "buy"
                          ? "Long"
                          : "Short"}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formattedRate}</td>
                    <td className="px-4 py-2">
                      ${payment.position_size.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-2 text-right ${isPaid ? "text-red-500" : "text-green-500"}`}
                    >
                      {isPaid ? "-" : "+"}${Math.abs(payment.amount).toFixed(2)}
                    </td>
                    <td
                      className="px-4 py-2 text-right text-gray-400"
                      title={payment.created_at}
                    >
                      {timeAgo}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
