"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useTrading } from "@/hooks/use-trading";
import { toast } from "sonner";
import { MarginModeDialog } from "./margin-mode-dialog";
import { LeverageDialog } from "./leverage-dialog";
import { Switch } from "@/components/ui/switch";
import { executeTrade } from "@/app/actions/trading-actions";
import { updateVirtualCurrencyDisplay } from "@/utils/update-virtual-currency";
import { useDetailedBalance } from "@/hooks/use-detailed-balance";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

interface TradingFormProps {
  roomId: string;
  symbol: string;
  currentPrice: number;
  isHost: boolean;
  virtualCurrency: number;
}

export const TradingForm = React.memo(function TradingForm({
  roomId,
  symbol,
  currentPrice,
  isHost,
  virtualCurrency = 10000, // Provide a default value of 10000
}: TradingFormProps) {
  // Debug render count
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[DEBUG] TradingForm render #${renderCount.current}`, {
    roomId,
    symbol,
    currentPrice,
    isHost,
    virtualCurrency,
  });

  // State for form inputs - simplified to avoid circular dependencies
  const [orderType, setOrderType] = useState<"limit" | "market">("market");
  const [leverage, setLeverage] = useState(1);
  const [marginMode, setMarginMode] = useState<"cross" | "isolated">("cross");
  const [entryAmount, setEntryAmount] = useState("1000");
  const [limitPrice, setLimitPrice] = useState(currentPrice.toString());
  const [playSound, setPlaySound] = useState(false);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedPercentage, setSelectedPercentage] = useState(10);

  // Risk management state
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState(
    (currentPrice * 0.95).toFixed(2)
  );
  const [takeProfitPrice, setTakeProfitPrice] = useState(
    (currentPrice * 1.05).toFixed(2)
  );
  const [showRiskSettings, setShowRiskSettings] = useState(false);

  // Dialog states
  const [marginModeDialogOpen, setMarginModeDialogOpen] = useState(false);
  const [leverageDialogOpen, setLeverageDialogOpen] = useState(false);

  // Clean roomId
  const cleanRoomId = extractUUID(roomId) || roomId;

  // Trading hook
  const { executeTrade: executeTradeHook, isLoading } = useTrading(
    cleanRoomId,
    isHost
  );

  // Detailed balance hook
  const { balanceDetails, isLoading: isLoadingBalance } =
    useDetailedBalance(cleanRoomId);

  // Calculate position size
  const positionSize = Number.parseFloat(entryAmount || "0") * leverage;

  // Calculate initial margin (entry amount + fees)
  const feeRate = orderType === "market" ? 0.0006 : 0.0002;
  const feeAmount = positionSize * feeRate;
  const initialMargin = Number.parseFloat(entryAmount || "0") + feeAmount;

  // Debug state changes
  useEffect(() => {
    console.log("[DEBUG] entryAmount changed:", entryAmount);
  }, [entryAmount]);

  useEffect(() => {
    console.log("[DEBUG] selectedPercentage changed:", selectedPercentage);
  }, [selectedPercentage]);

  useEffect(() => {
    console.log("[DEBUG] virtualCurrency changed:", virtualCurrency);
  }, [virtualCurrency]);

  useEffect(() => {
    console.log("[DEBUG] currentPrice changed:", currentPrice);
  }, [currentPrice]);

  // Update limit price when current price changes - with debugging
  useEffect(() => {
    console.log(
      "[DEBUG] Updating limit price. Current orderType:",
      orderType,
      "Current price:",
      currentPrice
    );

    if (orderType === "market") {
      console.log(
        "[DEBUG] Setting limit price to current price:",
        currentPrice.toString()
      );
      setLimitPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  // Handle percentage selection - with debugging
  const handlePercentageSelect = (percentage: number) => {
    console.log(
      "[DEBUG] handlePercentageSelect called with:",
      percentage,
      "virtualCurrency:",
      virtualCurrency
    );

    setSelectedPercentage(percentage);

    // Use available balance instead of total holdings for percentage calculation
    const availableBalance = balanceDetails?.available || virtualCurrency;
    const amount = (availableBalance * percentage) / 100;
    const formattedAmount = amount.toFixed(2);
    console.log("[DEBUG] Calculated amount:", formattedAmount);

    setEntryAmount(formattedAmount);
  };

  // Handle margin mode change
  const handleMarginModeChange = useCallback(
    (mode: "cross" | "isolated") => {
      console.log("[DEBUG] Margin mode changing to:", mode);
      setMarginMode(mode);
      toast.success(`Margin mode changed to ${mode}`);

      // Emit event for margin mode change
      if (isHost) {
        window.dispatchEvent(
          new CustomEvent("host-trading", {
            detail: {
              action: "margin_change",
              mode: mode,
            },
          })
        );
      }
    },
    [isHost]
  );

  // Handle leverage change
  const handleLeverageChange = useCallback(
    (newLeverage: number) => {
      console.log("[DEBUG] Leverage changing to:", newLeverage);
      setLeverage(newLeverage);
      toast.success(`Leverage changed to ${newLeverage}x`);

      // Emit event for leverage change
      if (isHost) {
        window.dispatchEvent(
          new CustomEvent("host-trading", {
            detail: {
              action: "leverage_change",
              leverage: newLeverage,
            },
          })
        );
      }
    },
    [isHost]
  );

  // Calculate liquidation price (simplified)
  const calculateLiquidationPrice = (
    direction: "buy" | "sell",
    entryPrice: number
  ): string => {
    const maintenanceMargin = 0.6; // 60%
    const leverageMultiplier = leverage;

    let liquidationPrice = 0;
    if (direction === "buy") {
      // For long positions: entry_price * (1 - (1 / leverage) * (1 / maintenance_margin))
      liquidationPrice =
        entryPrice * (1 - (1 / leverageMultiplier) * (1 / maintenanceMargin));
    } else {
      // For short positions: entry_price * (1 + (1 / leverage) * (1 / maintenance_margin))
      liquidationPrice =
        entryPrice * (1 + (1 / leverageMultiplier) * (1 / maintenanceMargin));
    }
    return liquidationPrice.toFixed(2);
  };

  const handleSubmit = async (direction: "buy" | "sell") => {
    console.log("[DEBUG] handleSubmit called with direction:", direction);
    try {
      // ADD THIS CHECK at the beginning of the function
      if (!isHost) {
        console.log("[DEBUG] Non-host attempted to trade, blocking action");
        toast.error("Only the room host can execute trades");
        return;
      }

      setIsSubmitting(true);
      setDirection(direction);

      // Validate input
      const inputAmount = Number.parseFloat(entryAmount);
      if (isNaN(inputAmount) || inputAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // This will notify other components that the host is placing a trade
      const hostTradingEvent = new CustomEvent("host-trading", {
        detail: {
          action: "placing_order",
          direction,
          symbol,
          amount: inputAmount,
        },
      });
      window.dispatchEvent(hostTradingEvent);

      // Check against available balance instead of total virtual currency
      const availableBalance = balanceDetails?.available || virtualCurrency;
      if (inputAmount > availableBalance) {
        toast.error("Insufficient available balance");
        return;
      }

      // Play sound if enabled
      if (playSound) {
        const audio = new Audio("/sounds/trade.mp3");
        audio.play().catch((e) => console.error("Error playing sound:", e));
      }

      // Execute the trade
      const result = await executeTrade({
        roomId,
        symbol,
        direction,
        entryAmount: inputAmount,
        leverage,
        entryPrice: currentPrice,
      });

      console.log("[DEBUG] Trade execution result:", result);

      if (result.success) {
        toast.success(
          `${direction === "buy" ? "Long" : "Short"} position opened successfully`
        );

        // Add this line to emit another event indicating the trade is complete:
        window.dispatchEvent(
          new CustomEvent("host-trading", {
            detail: {
              action: "order_complete",
              success: true,
              direction,
              symbol,
              positionId: result.positionId,
            },
          })
        );
        updateVirtualCurrencyDisplay(roomId);

        // Emit a custom event to notify other components about the new position
        const newPositionEvent = new CustomEvent("new-position-created", {
          detail: {
            roomId: cleanRoomId, // Use the clean room ID
            positionId: result.positionId,
            direction,
            entryAmount: inputAmount,
            leverage,
            positionSize: inputAmount * leverage,
          },
        });
        window.dispatchEvent(newPositionEvent);

        console.log("[DEBUG] Dispatched new-position-created event:", {
          roomId: cleanRoomId,
          positionId: result.positionId,
        });
      } else {
        toast.error(`Failed to open position: ${result.message}`);

        // Add this line to emit an event for failed trades:
        window.dispatchEvent(
          new CustomEvent("host-trading", {
            detail: {
              action: "order_failed",
              direction,
              symbol,
              error: result.message,
            },
          })
        );
      }
    } catch (error) {
      console.error("Error executing trade:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log before render
  console.log("[DEBUG] TradingForm about to render with state:", {
    orderType,
    leverage,
    marginMode,
    entryAmount,
    limitPrice,
    selectedPercentage,
    virtualCurrency,
  });

  return (
    <div className="bg-[#212631] p-2 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c] overflow-y-auto no-scrollbar">
      {!isHost && (
        <div className="mb-2 px-2 py-1.5 bg-[#1a1e27] border border-yellow-500/30 rounded text-xs text-yellow-400 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 mr-1.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          관전 모드 - 호스트만 거래할 수 있습니다
        </div>
      )}
      <div className="flex gap-1.5 w-full">
        <button
          className={`flex items-center w-full cursor-pointer justify-between gap-2 px-4 py-2 bg-[#1a1e27] text-white rounded-md border border-white/10 hover:border-orange-500/50 transition-all duration-300 ${!isHost ? "opacity-80 cursor-not-allowed hover:border-white/10" : ""}`}
          onClick={() => isHost && setMarginModeDialogOpen(true)}
        >
          <span className="text-sm font-medium">
            {marginMode === "cross" ? "교차" : "격리"}
          </span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white"
          >
            <path
              d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>

        <button
          className={`flex w-full items-center cursor-pointer justify-between gap-2 px-4 py-2 bg-[#1a1e27] text-white rounded-md border border-white/10 hover:border-orange-500/50 transition-all duration-300 ${!isHost ? "opacity-80 cursor-not-allowed hover:border-white/10" : ""}`}
          onClick={() => isHost && setLeverageDialogOpen(true)}
        >
          <span className="text-sm font-medium">{leverage}x</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-white"
          >
            <path
              d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>

      {/* Simplified Balance Display */}

      <div className="flex gap-[0.715rem] flex-col w-full">
        <div className="flex justify-between items-center w-full">
          <Tabs
            defaultValue={orderType}
            className="flex-1"
            onValueChange={(value) => {
              console.log("[DEBUG] Tab value changing to:", value);
              setOrderType(value as "limit" | "market");
            }}
          >
            <div className="flex justify-between items-center">
              <TabsList className="h-auto rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="limit"
                  className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer text-xs"
                >
                  지정가
                </TabsTrigger>
                <TabsTrigger
                  value="market"
                  className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer text-xs"
                >
                  시장가
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="checkbox"
                  className="h-4 w-4 border-[#f97316] text-white data-[state=checked]:bg-[#f97316] data-[state=checked]:border-[#f97316]"
                  checked={playSound}
                  onCheckedChange={(checked) =>
                    setPlaySound(checked as boolean)
                  }
                />
                <Label htmlFor="checkbox" className="text-xs text-white">
                  알림음
                </Label>
              </div>
            </div>
            <TabsContent value="limit" className="text-white px-1">
              <div className="flex gap-1.5 flex-col">
                <Label className="text-xs text-white/60">주문가격</Label>
                <div className="relative">
                  <Input
                    className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#f97316] border border-white/30 rounded text-xs pr-24 bg-transparent selection:bg-[#f97316] selection:text-white"
                    value={limitPrice}
                    onChange={(e) => {
                      console.log(
                        "[DEBUG] Limit price changing to:",
                        e.target.value
                      );
                      setLimitPrice(e.target.value);
                    }}
                    type="number"
                    step="0.01"
                    readOnly={!isHost}
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                    <button
                      className="text-xs text-[#f97316] hover:text-[#f97316]/80"
                      onClick={() => {
                        console.log(
                          "[DEBUG] Setting limit price to current price:",
                          currentPrice.toString()
                        );
                        setLimitPrice(currentPrice.toString());
                      }}
                    >
                      현재가
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="market" className="text-white px-1">
              <div className="flex gap-1.5 flex-col">
                <Label className="text-xs text-white/60">주문가격</Label>
                <div className="relative">
                  <Input
                    className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#f97316] border border-white/30 rounded text-xs pr-24 bg-transparent selection:bg-[#f97316] selection:text-white"
                    value={currentPrice.toFixed(2)}
                    disabled
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                    <div className="text-xs text-[#f97316] pointer-events-none">
                      현재가
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-1.5 flex-col">
          <Label className="text-xs text-white/60">주문수량</Label>
          <div className="relative">
            <Input
              className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#f97316] border border-white/30 rounded text-xs pr-24 bg-transparent selection:bg-[#f97316] selection:text-white"
              value={entryAmount}
              onChange={(e) => {
                console.log(
                  "[DEBUG] Entry amount changing to:",
                  e.target.value
                );
                setEntryAmount(e.target.value);
              }}
              type="number"
              step="0.01"
              min="0"
              max={(balanceDetails?.available || virtualCurrency).toString()}
              readOnly={!isHost}
            />
            <div className="text-xs text-white/75 absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
              USDT
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="border border-white/20 rounded p-2">
            <div className="flex justify-between">
              {[10, 25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  className={`text-xs ${
                    selectedPercentage === percent
                      ? "text-[#f97316]"
                      : "text-white/70 hover:text-white"
                  } min-w-[40px] text-center ${!isHost ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={() => isHost && handlePercentageSelect(percent)}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Risk Management Section */}
          <div className="border border-white/20 rounded p-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowRiskSettings(!showRiskSettings)}
            >
              <span className="text-xs text-white font-medium">
                리스크 관리
              </span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-white transition-transform ${showRiskSettings ? "rotate-180" : ""}`}
              >
                <path
                  d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>

            {showRiskSettings && (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">
                    손절가 (Stop Loss)
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={useStopLoss}
                      onCheckedChange={(checked) =>
                        isHost && setUseStopLoss(checked)
                      }
                      className="data-[state=checked]:bg-[#FF5252]"
                      disabled={!isHost}
                    />
                  </div>
                </div>

                {useStopLoss && (
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#FF5252] border border-white/30 rounded text-xs pr-16 bg-transparent selection:bg-[#FF5252] selection:text-white"
                        value={stopLossPrice}
                        onChange={(e) => setStopLossPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        min="0"
                        readOnly={!isHost}
                      />
                      <div className="text-xs text-[#FF5252] absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                        USDT
                      </div>
                    </div>
                    <div className="text-xs text-white/50 italic">
                      {direction === "buy"
                        ? "가격이 이 수준 이하로 떨어지면"
                        : "가격이 이 수준 이상으로 올라가면"}{" "}
                      자동으로 포지션이 청산됩니다.
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/70">
                    이익실현가 (Take Profit)
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={useTakeProfit}
                      onCheckedChange={(checked) =>
                        isHost && setUseTakeProfit(checked)
                      }
                      className="data-[state=checked]:bg-[#00C879]"
                      disabled={!isHost}
                    />
                  </div>
                </div>

                {useTakeProfit && (
                  <div className="space-y-1">
                    <div className="relative">
                      <Input
                        className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#00C879] border border-white/30 rounded text-xs pr-16 bg-transparent selection:bg-[#00C879] selection:text-white"
                        value={takeProfitPrice}
                        onChange={(e) => setTakeProfitPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        min="0"
                        readOnly={!isHost}
                      />
                      <div className="text-xs text-[#00C879] absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                        USDT
                      </div>
                    </div>
                    <div className="text-xs text-white/50 italic">
                      {direction === "buy"
                        ? "가격이 이 수준 이상으로 올라가면"
                        : "가격이 이 수준 이하로 떨어지면"}{" "}
                      자동으로 포지션이 청산됩니다.
                    </div>
                  </div>
                )}

                <div className="pt-1 text-xs text-white/50 italic">
                  손절가와 이익실현가를 설정하면 자동으로 포지션이 청산됩니다.
                </div>
              </div>
            )}
          </div>

          <div className="border border-white/20 rounded p-2 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">매수수수료</span>
                <span className="text-xs text-[#00C879]">
                  {(feeRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">레버리지</span>
                <span className="text-xs text-[#00C879]">{leverage}x</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">포지션 크기</span>
                <span className="text-xs text-white">
                  {positionSize.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <span className="text-xs text-white/70">초기 마진</span>
                        <InfoIcon size={12} className="text-white/50" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1e27] border-gray-700 text-white">
                      <p className="text-xs">
                        포지션을 열 때 잠기는 금액입니다. 포지션을 닫으면 이
                        금액이 반환됩니다.
                        <br />
                        초기 마진 = 주문수량 + 수수료
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-xs text-white">
                  {initialMargin.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">청산가 (Long)</span>
                <span className="text-xs text-[#FF5252]">
                  {calculateLiquidationPrice("buy", currentPrice)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">청산가 (Short)</span>
                <span className="text-xs text-[#FF5252]">
                  {calculateLiquidationPrice("sell", currentPrice)} USDT
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      className={`w-full bg-[#00C879] hover:bg-[#00C879]/90 text-white py-2.5 rounded text-sm font-medium ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleSubmit("buy")}
                      disabled={isLoading || !isHost}
                    >
                      {isLoading ? "처리 중..." : "매수 / Long"}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isHost && (
                  <TooltipContent
                    side="bottom"
                    className="bg-[#1a1e27] border-gray-700 text-white"
                  >
                    <p>Only the host can execute trades in this room</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <Button
                      className={`w-full bg-[#FF5252] hover:bg-[#FF5252]/90 text-white py-2.5 rounded text-sm font-medium ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleSubmit("sell")}
                      disabled={isLoading || !isHost}
                    >
                      {isLoading ? "처리 중..." : "매도 / Short"}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!isHost && (
                  <TooltipContent
                    side="bottom"
                    className="bg-[#1a1e27] border-gray-700 text-white"
                  >
                    <p>Only the host can execute trades in this room</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="border-t border-white/20">
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">평가</span>
              <span className="text-xs text-[#00C879]">
                {(balanceDetails?.valuation || virtualCurrency).toFixed(2)} USDT
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">보유</span>
              <span className="text-xs text-[#00C879]">
                {(balanceDetails?.holdings || virtualCurrency).toFixed(2)} USDT
              </span>
            </div>

            <div className="flex justify-between items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <span className="text-xs text-white/70">가능</span>
                      <InfoIcon size={12} className="text-white/50" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1a1e27] border-gray-700 text-white">
                    <p className="text-xs">
                      거래에 사용할 수 있는 금액입니다. 총 보유액에서 초기
                      마진으로 잠긴 금액을 제외한 값입니다.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-xs text-[#00C879]">
                {(balanceDetails?.available || virtualCurrency).toFixed(2)} USDT
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20">
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">강제청산</span>
              <span className="text-xs text-[#00C879]">60%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">환율</span>
              <span className="text-xs text-[#00C879]">1:1</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">수수료</span>
              <span className="text-xs text-[#00C879]">0.05%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Margin Mode Dialog */}
      <MarginModeDialog
        open={marginModeDialogOpen}
        onOpenChange={setMarginModeDialogOpen}
        onConfirm={handleMarginModeChange}
        currentMode={marginMode}
      />

      {/* Leverage Dialog */}
      <LeverageDialog
        open={leverageDialogOpen}
        onOpenChange={setLeverageDialogOpen}
        onConfirm={handleLeverageChange}
        currentLeverage={leverage}
      />
    </div>
  );
});

export default TradingForm;
