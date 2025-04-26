"use client";

import { useState, useEffect, useRef } from "react";

interface Position {
  id: string;
  direction: "buy" | "sell";
  entry_price: number;
  position_size: number;
  leverage: number;
  entry_amount: number;
}

interface PnLData {
  currentPnL: number;
  pnlPercentage: number;
  liquidationPrice: number;
}

interface PositionPnLMap {
  [positionId: string]: {
    pnl: number;
    pnlPercentage: number;
  };
}

// For a single position
export function usePositionPnL(
  position: Position | null,
  currentPrice: number
): PnLData {
  const [pnlData, setPnlData] = useState<PnLData>({
    currentPnL: 0,
    pnlPercentage: 0,
    liquidationPrice: 0,
  });

  // Use a ref to track the previous values to avoid unnecessary updates
  const prevPositionRef = useRef<Position | null>(null);
  const prevPriceRef = useRef<number>(0);

  useEffect(() => {
    // Skip calculation if inputs haven't changed
    if (
      !position ||
      !currentPrice ||
      currentPrice === 0 ||
      (prevPositionRef.current === position &&
        prevPriceRef.current === currentPrice)
    ) {
      return;
    }

    // Update refs with current values
    prevPositionRef.current = position;
    prevPriceRef.current = currentPrice;

    // Calculate P&L
    let currentPnL = 0;
    let pnlPercentage = 0;
    let liquidationPrice = 0;

    // Calculate P&L based on direction
    if (position.direction === "buy") {
      // For long positions: (current_price - entry_price) / entry_price * position_size
      currentPnL =
        ((currentPrice - position.entry_price) / position.entry_price) *
        position.position_size;

      // Calculate liquidation price (simplified)
      // For longs: entry_price * (1 - (1 / leverage) * 0.9)
      // The 0.9 factor represents a 90% loss of the margin, which would trigger liquidation
      liquidationPrice =
        position.entry_price * (1 - (1 / position.leverage) * 0.9);
    } else {
      // For short positions: (entry_price - current_price) / entry_price * position_size
      currentPnL =
        ((position.entry_price - currentPrice) / position.entry_price) *
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
export function usePositionsPnL(positions: Position[], currentPrice: number) {
  const [positionsPnL, setPositionsPnL] = useState<PositionPnLMap>({});

  // Use refs to track previous values and prevent unnecessary updates
  const positionsRef = useRef<Position[]>([]);
  const priceRef = useRef<number>(0);
  const calculatedRef = useRef<boolean>(false);

  useEffect(() => {
    // Skip if we don't have valid inputs or if they haven't changed
    if (
      !positions.length ||
      !currentPrice ||
      currentPrice === 0 ||
      (calculatedRef.current &&
        priceRef.current === currentPrice &&
        positionsAreEqual(positionsRef.current, positions))
    ) {
      return;
    }

    // Update refs with current values
    positionsRef.current = [...positions];
    priceRef.current = currentPrice;
    calculatedRef.current = true;

    // Create a new PnL data object
    const newPnLData: PositionPnLMap = {};

    // Calculate PnL for each position
    positions.forEach((position) => {
      let pnl = 0;
      let pnlPercentage = 0;

      // Calculate P&L based on direction
      if (position.direction === "buy") {
        // For long positions: (current_price - entry_price) / entry_price * position_size
        pnl =
          ((currentPrice - position.entry_price) / position.entry_price) *
          position.position_size;
      } else {
        // For short positions: (entry_price - current_price) / entry_price * position_size
        pnl =
          ((position.entry_price - currentPrice) / position.entry_price) *
          position.position_size;
      }

      // Calculate P&L percentage relative to the entry amount
      pnlPercentage = (pnl / position.entry_amount) * 100;

      newPnLData[position.id] = { pnl, pnlPercentage };
    });

    // Only update state if the values have actually changed
    if (!areEqual(positionsPnL, newPnLData)) {
      setPositionsPnL(newPnLData);
    }
  }, [positions, currentPrice, positionsPnL]);

  return { positionsPnL };
}

// Helper function to check if two position arrays are equal
function positionsAreEqual(
  prevPositions: Position[],
  currentPositions: Position[]
): boolean {
  if (prevPositions.length !== currentPositions.length) {
    return false;
  }

  // Create a map of position IDs for faster lookup
  const prevMap = new Map(prevPositions.map((p) => [p.id, p]));

  // Check if all current positions exist in previous positions with same values
  return currentPositions.every((curr) => {
    const prev = prevMap.get(curr.id);
    if (!prev) return false;

    return (
      prev.direction === curr.direction &&
      prev.entry_price === curr.entry_price &&
      prev.position_size === curr.position_size &&
      prev.leverage === curr.leverage &&
      prev.entry_amount === curr.entry_amount
    );
  });
}

// Helper function to check if two PnL data objects are equal
function areEqual(obj1: PositionPnLMap, obj2: PositionPnLMap): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => {
    if (!obj2[key]) return false;
    return (
      Math.abs(obj1[key].pnl - obj2[key].pnl) < 0.0001 &&
      Math.abs(obj1[key].pnlPercentage - obj2[key].pnlPercentage) < 0.0001
    );
  });
}
