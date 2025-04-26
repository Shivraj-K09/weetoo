"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LeverageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (leverage: number) => void;
  currentLeverage: number;
}

export function LeverageDialog({
  open,
  onOpenChange,
  onConfirm,
  currentLeverage,
}: LeverageDialogProps) {
  const [inputValue, setInputValue] = useState(currentLeverage.toString());
  const [sliderValue, setSliderValue] = useState(currentLeverage);
  const sliderRef = useRef<HTMLInputElement>(null);
  const maxLeverage = 100;

  const leverageOptions = [1, 10, 20, 30, 40, 50, 60, 70, 80, 100];

  // Update internal state when props change
  useEffect(() => {
    if (open) {
      setInputValue(currentLeverage.toString());
      setSliderValue(currentLeverage);
    }
  }, [currentLeverage, open]);

  // Update input when slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    setSliderValue(value);
    setInputValue(value.toString());
  };

  // Update slider when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update slider if value is a valid number
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxLeverage) {
      setSliderValue(numValue);
    }
  };

  const handleConfirm = () => {
    const numValue = Number.parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxLeverage) {
      onConfirm(numValue);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className="bg-[#1a1e27] rounded-lg overflow-hidden border border-white/10 shadow-xl">
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h2 className="text-white text-lg font-medium">Adjust Leverage</h2>
            <DialogClose className="text-white/70 hover:text-white">
              <X size={18} />
            </DialogClose>
          </div>

          <div className="p-4 space-y-4">
            {/* Leverage input */}
            <div className="mb-6">
              <p className="text-white/70 mb-2 text-sm">Leverage</p>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="w-full bg-[#2a2e39] text-white border border-white/10 rounded p-3 text-center text-lg"
                onBlur={() => {
                  // Validate on blur
                  const numValue = Number.parseInt(inputValue, 10);
                  if (isNaN(numValue) || numValue < 1) {
                    setInputValue("1");
                    setSliderValue(1);
                  } else if (numValue > maxLeverage) {
                    setInputValue(maxLeverage.toString());
                    setSliderValue(maxLeverage);
                  }
                }}
              />
            </div>

            {/* Slider */}
            <div className="relative">
              <input
                ref={sliderRef}
                type="range"
                min="1"
                max={maxLeverage}
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e74c3c]"
                style={{
                  background: `linear-gradient(to right, #e74c3c 0%, #e74c3c ${sliderValue}%, #2a2e39 ${sliderValue}%, #2a2e39 100%)`,
                }}
              />

              {/* Leverage markers */}
              <div className="flex justify-between mt-2 text-xs text-white/60">
                {leverageOptions.map((option) => (
                  <div
                    key={option}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setSliderValue(option);
                      setInputValue(option.toString());
                    }}
                  >
                    <div
                      className={`h-1 w-1 rounded-full mb-1 ${sliderValue >= option ? "bg-[#e74c3c]" : "bg-white/30"}`}
                    ></div>
                    <span>{option}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning text */}
            <div className="bg-[#2a2e39] p-4 rounded-md text-sm">
              <p className="text-[#e74c3c] mb-3">
                It can be multiplied by up to x50 by default, and can be
                multiplied by x100 when using items.
              </p>
              <p className="text-white/70">
                Add or subtract the quantity ratio that can be ordered based on
                the amount held.
              </p>
              <p className="text-white/70 mt-3">
                When changed, all positions and unfilled orders for the current
                item will be affected.
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleConfirm}
                className="bg-[#e74c3c] hover:bg-[#d44235] text-white py-3 rounded-md font-medium transition-colors duration-200"
              >
                Confirm
              </button>
              <DialogClose asChild>
                <button className="bg-[#3a3e49] hover:bg-[#4a4e59] text-white py-3 rounded-md font-medium transition-colors duration-200">
                  Cancel
                </button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
