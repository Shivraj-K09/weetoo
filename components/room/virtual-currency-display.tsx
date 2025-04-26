"use client";

import { useState, useEffect } from "react";
import { useRealTimeCurrency } from "@/hooks/use-real-time-currency";
import { formatCurrency } from "@/utils/format-utils";

interface VirtualCurrencyDisplayProps {
  roomId: string;
  initialAmount?: number;
  isOwner?: boolean;
}

export function VirtualCurrencyDisplay({
  roomId,
  initialAmount = 0,
  isOwner = true,
}: VirtualCurrencyDisplayProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [isUpdating, setIsUpdating] = useState(false);

  // Always call hooks at the top level
  const { virtualCurrency, isLoading } = useRealTimeCurrency(roomId);

  // Use effect to update the amount when virtualCurrency changes
  useEffect(() => {
    if (!isLoading && virtualCurrency !== undefined) {
      setAmount(virtualCurrency);
    }
  }, [virtualCurrency, isLoading]);

  // Listen for virtual-currency-update events
  useEffect(() => {
    if (!isOwner) return;

    const handleVirtualCurrencyUpdate = (event: CustomEvent) => {
      if (event.detail.roomId === roomId) {
        setIsUpdating(true);
        // Fetch the latest currency data
        fetch(`/api/virtual-currency?roomId=${roomId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.success && data.amount !== undefined) {
              setAmount(data.amount);
            }
          })
          .catch((error) => {
            console.error("Error fetching virtual currency:", error);
          })
          .finally(() => {
            setTimeout(() => setIsUpdating(false), 500);
          });
      }
    };

    // Add event listener
    window.addEventListener(
      "virtual-currency-update",
      handleVirtualCurrencyUpdate as EventListener
    );

    // Clean up
    return () => {
      window.removeEventListener(
        "virtual-currency-update",
        handleVirtualCurrencyUpdate as EventListener
      );
    };
  }, [roomId, isOwner]);

  // Return null if not owner
  if (!isOwner) return null;

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-400">Virtual Balance</div>
        <div
          className={`text-xl font-bold virtual-currency-display ${isUpdating ? "text-green-500" : ""}`}
          data-room-id={roomId}
        >
          {formatCurrency(amount)}
        </div>
      </div>
    </div>
  );
}
