"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useTrading } from "@/hooks/use-trading";
import { useRealTimeCurrency } from "@/hooks/use-real-time-currency";
import { toast } from "sonner";
import { MarginModeDialog } from "./margin-mode-dialog";
import { LeverageDialog } from "./leverage-dialog";
import { Switch } from "@/components/ui/switch";
import { executeTrade } from "@/app/actions/trading-actions";
import { updateVirtualCurrencyDisplay } from "@/utils/update-virtual-currency";

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
  virtualCurrency,
}: TradingFormProps) {
  // State for form inputs
  const [orderType, setOrderType] = useState<"limit" | "market">("market");
  const [leverage, setLeverage] = useState(1);
  const [marginMode, setMarginMode] = useState<"cross" | "isolated">("cross");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryPercentage, setEntryPercentage] = useState(0);
  const [limitPrice, setLimitPrice] = useState(currentPrice.toString());
  const [playSound, setPlaySound] = useState(false);
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedPercentage, setSelectedPercentage] = useState<number>(10);

  // Risk management state
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [showRiskSettings, setShowRiskSettings] = useState(false);

  // Dialog states
  const [marginModeDialogOpen, setMarginModeDialogOpen] = useState(false);
  const [leverageDialogOpen, setLeverageDialogOpen] = useState(false);

  // Make sure we have a clean UUID
  const cleanRoomId = useMemo(() => extractUUID(roomId) || roomId, [roomId]);
  console.log(
    "[TradingForm] Original roomId:",
    roomId,
    "Clean roomId:",
    cleanRoomId
  );

  // Trading hook - pass isHost to useTrading
  const { executeTrade: executeTradeHook, isLoading } = useTrading(
    cleanRoomId,
    isHost
  );

  // Use our new real-time currency hook instead of useVirtualCurrency
  const { virtualCurrency: realTimeCurrency, isLoading: currencyLoading } =
    useRealTimeCurrency(cleanRoomId);

  // Calculate max amount based on virtual currency
  const maxAmount = virtualCurrency || 10000;

  // Update amount when percentage changes
  useEffect(() => {
    const newAmount = (maxAmount * selectedPercentage) / 100;
    setAmount(Number.parseFloat(newAmount.toFixed(2)));
  }, [selectedPercentage, maxAmount]);

  // Update limit price when current price changes
  useEffect(() => {
    if (orderType === "market") {
      setLimitPrice(currentPrice.toString());
    }

    // Set default stop loss and take profit prices based on current price
    if (stopLossPrice === "" && currentPrice) {
      // Default stop loss 5% below current price for buy, 5% above for sell
      setStopLossPrice((currentPrice * 0.95).toFixed(2));
    }

    if (takeProfitPrice === "" && currentPrice) {
      // Default take profit 5% above current price for buy, 5% below for sell
      setTakeProfitPrice((currentPrice * 1.05).toFixed(2));
    }
  }, [currentPrice, orderType, stopLossPrice, takeProfitPrice]);

  // Handle percentage selection
  const handlePercentageSelect = useCallback(
    (percentage: number) => {
      if (!realTimeCurrency) return;

      const amount = (realTimeCurrency * percentage) / 100;
      setEntryAmount(amount.toFixed(2));
      setEntryPercentage(percentage);
    },
    [realTimeCurrency]
  );

  const handlePercentageClick = (percentage: number) => {
    setSelectedPercentage(percentage);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAmount(value);
      // Update the selected percentage based on the amount
      const percentage = (value / maxAmount) * 100;
      setSelectedPercentage(Math.min(Math.round(percentage), 100));
    }
  };

  // Handle margin mode change
  const handleMarginModeChange = useCallback((mode: "cross" | "isolated") => {
    setMarginMode(mode);
    toast.success(`Margin mode changed to ${mode}`);
  }, []);

  // Handle leverage change
  const handleLeverageChange = useCallback((newLeverage: number) => {
    setLeverage(newLeverage);
    toast.success(`Leverage changed to ${newLeverage}x`);
  }, []);

  // Calculate liquidation price (simplified)
  const calculateLiquidationPrice = useCallback(
    (direction: "buy" | "sell", entryPrice: number): number => {
      const maintenanceMargin = 0.6; // 60%
      const leverageMultiplier = leverage;

      if (direction === "buy") {
        // For long positions: entry_price * (1 - (1 / leverage) * (1 / maintenance_margin))
        return (
          entryPrice * (1 - (1 / leverageMultiplier) * (1 / maintenanceMargin))
        );
      } else {
        // For short positions: entry_price * (1 + (1 / leverage) * (1 / maintenance_margin))
        return (
          entryPrice * (1 + (1 / leverageMultiplier) * (1 / maintenanceMargin))
        );
      }
    },
    [leverage]
  );

  // Handle trade execution
  const handleTrade = useCallback(
    async (dir: "buy" | "sell") => {
      setDirection(dir);
      console.log("[TradingForm] handleTrade called with direction:", dir);
      console.log("[TradingForm] Using roomId:", cleanRoomId);

      if (!entryAmount || Number.parseFloat(entryAmount) <= 0) {
        console.log("[TradingForm] Invalid entry amount:", entryAmount);
        toast.error("Please enter a valid amount");
        return;
      }

      if (leverage < 1 || leverage > 125) {
        console.log("[TradingForm] Invalid leverage:", leverage);
        toast.error("Leverage must be between 1x and 125x");
        return;
      }

      const amount = Number.parseFloat(entryAmount);

      if (amount > (realTimeCurrency || 0)) {
        console.log(
          "[TradingForm] Insufficient balance. Amount:",
          amount,
          "Balance:",
          realTimeCurrency
        );
        toast.error("Insufficient balance");
        return;
      }

      const price =
        orderType === "limit" ? Number.parseFloat(limitPrice) : currentPrice;
      console.log(
        "[TradingForm] Using price:",
        price,
        "Order type:",
        orderType
      );

      // Validate stop loss and take profit if enabled
      let stopLoss: number | undefined = undefined;
      let takeProfit: number | undefined = undefined;

      if (useStopLoss) {
        stopLoss = Number.parseFloat(stopLossPrice);
        if (isNaN(stopLoss) || stopLoss <= 0) {
          toast.error("Please enter a valid stop loss price");
          return;
        }

        // Validate stop loss direction
        if (direction === "buy" && stopLoss >= price) {
          toast.error(
            "Stop loss price must be below entry price for buy orders"
          );
          return;
        } else if (direction === "sell" && stopLoss <= price) {
          toast.error(
            "Stop loss price must be above entry price for sell orders"
          );
          return;
        }
      }

      if (useTakeProfit) {
        takeProfit = Number.parseFloat(takeProfitPrice);
        if (isNaN(takeProfit) || takeProfit <= 0) {
          toast.error("Please enter a valid take profit price");
          return;
        }

        // Validate take profit direction
        if (direction === "buy" && takeProfit <= price) {
          toast.error(
            "Take profit price must be above entry price for buy orders"
          );
          return;
        } else if (direction === "sell" && takeProfit >= price) {
          toast.error(
            "Take profit price must be below entry price for sell orders"
          );
          return;
        }
      }

      // Play sound if enabled
      if (playSound) {
        const audio = new Audio("/sounds/trade.mp3");
        audio.play().catch((e) => console.error("Error playing sound:", e));
      }

      // Execute the trade
      console.log("[TradingForm] Executing trade with params:", {
        roomId: cleanRoomId,
        symbol,
        direction,
        entryAmount: amount,
        leverage,
        entryPrice: price,
        stopLoss,
        takeProfit,
      });

      const result = await executeTradeHook({
        roomId: cleanRoomId,
        symbol,
        direction,
        entryAmount: amount,
        leverage,
        entryPrice: price,
        stopLoss,
        takeProfit,
      });

      console.log("[TradingForm] Trade execution result:", result);

      if (result.success) {
        // Reset form
        setEntryAmount("");
        setEntryPercentage(0);
      }
    },
    [
      cleanRoomId,
      symbol,
      direction,
      entryAmount,
      leverage,
      orderType,
      limitPrice,
      currentPrice,
      useStopLoss,
      stopLossPrice,
      useTakeProfit,
      takeProfitPrice,
      playSound,
      executeTradeHook,
      realTimeCurrency,
    ]
  );

  const handleSubmit = async (direction: "buy" | "sell") => {
    try {
      setIsSubmitting(true);

      // Client-side validation
      if (amount <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }

      if (amount > maxAmount) {
        toast.error("Insufficient virtual currency");
        return;
      }

      // Execute the trade without causing a page refresh
      const result = await executeTrade({
        roomId,
        symbol,
        direction,
        entryAmount: amount,
        leverage,
        entryPrice: currentPrice,
      });

      if (result.success) {
        toast.success(
          `${direction === "buy" ? "Long" : "Short"} position opened successfully`
        );

        // Update virtual currency display immediately without page refresh
        updateVirtualCurrencyDisplay(roomId);

        // Emit a custom event to notify other components about the new position
        const newPositionEvent = new CustomEvent("new-position-created", {
          detail: {
            roomId,
            positionId: result.positionId,
          },
        });
        window.dispatchEvent(newPositionEvent);
      } else {
        toast.error(`Failed to open position: ${result.message}`);
      }
    } catch (error) {
      console.error("Error executing trade:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate estimated liquidation price
  const estimatedLiquidationPrice = useCallback(
    (direction: "buy" | "sell"): string => {
      const entryPrice =
        orderType === "limit"
          ? Number.parseFloat(limitPrice || "0")
          : currentPrice;
      if (!entryPrice) return "0";

      const liquidationPrice = calculateLiquidationPrice(direction, entryPrice);
      return liquidationPrice.toFixed(2);
    },
    [calculateLiquidationPrice, currentPrice, limitPrice, orderType]
  );

  const positionSize = useMemo(() => {
    return entryAmount && !isNaN(Number.parseFloat(entryAmount))
      ? (Number.parseFloat(entryAmount) * leverage).toFixed(2)
      : "0";
  }, [entryAmount, leverage]);

  return (
    <div className="bg-[#212631] p-2 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
      <div className="flex gap-1.5 w-full">
        <button
          className="flex items-center w-full cursor-pointer justify-between gap-2 px-4 py-2 bg-[#1a1e27] text-white rounded-md border border-white/10 hover:border-orange-500/50 transition-all duration-300"
          onClick={() => setMarginModeDialogOpen(true)}
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
          className="flex w-full items-center cursor-pointer justify-between gap-2 px-4 py-2 bg-[#1a1e27] text-white rounded-md border border-white/10 hover:border-orange-500/50 transition-all duration-300"
          onClick={() => setLeverageDialogOpen(true)}
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

      <div className="flex gap-[0.715rem] flex-col w-full">
        <div className="flex justify-between items-center w-full">
          <Tabs
            defaultValue={orderType}
            className="flex-1"
            onValueChange={(value) => setOrderType(value as "limit" | "market")}
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
                    onChange={(e) => setLimitPrice(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                    <button
                      className="text-xs text-[#f97316] hover:text-[#f97316]/80"
                      onClick={() => setLimitPrice(currentPrice.toString())}
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
                setEntryAmount(e.target.value);
                setEntryPercentage(0); // Reset percentage when manually entering amount
              }}
              type="number"
              step="0.01"
              min="0"
              max={realTimeCurrency?.toString()}
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
                  className={`text-xs ${entryPercentage === percent ? "text-[#f97316]" : "text-white/70 hover:text-white"} min-w-[40px] text-center`}
                  onClick={() => handlePercentageSelect(percent)}
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
                      onCheckedChange={setUseStopLoss}
                      className="data-[state=checked]:bg-[#FF5252]"
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
                      onCheckedChange={setUseTakeProfit}
                      className="data-[state=checked]:bg-[#00C879]"
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
                <span className="text-xs text-[#00C879]">0.02%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">레버리지</span>
                <span className="text-xs text-[#00C879]">{leverage}x</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">포지션 크기</span>
                <span className="text-xs text-white">{positionSize} USDT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">사용 마진</span>
                <span className="text-xs text-white">
                  {entryAmount || "0"} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">청산가 (Long)</span>
                <span className="text-xs text-[#FF5252]">
                  {estimatedLiquidationPrice("buy")} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">청산가 (Short)</span>
                <span className="text-xs text-[#FF5252]">
                  {estimatedLiquidationPrice("sell")} USDT
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Button
              className="bg-[#00C879] hover:bg-[#00C879]/90 text-white py-2.5 rounded text-sm font-medium"
              onClick={() => handleTrade("buy")}
              disabled={isLoading || !isHost || currencyLoading}
            >
              {isLoading ? "처리 중..." : "매수 / Long"}
            </Button>
            <Button
              className="bg-[#FF5252] hover:bg-[#FF5252]/90 text-white py-2.5 rounded text-sm font-medium"
              onClick={() => handleTrade("sell")}
              disabled={isLoading || !isHost || currencyLoading}
            >
              {isLoading ? "처리 중..." : "매도 / Short"}
            </Button>
          </div>
        </div>

        <div className="border-t border-white/20">
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">평가</span>
              <span className="text-xs text-[#00C879]">
                {realTimeCurrency?.toFixed(2) || "0"} USDT
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">보유</span>
              <span className="text-xs text-[#00C879]">
                {realTimeCurrency?.toFixed(2) || "0"} USDT
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">가능</span>
              <span className="text-xs text-[#00C879]">
                {realTimeCurrency?.toFixed(2) || "0"} USDT
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
