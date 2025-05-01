"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePositionPnL } from "@/hooks/use-position-pnl";
import { ArrowLeft, X, Info } from "lucide-react";
import { getPositionFundingFees } from "@/app/actions/funding-calculations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Position as GlobalPosition } from "@/types";

// Create a local position type that matches what we have in this component
interface Position {
  id: string;
  room_id?: string;
  user_id?: string; // Make optional since we might not have it
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  position_size: number;
  leverage: number;
  entry_amount: number;
  created_at: string;
  updated_at?: string; // Make optional since we might not have it
  status?: "open" | "closed" | "partially_closed"; // Make optional since we might not have it
  current_price?: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  cumulative_funding_fee?: number | null;
  order_type?: "market" | "limit";
  initial_margin?: number;
}

interface PositionDetailsProps {
  position: Position;
  currentPrice: number;
  onClose: () => void;
  onClosePosition: (positionId: string) => Promise<void>;
  onPartialClose: (positionId: string, percentage: number) => Promise<void>;
  isClosing: { [positionId: string]: boolean };
}

export function PositionDetails({
  position,
  currentPrice,
  onClose,
  onClosePosition,
  onPartialClose,
  isClosing,
}: PositionDetailsProps) {
  const [partialClosePercentage, setPartialClosePercentage] = useState(50);
  const [fundingFee, setFundingFee] = useState<number | null>(
    position.cumulative_funding_fee || null
  );

  // Use type assertion to tell TypeScript this position is compatible with the expected type
  const pnlData = usePositionPnL(
    position as unknown as GlobalPosition,
    currentPrice
  );

  // Fetch funding fees if not already available
  useEffect(() => {
    if (fundingFee === null) {
      getPositionFundingFees(position.id)
        .then((result) => {
          if (result.success) {
            setFundingFee(result.cumulativeFee);
          }
        })
        .catch((error) => {
          console.error("Error fetching funding fees:", error);
        });
    }
  }, [position.id, fundingFee]);

  const handlePartialClose = async () => {
    await onPartialClose(position.id, partialClosePercentage);
  };

  const handleFullClose = async () => {
    await onClosePosition(position.id);
  };

  const isProfitable = pnlData.currentPnL > 0;
  const isClosingThisPosition = isClosing[position.id] || false;

  // Calculate total PnL including funding fees
  const totalPnL = pnlData.currentPnL + (fundingFee || 0);
  const isTotalProfitable = totalPnL > 0;

  // Add quick-select buttons for partial close
  const quickSelectOptions = [25, 50, 75, 100];

  return (
    <div className="bg-[#1E222D] p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">Position Details</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-400">Unrealized PnL</p>
        <p
          className={`text-lg font-medium ${isProfitable ? "text-[#00C879]" : "text-[#FF5252]"}`}
        >
          $
          {Math.abs(pnlData.currentPnL).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}{" "}
          ({pnlData.pnlPercentage ? pnlData.pnlPercentage.toFixed(2) : "0.00"}%)
        </p>
      </div>

      {/* Funding Fee Section */}
      <div className="mb-4">
        <div className="flex items-center gap-1">
          <p className="text-sm text-gray-400">Funding Fees</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Info className="h-3 w-3 text-gray-400" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Funding fees are paid/received every 8 hours. Positive values
                  mean you've received funding, negative means you've paid.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {fundingFee !== null ? (
          <p
            className={`text-sm font-medium ${fundingFee >= 0 ? "text-[#00C879]" : "text-[#FF5252]"}`}
          >
            {fundingFee >= 0 ? "+" : "-"}$
            {Math.abs(fundingFee).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Loading...</p>
        )}
      </div>

      {/* Total PnL (including funding) */}
      <div className="mb-4">
        <p className="text-sm text-gray-400">Total PnL (incl. funding)</p>
        <p
          className={`text-lg font-medium ${isTotalProfitable ? "text-[#00C879]" : "text-[#FF5252]"}`}
        >
          $
          {Math.abs(totalPnL).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Quick select buttons for partial close */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">Close percentage:</p>
        <div className="flex gap-2 mb-2">
          {quickSelectOptions.map((percentage) => (
            <Button
              key={percentage}
              variant={
                partialClosePercentage === percentage ? "default" : "outline"
              }
              size="sm"
              onClick={() => setPartialClosePercentage(percentage)}
              disabled={isClosingThisPosition}
              className="flex-1"
            >
              {percentage}%
            </Button>
          ))}
        </div>

        {/* Keep the slider for fine-tuning */}
        <Slider
          value={[partialClosePercentage]}
          min={10}
          max={90}
          step={5}
          onValueChange={(value) => setPartialClosePercentage(value[0])}
          disabled={isClosingThisPosition || partialClosePercentage === 100}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePartialClose}
          disabled={isClosingThisPosition || partialClosePercentage === 100}
        >
          {isClosingThisPosition
            ? "Closing..."
            : `Close ${partialClosePercentage}%`}
        </Button>
        <Button
          variant={partialClosePercentage === 100 ? "default" : "destructive"}
          className="flex-1"
          onClick={handleFullClose}
          disabled={isClosingThisPosition}
        >
          {isClosingThisPosition ? "Closing..." : "Close Position"}
        </Button>
      </div>
    </div>
  );
}
