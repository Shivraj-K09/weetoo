"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFundingRate } from "@/hooks/use-funding-rates";
import { InfoIcon } from "lucide-react";

interface FundingInfoProps {
  symbol: string;
}

export function FundingInfo({ symbol }: FundingInfoProps) {
  const { formattedRate, timeRemaining, isLoading, error } =
    useFundingRate(symbol);

  // Determine color based on rate
  // IMPORTANT: For funding rates, positive is BAD for longs (red), negative is GOOD for longs (green)
  const rateColor = formattedRate.startsWith("+")
    ? "text-red-500" // Positive rate means longs pay shorts (bad for longs)
    : formattedRate.startsWith("-")
      ? "text-green-500" // Negative rate means shorts pay longs (good for longs)
      : "text-gray-500"; // Zero rate

  if (isLoading) {
    // Use fixed width placeholders to prevent layout shifts
    return (
      <div className="flex items-center gap-2">
        <span className="w-20 text-center text-gray-400 text-xs">--</span>
        <span className="w-20 text-center text-gray-400 text-xs">--:--:--</span>
      </div>
    );
  }

  if (error) {
    // Use fixed width error state
    return (
      <div className="flex items-center gap-2">
        <span className="w-20 text-center text-red-400 text-xs">Error</span>
        <span className="w-20 text-center text-gray-400 text-xs">--:--:--</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-2">
          {/* Fixed width container for funding rate with smaller text */}
          <div className="w-20 text-center">
            <span className={`${rateColor} text-xs font-medium`}>
              {formattedRate}
            </span>
          </div>

          {/* Fixed width container for countdown with smaller text */}
          <div className="w-20 text-center">
            <span className="text-xs">{timeRemaining}</span>
          </div>

          <InfoIcon className="h-3 w-3 text-gray-400" />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="max-w-xs p-2">
            <p className="font-semibold mb-1">Funding Rate</p>
            <p className="text-sm mb-2">
              Funding occurs every 8 hours (00:00, 08:00, 16:00 UTC).
              <span className="block mt-1">
                <span className="text-red-500">Positive rate</span>: Longs pay
                shorts
              </span>
              <span className="block mt-1">
                <span className="text-green-500">Negative rate</span>: Shorts
                pay longs
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Current rate: {formattedRate}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
