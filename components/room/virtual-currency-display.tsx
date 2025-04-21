"use client";

import { useVirtualCurrency } from "@/hooks/use-virtual-currency";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/format-utils";

interface VirtualCurrencyDisplayProps {
  roomId: string;
  isOwner: boolean;
}

export function VirtualCurrencyDisplay({
  roomId,
  isOwner,
}: VirtualCurrencyDisplayProps) {
  const { virtualCurrency, isLoading } = useVirtualCurrency(roomId, isOwner);

  // Only show for room owner
  if (!isOwner) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-bold flex items-center">
        <DollarSign className="h-5 w-5 text-green-500" />
        <span>Virtual Balance</span>
      </div>
      <div className="text-xl font-bold text-green-500">
        {isLoading ? "Loading..." : formatCurrency(virtualCurrency)}
      </div>
    </div>
  );
}
