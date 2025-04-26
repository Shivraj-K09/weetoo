"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePositionPnL } from "@/hooks/use-position-pnl";
import { ArrowLeft, X } from "lucide-react";

// Update the Position interface to make stop_loss and take_profit optional
interface Position {
  id: string;
  room_id?: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  position_size: number;
  leverage: number;
  entry_amount: number;
  created_at: string;
  current_price?: number;
  stop_loss?: number | null;
  take_profit?: number | null;
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
  const pnlData = usePositionPnL(position, currentPrice);

  const handlePartialClose = async () => {
    await onPartialClose(position.id, partialClosePercentage);
  };

  const handleFullClose = async () => {
    await onClosePosition(position.id);
  };

  const isProfitable = pnlData.currentPnL > 0;
  const isClosingThisPosition = isClosing[position.id] || false;

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
          ({pnlData.pnlPercentage.toFixed(2)}%)
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">
          Partial Close: {partialClosePercentage}%
        </p>
        <Slider
          value={[partialClosePercentage]}
          min={10}
          max={90}
          step={10}
          onValueChange={(value) => setPartialClosePercentage(value[0])}
          disabled={isClosingThisPosition}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePartialClose}
          disabled={isClosingThisPosition}
        >
          {isClosingThisPosition
            ? "Closing..."
            : `Close ${partialClosePercentage}%`}
        </Button>
        <Button
          variant="destructive"
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
