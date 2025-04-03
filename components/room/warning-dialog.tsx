"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WarningDialogProps {
  onConfirm: () => void;
  isOpen: boolean;
}

export function WarningDialog({ onConfirm, isOpen }: WarningDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleConfirm = () => {
    if (dontShowAgain) {
      // Store preference in localStorage
      localStorage.setItem("trading-warning-dismissed", Date.now().toString());
    }
    setIsVisible(false);
    onConfirm();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md rounded-lg bg-gradient-to-br from-[#1a1e27] to-[#212631] p-6 shadow-xl border border-[#3f445c]"
          >
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-gray-400 hover:text-white"
                onClick={handleConfirm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-xl font-bold text-amber-500">
              Trading Risk Warning
            </h2>

            <div className="space-y-3 text-center text-white/90">
              <p>
                This platform provides simulated trading content that does not
                result in actual financial transactions.
              </p>
              <p>
                Virtual currencies shown here cannot be exchanged for real money
                and are for educational purposes only.
              </p>
              <p className="text-sm text-amber-400">
                Trading cryptocurrencies involves significant risk and may not
                be suitable for everyone.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleConfirm}
                className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-6 py-2"
              >
                I Understand the Risks
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2">
              <Checkbox
                id="dont-show"
                checked={dontShowAgain}
                onCheckedChange={(checked) =>
                  setDontShowAgain(checked === true)
                }
                className="border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black"
              />
              <label
                htmlFor="dont-show"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Don&apos;t show for 24 hours
              </label>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
