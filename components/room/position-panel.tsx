"use client";

import { useState, useEffect, useRef } from "react";
import { useRealTimePositions } from "@/hooks/use-real-time-positions";
import { usePositionsPnL } from "@/hooks/use-position-pnl";
import {
  closePosition,
  partialClosePosition,
} from "@/app/actions/trading-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PositionDetails } from "./position-details";
import { Loader2 } from "lucide-react";
import {
  updateVirtualCurrencyDisplay,
  notifyPositionClosed,
} from "@/utils/update-virtual-currency";

interface Position {
  id: string;
  user_id: string;
  room_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  position_size: number;
  leverage: number;
  entry_amount: number;
  created_at: string;
  margin_mode?: string;
}

interface PositionsPanelProps {
  roomId: string;
  currentPrice: number;
  hideTitle?: boolean;
  symbol?: string;
}

export function PositionsPanel({
  roomId,
  currentPrice,
  hideTitle = false,
  symbol,
}: PositionsPanelProps) {
  const { positions, isLoading, setPositions } = useRealTimePositions(roomId);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null
  );
  const [isClosing, setIsClosing] = useState<{ [positionId: string]: boolean }>(
    {}
  );
  const [filter, setFilter] = useState<string | null>(null);
  const [cachedPositions, setCachedPositions] = useState<Position[]>([]);
  const positionsRef = useRef<Position[]>([]);

  // Cache positions to prevent data loss when switching tabs
  useEffect(() => {
    if (!isLoading && positions.length > 0) {
      setCachedPositions(positions);
      positionsRef.current = positions;
    }
  }, [positions, isLoading]);

  // Listen for new position events
  useEffect(() => {
    const handleNewPosition = () => {
      console.log("[PositionsPanel] New position created, refreshing data");
    };

    window.addEventListener("new-position-created", handleNewPosition);
    return () => {
      window.removeEventListener("new-position-created", handleNewPosition);
    };
  }, []);

  // Filter positions by symbol if provided
  const filteredPositions = symbol
    ? (cachedPositions.length > 0 ? cachedPositions : positions).filter(
        (position) => position.symbol === symbol
      )
    : cachedPositions.length > 0
      ? cachedPositions
      : positions;

  // Use the hook to calculate PnL for all positions
  const { positionsPnL } = usePositionsPnL(filteredPositions, currentPrice);

  // Find the selected position
  const selectedPosition =
    filteredPositions.find((p) => p.id === selectedPositionId) || null;

  // Handle position close
  const handleClosePosition = async (positionId: string) => {
    try {
      setIsClosing((prev) => ({ ...prev, [positionId]: true }));
      const result = await closePosition({
        positionId: positionId,
      });

      if (result.success) {
        toast.success(result.message);

        // Immediately remove the position from the UI
        setSelectedPositionId(null);

        // Force immediate removal from the positions list
        setPositions((currentPositions) => {
          const updatedPositions = currentPositions.filter(
            (position) => position.id !== positionId
          );
          setCachedPositions(updatedPositions);
          positionsRef.current = updatedPositions;
          return updatedPositions;
        });

        // Update virtual currency display immediately
        updateVirtualCurrencyDisplay(roomId);
        notifyPositionClosed(roomId);

        // Emit a custom event that the trade history component can listen for
        const closeEvent = new CustomEvent("position-closed", {
          detail: {
            positionId,
            roomId,
            tradeHistory: result.tradeHistory,
          },
        });
        window.dispatchEvent(closeEvent);
      } else {
        toast.error(
          `Failed to close position: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error closing position:", error);
      toast.error("An error occurred while closing the position");
    } finally {
      setIsClosing((prev) => ({ ...prev, [positionId]: false }));
    }
  };

  // Handle partial position close
  const handlePartialClose = async (positionId: string, percentage = 50) => {
    try {
      setIsClosing((prev) => ({ ...prev, [positionId]: true }));
      const result = await partialClosePosition({
        positionId,
        percentage,
      });

      if (result.success) {
        toast.success(result.message);

        // If we closed 100%, close the details panel
        if (percentage >= 99.9) {
          setSelectedPositionId(null);
        }

        // Update virtual currency display immediately
        updateVirtualCurrencyDisplay(roomId);
        notifyPositionClosed(roomId);
      } else {
        toast.error(
          `Failed to partially close position: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error partially closing position:", error);
      toast.error("An error occurred while partially closing the position");
    } finally {
      setIsClosing((prev) => ({ ...prev, [positionId]: false }));
    }
  };

  if (isLoading && cachedPositions.length === 0) {
    return (
      <div className="bg-[#212631] p-4 rounded-md">
        {!hideTitle && (
          <h2 className="text-lg font-semibold mb-4">Positions</h2>
        )}
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#212631] p-4 rounded-md">
      {!hideTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Positions</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`text-xs ${filter === null ? "bg-[#3f445c]" : ""}`}
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`text-xs ${filter === "buy" ? "bg-[#3f445c]" : ""}`}
              onClick={() => setFilter("buy")}
            >
              Long
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`text-xs ${filter === "sell" ? "bg-[#3f445c]" : ""}`}
              onClick={() => setFilter("sell")}
            >
              Short
            </Button>
          </div>
        </div>
      )}

      {selectedPosition ? (
        <PositionDetails
          position={selectedPosition}
          currentPrice={currentPrice}
          onClose={() => setSelectedPositionId(null)}
          onClosePosition={handleClosePosition}
          onPartialClose={handlePartialClose}
          isClosing={isClosing}
        />
      ) : (
        <>
          {filteredPositions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No open positions
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto no-scrollbar h-[18rem]">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2 text-left">Side</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Entry</th>
                    <th className="px-4 py-2 text-right">PNL</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositions
                    .filter((position) =>
                      filter ? position.direction === filter : true
                    )
                    .map((position) => {
                      // Safely access PnL data
                      const pnlInfo = positionsPnL[position.id];
                      const pnl = pnlInfo ? pnlInfo.pnl : 0;
                      const pnlPercentage = pnlInfo ? pnlInfo.pnlPercentage : 0;

                      const isProfitable = pnl > 0;

                      return (
                        <tr
                          key={position.id}
                          className="border-b border-gray-700 hover:bg-gray-800"
                        >
                          <td className="px-4 py-2">{position.symbol}</td>
                          <td className="px-4 py-2">
                            <span
                              className={
                                position.direction === "buy"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              {position.direction === "buy" ? "Long" : "Short"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            ${position.position_size.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            $
                            {position.entry_price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className={`px-4 py-2 text-right ${isProfitable ? "text-green-500" : "text-red-500"}`}
                          >
                            ${Math.abs(pnl).toFixed(2)} (
                            {pnlPercentage.toFixed(2)}%)
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClosePosition(position.id);
                                }}
                                disabled={isClosing[position.id]}
                              >
                                {isClosing[position.id] ? (
                                  <span className="flex items-center">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Closing
                                  </span>
                                ) : (
                                  "Close"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePartialClose(position.id);
                                }}
                                disabled={isClosing[position.id]}
                              >
                                Partial
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
