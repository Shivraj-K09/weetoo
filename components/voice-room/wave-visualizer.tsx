"use client";

import { useEffect, useRef } from "react";
import type { Track } from "livekit-client";

interface WaveVisualizerProps {
  track?: Track | null;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showSimulated?: boolean;
}

export function WaveVisualizer({
  track,
  width = 300,
  height = 60,
  color = "#4ade80",
  backgroundColor = "#1a1e27",
  showSimulated = false,
}: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const simulationRef = useRef<{ phase: number; values: number[] }>({
    phase: 0,
    values: Array(64)
      .fill(0)
      .map(() => Math.random() * 0.5),
  });

  useEffect(() => {
    // Get canvas and context - with early returns if not available
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clean up previous audio context if it exists
    if (audioContextRef.current) {
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          console.error("Error disconnecting source:", e);
        }
      }

      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (e) {
          console.error("Error disconnecting analyser:", e);
        }
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      try {
        // Only close if the context is not already closed
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (e) {
        console.error("Error closing audio context:", e);
      }
    }

    // If we have a track and it's not a simulation, set up real audio analysis
    if (track && !showSimulated) {
      const setupVisualizer = async () => {
        try {
          // Get the MediaStreamTrack from the Track
          const mediaStreamTrack = track.mediaStreamTrack;
          if (!mediaStreamTrack) {
            console.error("No MediaStreamTrack available");
            drawSimulated(ctx, canvas);
            return;
          }

          // Create a MediaStream with the track
          const mediaStream = new MediaStream([mediaStreamTrack]);

          // Set up audio context and analyzer
          const audioContext = new AudioContext();
          audioContextRef.current = audioContext;

          const analyser = audioContext.createAnalyser();
          analyserRef.current = analyser;
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.7;

          // Create source from the media stream
          const source = audioContext.createMediaStreamSource(mediaStream);
          sourceRef.current = source;
          source.connect(analyser);

          // Set up data array for frequency data
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          // Animation function for real audio
          const draw = () => {
            // Check if canvas or context is null before proceeding
            if (!ctx || !canvas || !analyser) {
              if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
              }
              return;
            }

            animationRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw a smooth wave based on frequency data
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);

            const sliceWidth = canvas.width / (bufferLength - 1);

            // Draw the bottom half of the wave
            for (let i = 0; i < bufferLength; i++) {
              const value = dataArray[i] / 255.0;
              const y = canvas.height - value * (canvas.height / 2);
              const x = i * sliceWidth;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            // Complete the wave by drawing back to the start
            for (let i = bufferLength - 1; i >= 0; i--) {
              const value = dataArray[i] / 255.0;
              const y = canvas.height / 2 + value * (canvas.height / 2);
              const x = i * sliceWidth;

              ctx.lineTo(x, y);
            }

            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
          };

          draw();
        } catch (error) {
          console.error("Error setting up audio visualizer:", error);
          // Fall back to simulated visualization
          drawSimulated(ctx, canvas);
        }
      };

      setupVisualizer();
    } else {
      // Use simulated visualization
      drawSimulated(ctx, canvas);
    }

    // Simulated visualization function - now takes ctx and canvas as parameters
    function drawSimulated(
      ctx: CanvasRenderingContext2D,
      canvas: HTMLCanvasElement
    ) {
      const draw = () => {
        // Check if canvas or context is null before proceeding
        if (!ctx || !canvas) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          return;
        }

        animationRef.current = requestAnimationFrame(draw);

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update simulation values
        simulationRef.current.phase += 0.05;
        const { values, phase } = simulationRef.current;

        for (let i = 0; i < values.length; i++) {
          // Add some randomness and wave motion
          values[i] = Math.max(
            0.1,
            Math.min(
              0.9,
              values[i] +
                Math.sin(phase + i * 0.2) * 0.03 +
                (Math.random() - 0.5) * 0.04
            )
          );
        }

        // Draw a smooth wave
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        const sliceWidth = canvas.width / (values.length - 1);

        // Draw the bottom half of the wave
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          const y = canvas.height - value * (canvas.height / 2);
          const x = i * sliceWidth;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Complete the wave by drawing back to the start
        for (let i = values.length - 1; i >= 0; i--) {
          const value = values[i];
          const y = canvas.height / 2 + value * (canvas.height / 2);
          const x = i * sliceWidth;

          ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      draw();
    }

    return () => {
      if (audioContextRef.current) {
        if (sourceRef.current) {
          try {
            sourceRef.current.disconnect();
          } catch (e) {
            console.error("Error disconnecting source:", e);
          }
        }

        if (analyserRef.current) {
          try {
            analyserRef.current.disconnect();
          } catch (e) {
            console.error("Error disconnecting analyser:", e);
          }
        }

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        try {
          // Only close if the context is not already closed
          if (audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
          }
        } catch (e) {
          console.error("Error closing audio context:", e);
        }
      } else if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [track, color, backgroundColor, height, width, showSimulated]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-md"
    />
  );
}
