"use client";

import { useEffect, useRef } from "react";
import { performanceData } from "@/lib/data";

export function PerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const horizontalLines = [
      "-1.00%",
      "-0.80%",
      "-0.60%",
      "-0.40%",
      "-0.20%",
      "0.00%",
      "0.20%",
      "0.40%",
      "0.60%",
      "0.80%",
      "1.00%",
    ];
    horizontalLines.forEach((label, i) => {
      const y = (i / (horizontalLines.length - 1)) * rect.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();

      // Draw labels
      ctx.fillStyle = "#9ca3af";
      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.fillText(label, rect.width - 10, y + 3);
    });

    // Draw bars
    const barWidth = 40;
    const spacing = 10;
    const startX =
      (rect.width - (barWidth + spacing) * performanceData.length) / 2;

    performanceData.forEach((item, i) => {
      const x = startX + i * (barWidth + spacing);
      const value = Number.parseFloat(item.value);
      const height = (Math.abs(value) * rect.height) / 2;
      const y = value >= 0 ? rect.height / 2 - height : rect.height / 2;

      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, height);

      // Draw value
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      if (value !== 0) {
        ctx.fillText(
          item.value,
          x + barWidth / 2,
          value >= 0 ? y - 5 : y + height + 15
        );
      }

      // Draw label
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(item.label, x + barWidth / 2, rect.height - 10);
    });

    // Draw title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("1 DAY RELATIVE PERFORMANCE [USD]", rect.width / 2, 20);
  }, []);

  return (
    <div className="bg-[#1e2329] border border-[#2c3038] rounded-md p-4">
      <canvas ref={canvasRef} className="w-full h-[250px]" />
    </div>
  );
}
