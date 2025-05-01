"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Position } from "@/types";

interface PnLData {
  currentPnL: number;
  pnlPercentage: number;
  liquidationPrice: number;
}

export interface PositionPnL {
  pnl: number;
  pnlPercentage: number;
}

export interface PositionPnLMap {
  [positionId: string]: PositionPnL;
}

// Create a type that only requires the properties we actually use
type MinimalPosition = Pick<
  Position,
  | "id"
  | "direction"
  | "entry_price"
  | "position_size"
  | "leverage"
  | "entry_amount"
  | "symbol"
>;

// For a single position
export function usePositionPnL(
  position: Position | MinimalPosition | null,
  currentPrice: number | Record<string, number>
): PnLData {
  const [pnlData, setPnlData] = useState<PnLData>({
    currentPnL: 0,
    pnlPercentage: 0,
    liquidationPrice: 0,
  });

  // Use a ref to track the previous values to avoid unnecessary updates
  const prevPositionRef = useRef<Position | MinimalPosition | null>(null);
  const prevPriceRef = useRef<number | Record<string, number>>(0);

  useEffect(() => {
    // Skip calculation if inputs haven't changed
    if (
      !position ||
      !currentPrice ||
      (prevPositionRef.current === position &&
        prevPriceRef.current === currentPrice)
    ) {
      return;
    }

    // Update refs with current values
    prevPositionRef.current = position;
    prevPriceRef.current = currentPrice;

    // Get the actual price to use
    let priceToUse: number;

    if (typeof currentPrice === "number") {
      priceToUse = currentPrice;
    } else {
      // If it's a record, try to get the price for the position's symbol
      // Default to the first price in the record if symbol not found
      priceToUse =
        position.symbol && currentPrice[position.symbol]
          ? currentPrice[position.symbol]
          : Object.values(currentPrice)[0] || 0;
    }

    if (priceToUse === 0) return;

    // Calculate P&L
    let currentPnL = 0;
    let pnlPercentage = 0;
    let liquidationPrice = 0;

    // Calculate P&L based on direction
    if (position.direction === "buy") {
      // For long positions: (current_price - entry_price) / entry_price * position_size
      currentPnL =
        ((priceToUse - position.entry_price) / position.entry_price) *
        position.position_size;

      // Calculate liquidation price (simplified)
      // For longs: entry_price * (1 - (1 / leverage) * 0.9)
      // The 0.9 factor represents a 90% loss of the margin, which would trigger liquidation
      liquidationPrice =
        position.entry_price * (1 - (1 / position.leverage) * 0.9);
    } else {
      // For short positions: (entry_price - current_price) / entry_price * position_size
      currentPnL =
        ((position.entry_price - priceToUse) / position.entry_price) *
        position.position_size;

      // Calculate liquidation price (simplified)
      // For shorts: entry_price * (1 + (1 / leverage) * 0.9)
      liquidationPrice =
        position.entry_price * (1 + (1 / position.leverage) * 0.9);
    }

    // Calculate P&L percentage relative to the entry amount
    pnlPercentage = (currentPnL / position.entry_amount) * 100;

    setPnlData({
      currentPnL,
      pnlPercentage,
      liquidationPrice,
    });
  }, [position, currentPrice]);

  return pnlData;
}

// For multiple positions
export function usePositionsPnL(
  positions: (Position | MinimalPosition)[],
  currentPrice: number | Record<string, number>
) {
  const [positionsPnL, setPositionsPnL] = useState<PositionPnLMap>({});
  const [totalPnL, setTotalPnL] = useState(0);

  // Memoize the positions array to prevent unnecessary recalculations
  const memoizedPositions = useMemo(
    () => positions,
    [JSON.stringify(positions)]
  );

  // Memoize the current price to prevent unnecessary recalculations
  const memoizedPrice = useMemo(() => {
    if (typeof currentPrice === "number") {
      return currentPrice;
    }
    return { ...currentPrice };
  }, [
    typeof currentPrice === "number"
      ? currentPrice
      : JSON.stringify(currentPrice),
  ]);

  // Use a ref to track if we've already calculated for these inputs
  const calculatedRef = useRef(false);
  const positionsRef = useRef<(Position | MinimalPosition)[]>([]);
  const priceRef = useRef<number | Record<string, number>>(0);

  useEffect(() => {
    // Skip if no positions or no price
    if (
      !memoizedPositions ||
      memoizedPositions.length === 0 ||
      !memoizedPrice
    ) {
      setPositionsPnL({});
      setTotalPnL(0);
      calculatedRef.current = true;
      return;
    }

    // Skip if we've already calculated for these exact inputs
    const positionsEqual =
      JSON.stringify(positionsRef.current) ===
      JSON.stringify(memoizedPositions);
    const priceEqual =
      JSON.stringify(priceRef.current) === JSON.stringify(memoizedPrice);

    if (calculatedRef.current && positionsEqual && priceEqual) {
      return;
    }

    // Update refs
    positionsRef.current = [...memoizedPositions];
    priceRef.current =
      typeof memoizedPrice === "number" ? memoizedPrice : { ...memoizedPrice };
    calculatedRef.current = true;

    // Now calculate PnL
    const pnlMap: PositionPnLMap = {};
    let totalPnlValue = 0;

    memoizedPositions.forEach((position) => {
      // Get the actual price to use
      let priceToUse: number;

      if (typeof memoizedPrice === "number") {
        priceToUse = memoizedPrice;
      } else {
        // If it's a record, try to get the price for the position's symbol
        // Default to the first price in the record if symbol not found
        priceToUse =
          position.symbol && memoizedPrice[position.symbol]
            ? memoizedPrice[position.symbol]
            : Object.values(memoizedPrice)[0] || 0;
      }

      if (priceToUse === 0) return;

      let pnl = 0;
      let pnlPercentage = 0;

      if (position.direction === "buy") {
        // Long position: profit when price goes up
        pnl =
          (priceToUse - position.entry_price) *
          (position.position_size / position.entry_price);
      } else {
        // Short position: profit when price goes down
        pnl =
          (position.entry_price - priceToUse) *
          (position.position_size / position.entry_price);
      }

      // Calculate PnL percentage
      pnlPercentage = (pnl / position.entry_amount) * 100;

      // Ensure we always have a valid percentage value, even if it's zero
      pnlPercentage = isNaN(pnlPercentage) ? 0 : pnlPercentage;

      pnlMap[position.id] = { pnl, pnlPercentage };
      totalPnlValue += pnl;
    });

    setPositionsPnL(pnlMap);
    setTotalPnL(totalPnlValue);
  }, [memoizedPositions, memoizedPrice]);

  return { positionsPnL, totalPnL };
}
