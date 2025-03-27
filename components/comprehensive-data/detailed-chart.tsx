"use client";

import { useEffect, useRef } from "react";
import { getCandlestickData } from "@/lib/data";

interface DetailedChartProps {
  symbol: string;
}

export function DetailedChart({ symbol }: DetailedChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const data = getCandlestickData(symbol);
  const lastCandle = data[data.length - 1];
  const currentPrice = lastCandle.close.toFixed(4);
  const priceChange =
    lastCandle.close >= lastCandle.open ? "+0.0003 (0.03%)" : "-0.0003 (0.03%)";
  const isPriceUp = lastCandle.close >= lastCandle.open;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    ctx.fillStyle = "#1e2329";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid lines
    ctx.strokeStyle = "#2c3038";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * rect.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = (i / 6) * rect.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    // Draw candlesticks
    const candleWidth = (rect.width / data.length) * 0.8;
    const spacing = (rect.width / data.length) * 0.2;

    const minPrice = Math.min(...data.flatMap((d) => [d.low, d.open, d.close]));
    const maxPrice = Math.max(
      ...data.flatMap((d) => [d.high, d.open, d.close])
    );
    const priceRange = maxPrice - minPrice;

    data.forEach((candle, i) => {
      const x = i * (candleWidth + spacing) + spacing / 2;

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(
        x + candleWidth / 2,
        rect.height -
          ((candle.high - minPrice) / priceRange) * rect.height * 0.8 -
          rect.height * 0.1
      );
      ctx.lineTo(
        x + candleWidth / 2,
        rect.height -
          ((candle.low - minPrice) / priceRange) * rect.height * 0.8 -
          rect.height * 0.1
      );
      ctx.strokeStyle = candle.close >= candle.open ? "#22c55e" : "#ef4444";
      ctx.stroke();

      // Draw candle body
      const openY =
        rect.height -
        ((candle.open - minPrice) / priceRange) * rect.height * 0.8 -
        rect.height * 0.1;
      const closeY =
        rect.height -
        ((candle.close - minPrice) / priceRange) * rect.height * 0.8 -
        rect.height * 0.1;
      const candleHeight = Math.abs(closeY - openY);

      ctx.fillStyle = candle.close >= candle.open ? "#22c55e" : "#ef4444";
      ctx.fillRect(
        x,
        Math.min(openY, closeY),
        candleWidth,
        Math.max(candleHeight, 1)
      );
    });

    // Draw time label
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px Arial";
    ctx.fillText("12:00 AM", 10, 20);
  }, [symbol, data]);

  return (
    <div className="bg-[#1e2329] border-2 border-[#3c4048] rounded-md shadow-2xl overflow-hidden w-full h-full relative">
      {/* Header bar with currency symbol and current price */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#252a31] border-b border-[#3c4048] flex items-center justify-between px-3">
        <span className="text-white text-sm font-medium">{symbol}</span>
        <div className="flex items-center">
          <span className="text-white text-sm font-medium mr-2">
            {currentPrice}
          </span>
          <span
            className={`text-xs ${
              isPriceUp ? "text-green-500" : "text-red-500"
            }`}
          >
            {priceChange}
          </span>
        </div>
      </div>

      {/* Canvas with padding for header */}
      <div className="pt-8 h-full">
        <canvas
          ref={canvasRef}
          width="350"
          height="220"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
