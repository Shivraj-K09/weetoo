"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { usePositionsPnL } from "@/hooks/use-position-pnl";
import {
  closePosition,
  partialClosePosition,
} from "@/app/actions/trading-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PositionDetails } from "./position-details";
import { Loader2, InfoIcon } from "lucide-react";
import {
  updateVirtualCurrencyDisplay,
  notifyPositionClosed,
} from "@/utils/update-virtual-currency";
import type { Position as PositionType } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

// Extend the Position type to ensure it has the properties we need
interface Position extends PositionType {
  initial_margin?: number;
  order_type?: "market" | "limit";
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
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null
  );
  const [isClosing, setIsClosing] = useState<{ [positionId: string]: boolean }>(
    {}
  );
  const [filter, setFilter] = useState<string | null>(null);

  // State for close position dialog
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedClosePosition, setSelectedClosePosition] =
    useState<Position | null>(null);
  const [closePercentage, setClosePercentage] = useState(100);

  // Extract UUID if needed
  const cleanRoomId = extractUUID(roomId) || roomId;

  // Fetch positions directly from Supabase
  const fetchPositions = async () => {
    try {
      console.log("[PositionsPanel] Fetching positions for room:", cleanRoomId);
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("trading_positions")
        .select("*")
        .eq("room_id", cleanRoomId)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[PositionsPanel] Error fetching positions:", error);
        setError(error.message);
        return;
      }

      console.log(
        "[PositionsPanel] Fetched positions:",
        data?.length || 0,
        data
      );
      setPositions((data as Position[]) || []);
    } catch (err: any) {
      console.error("[PositionsPanel] Unexpected error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for positions
  useEffect(() => {
    if (!cleanRoomId) return;

    console.log(
      "[PositionsPanel] Setting up subscription for room:",
      cleanRoomId
    );

    // Initial fetch
    fetchPositions();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`positions_${cleanRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trading_positions",
          filter: `room_id=eq.${cleanRoomId}`,
        },
        (payload) => {
          console.log(
            "[PositionsPanel] Real-time update:",
            payload.eventType,
            payload
          );

          if (payload.eventType === "INSERT") {
            if (payload.new.status === "open") {
              console.log("[PositionsPanel] Adding new position:", payload.new);
              setPositions((current) => [payload.new as Position, ...current]);
              toast.success("New position opened");
            }
          } else if (payload.eventType === "UPDATE") {
            if (payload.new.status === "open") {
              console.log("[PositionsPanel] Updating position:", payload.new);
              setPositions((current) =>
                current.map((pos) =>
                  pos.id === payload.new.id ? { ...pos, ...payload.new } : pos
                )
              );
            } else {
              // Position closed or partially closed
              console.log(
                "[PositionsPanel] Removing closed position:",
                payload.old.id
              );
              setPositions((current) =>
                current.filter((pos) => pos.id !== payload.old.id)
              );

              // If this was the selected position, deselect it
              if (selectedPositionId === payload.old.id) {
                setSelectedPositionId(null);
              }

              toast.success(
                payload.new.status === "closed"
                  ? "Position closed"
                  : "Position partially closed"
              );
            }
          } else if (payload.eventType === "DELETE") {
            console.log(
              "[PositionsPanel] Removing deleted position:",
              payload.old.id
            );
            setPositions((current) =>
              current.filter((pos) => pos.id !== payload.old.id)
            );

            // If this was the selected position, deselect it
            if (selectedPositionId === payload.old.id) {
              setSelectedPositionId(null);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("[PositionsPanel] Subscription status:", status);
      });

    // Listen for new position events from other components
    const handleNewPosition = (event: any) => {
      console.log(
        "[PositionsPanel] New position event received:",
        event.detail
      );
      if (event.detail?.roomId === cleanRoomId) {
        // Refresh positions to ensure we have the latest data
        fetchPositions();
      }
    };

    window.addEventListener("new-position-created", handleNewPosition);

    // Clean up subscription on unmount
    return () => {
      console.log("[PositionsPanel] Cleaning up subscription");
      supabase.removeChannel(subscription);
      window.removeEventListener("new-position-created", handleNewPosition);
    };
  }, [cleanRoomId, selectedPositionId]);

  // Filter positions by symbol if provided
  const filteredPositions = symbol
    ? positions.filter((position) => position.symbol === symbol)
    : positions;

  // Use the hook to calculate PnL for all positions
  const { positionsPnL } = usePositionsPnL(filteredPositions, currentPrice);

  // Find the selected position
  const selectedPosition =
    filteredPositions.find((p) => p.id === selectedPositionId) || null;

  // Handle position close
  const handleClosePosition = async (positionId: string, percentage = 100) => {
    try {
      setIsClosing((prev) => ({ ...prev, [positionId]: true }));

      if (percentage < 100) {
        await handlePartialClose(positionId, percentage);
        return;
      }

      const result = await closePosition({
        positionId: positionId,
        exitPrice: currentPrice,
      });

      if (result.success) {
        toast.success(result.message);

        // Immediately remove the position from the UI
        setSelectedPositionId(null);
        setPositions((current) =>
          current.filter((pos) => pos.id !== positionId)
        );

        // Update virtual currency display immediately
        updateVirtualCurrencyDisplay(cleanRoomId);
        notifyPositionClosed(cleanRoomId);

        // Emit a custom event that the trade history component can listen for
        const closeEvent = new CustomEvent("position-closed", {
          detail: {
            positionId,
            roomId: cleanRoomId,
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
      setCloseDialogOpen(false);
      setSelectedClosePosition(null);
    }
  };

  // Handle partial position close
  const handlePartialClose = async (positionId: string, percentage = 50) => {
    try {
      setIsClosing((prev) => ({ ...prev, [positionId]: true }));
      const result = await partialClosePosition({
        positionId,
        percentage,
        exitPrice: currentPrice,
      });

      if (result.success) {
        toast.success(result.message);

        // If we closed 100%, close the details panel
        if (percentage >= 99.9) {
          setSelectedPositionId(null);
        }

        // Refresh positions to get updated data
        fetchPositions();

        // Update virtual currency display immediately
        updateVirtualCurrencyDisplay(cleanRoomId);
        notifyPositionClosed(cleanRoomId);
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
      setCloseDialogOpen(false);
      setSelectedClosePosition(null);
    }
  };

  // Open close position dialog
  const openCloseDialog = (position: Position) => {
    setSelectedClosePosition(position);
    setClosePercentage(100);
    setCloseDialogOpen(true);
  };

  // Handle visibility change to refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log(
          "[PositionsPanel] Tab became visible, refreshing positions"
        );
        fetchPositions();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (isLoading && positions.length === 0) {
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
            <div className="overflow-x-auto overflow-y-auto h-[17rem] no-scrollbar">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2 text-left">Side</th>
                    <th className="px-4 py-2 text-left">Size</th>
                    <th className="px-4 py-2 text-left">Entry</th>
                    <th className="px-4 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <span>Initial Margin</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-gray-400 cursor-help">
                                <InfoIcon size={12} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Amount locked for this position, including entry
                                amount and fees.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>PNL</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center text-gray-400 cursor-help">
                                <InfoIcon size={12} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">
                                Unrealized profit or loss based on current
                                market price.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
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

                      // Calculate initial margin with fallback
                      const feeRate =
                        position.order_type === "market" ? 0.0006 : 0.0002;
                      const calculatedMargin =
                        position.entry_amount +
                        position.entry_price * (feeRate || 0.0006);
                      const initialMargin =
                        position.initial_margin !== undefined
                          ? position.initial_margin
                          : calculatedMargin;

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
                          <td className="px-4 py-2">
                            ${initialMargin.toFixed(2)}
                          </td>
                          <td
                            className={`px-4 py-2 text-right ${isProfitable ? "text-green-500" : "text-red-500"}`}
                          >
                            ${Math.abs(pnl).toFixed(2)} (
                            {pnlPercentage ? pnlPercentage.toFixed(2) : "0.00"}
                            %)
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openCloseDialog(position)}
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

      {/* Close Position Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="bg-[#1E222D] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Close Position</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select how much of your position you want to close.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 my-4">
            <Button
              variant={closePercentage === 25 ? "default" : "outline"}
              onClick={() => setClosePercentage(25)}
            >
              25%
            </Button>
            <Button
              variant={closePercentage === 50 ? "default" : "outline"}
              onClick={() => setClosePercentage(50)}
            >
              50%
            </Button>
            <Button
              variant={closePercentage === 75 ? "default" : "outline"}
              onClick={() => setClosePercentage(75)}
            >
              75%
            </Button>
            <Button
              variant={closePercentage === 100 ? "default" : "outline"}
              onClick={() => setClosePercentage(100)}
            >
              100%
            </Button>
          </div>

          {selectedClosePosition && (
            <div className="my-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Position Size:</span>
                <span>${selectedClosePosition.position_size.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Close Amount:</span>
                <span>
                  $
                  {(
                    (selectedClosePosition.position_size * closePercentage) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedClosePosition &&
                handleClosePosition(selectedClosePosition.id, closePercentage)
              }
              disabled={
                !selectedClosePosition || isClosing[selectedClosePosition.id]
              }
            >
              {selectedClosePosition && isClosing[selectedClosePosition.id] ? (
                <span className="flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Closing...
                </span>
              ) : (
                `Close ${closePercentage}%`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
