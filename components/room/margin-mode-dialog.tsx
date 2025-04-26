"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useEffect, useState } from "react";

interface MarginModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: "cross" | "isolated") => void;
  currentMode: "cross" | "isolated";
}

export function MarginModeDialog({
  open,
  onOpenChange,
  onConfirm,
  currentMode,
}: MarginModeDialogProps) {
  const [selectedMode, setSelectedMode] = useState<"cross" | "isolated">(
    currentMode
  );

  // Update internal state when props change
  useEffect(() => {
    if (open) {
      setSelectedMode(currentMode);
    }
  }, [currentMode, open]);

  const handleConfirm = () => {
    onConfirm(selectedMode);
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
            <h2 className="text-white text-lg font-medium">
              Choose Margin Mode
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-md transition-all duration-200",
                  selectedMode === "cross"
                    ? "bg-transparent border border-orange-500"
                    : "bg-[#2a2e39] border border-transparent"
                )}
                onClick={() => setSelectedMode("cross")}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    selectedMode === "cross"
                      ? "border-orange-500"
                      : "border-white/40"
                  )}
                >
                  {selectedMode === "cross" && (
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  )}
                </div>
                <span className="text-white">Cross</span>
              </button>

              <button
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-md transition-all duration-200",
                  selectedMode === "isolated"
                    ? "bg-transparent border border-orange-500"
                    : "bg-[#2a2e39] border border-transparent"
                )}
                onClick={() => setSelectedMode("isolated")}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    selectedMode === "isolated"
                      ? "border-orange-500"
                      : "border-white/40"
                  )}
                >
                  {selectedMode === "isolated" && (
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  )}
                </div>
                <span className="text-white">Isolated</span>
              </button>
            </div>

            <div className="bg-[#2a2e39] p-4 rounded-md text-white/70 text-sm">
              {selectedMode === "cross" ? (
                <>
                  If the loss exceeds the total holding amount (60%), it will be
                  liquidated.
                  <br />
                  <br />
                  When changed, all positions and unfilled orders for the
                  current item will be affected.
                </>
              ) : (
                <>
                  If the position loss exceeds the position maintenance
                  margin(60%), it will be liquidated.
                  <br />
                  <br />
                  When changed, all positions and unfilled orders for the
                  current item will be affected.
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleConfirm}
                className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium transition-colors duration-200"
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
