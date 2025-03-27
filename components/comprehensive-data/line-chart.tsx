"use client";

import { useEffect, useRef } from "react";

interface LineChartProps {
  data: number[];
  color: string;
}

export function LineChart({ data, color }: LineChartProps) {
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

    // Draw line
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * rect.width,
      y:
        rect.height -
        ((value - Math.min(...data)) /
          (Math.max(...data) - Math.min(...data))) *
          rect.height *
          0.8 -
        rect.height * 0.1,
    }));

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
    gradient.addColorStop(0, `${color}50`); // Semi-transparent at top
    gradient.addColorStop(1, `${color}00`); // Transparent at bottom

    // Draw area under the line
    ctx.beginPath();
    ctx.moveTo(points[0].x, rect.height);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, rect.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line with shadow
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      // Use bezier curves for smoother lines
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }

    // Last point
    ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.stroke();

    // Draw dots at start and end
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, 2, 0, Math.PI * 2);
    ctx.arc(
      points[points.length - 1].x,
      points[points.length - 1].y,
      2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
