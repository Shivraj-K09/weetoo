"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CloseRoomDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function CloseRoomDialog({
  onConfirm,
  onCancel,
  isOpen,
}: CloseRoomDialogProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleConfirm = () => {
    setIsVisible(false);
    onConfirm();
  };

  const handleCancel = () => {
    setIsVisible(false);
    onCancel();
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
                className="h-6 w-6 rounded-full"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-xl font-bold text-red-500">
              Close Trading Room
            </h2>

            <div className="space-y-3 text-center text-white/90">
              <p>
                Are you sure you want to close this trading room? This action
                cannot be undone.
              </p>
              <p>
                All participants will be disconnected and the room will be
                permanently deleted from the database.
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-600 "
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2"
              >
                Close Room
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
