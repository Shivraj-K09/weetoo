"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function PositionRiskIndicator({
  direction,
  entryPrice,
  currentPrice,
  stopLoss,
  takeProfit,
}: {
  direction: "buy" | "sell";
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
}) {
  const [stopLossDistance, setStopLossDistance] = useState<number | null>(null);
  const [takeProfitDistance, setTakeProfitDistance] = useState<number | null>(
    null
  );
  const [riskRewardRatio, setRiskRewardRatio] = useState<number | null>(null);

  useEffect(() => {
    // If stop loss or take profit are not set, show a message
    if (!stopLoss && !takeProfit) {
      setStopLossDistance(null);
      setTakeProfitDistance(null);
      setRiskRewardRatio(null);
      return;
    }

    // Calculate distances as percentages
    if (stopLoss && stopLoss > 0) {
      const slDistance =
        direction === "buy"
          ? ((entryPrice - stopLoss) / entryPrice) * 100
          : ((stopLoss - entryPrice) / entryPrice) * 100;
      setStopLossDistance(slDistance);
    } else {
      setStopLossDistance(null);
    }

    if (takeProfit && takeProfit > 0) {
      const tpDistance =
        direction === "buy"
          ? ((takeProfit - entryPrice) / entryPrice) * 100
          : ((entryPrice - takeProfit) / entryPrice) * 100;
      setTakeProfitDistance(tpDistance);
    } else {
      setTakeProfitDistance(null);
    }

    // Calculate risk-reward ratio if both SL and TP are set
    if (stopLoss && stopLoss > 0 && takeProfit && takeProfit > 0) {
      let risk, reward;

      if (direction === "buy") {
        risk = entryPrice - stopLoss;
        reward = takeProfit - entryPrice;
      } else {
        risk = stopLoss - entryPrice;
        reward = entryPrice - takeProfit;
      }

      if (risk > 0) {
        setRiskRewardRatio(reward / risk);
      } else {
        setRiskRewardRatio(null);
      }
    } else {
      setRiskRewardRatio(null);
    }
  }, [direction, entryPrice, currentPrice, stopLoss, takeProfit]);

  // Determine if price is approaching stop loss or take profit
  const isApproachingStopLoss =
    stopLoss && stopLossDistance && stopLossDistance < 1;
  const isApproachingTakeProfit =
    takeProfit && takeProfitDistance && takeProfitDistance < 1;

  if (!stopLoss && !takeProfit) {
    return (
      <div className="bg-[#2A2E39] p-4 rounded-md mb-4">
        <p className="text-sm text-gray-400 text-center">
          No risk management settings configured
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {stopLoss && stopLoss > 0 && (
        <Badge
          className={`text-xs ${isApproachingStopLoss ? "bg-red-500 animate-pulse" : "bg-red-700"}`}
          title="Stop Loss Distance"
        >
          SL: {stopLossDistance?.toFixed(2)}%
        </Badge>
      )}

      {takeProfit && takeProfit > 0 && (
        <Badge
          className={`text-xs ${isApproachingTakeProfit ? "bg-green-500 animate-pulse" : "bg-green-700"}`}
          title="Take Profit Distance"
        >
          TP: {takeProfitDistance?.toFixed(2)}%
        </Badge>
      )}

      {riskRewardRatio && (
        <Badge
          className={`text-xs ${riskRewardRatio >= 2 ? "bg-green-600" : riskRewardRatio >= 1 ? "bg-yellow-600" : "bg-red-600"}`}
          title="Risk-Reward Ratio"
        >
          R:R {riskRewardRatio.toFixed(2)}
        </Badge>
      )}
    </div>
  );
}
