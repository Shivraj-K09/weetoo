"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { donateKorCoins } from "@/app/actions/donate-actions";
import { toast } from "sonner";
import { useKorCoins } from "@/hooks/use-kor-coins";
import { formatNumber } from "@/utils/format-utils";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  hostId: string;
  hostName: string;
  onDonationSuccess: (donorName: string, amount: number) => void;
}

export function DonationModal({
  isOpen,
  onClose,
  roomId,
  hostId,
  hostName,
  onDonationSuccess,
}: DonationModalProps) {
  const [amount, setAmount] = useState<string>("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { korCoins, isLoading, setKorCoins } = useKorCoins();

  // Reset amount when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("100");
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    setAmount(value);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const donationAmount = Number.parseInt(amount, 10);
    if (isNaN(donationAmount) || donationAmount < 100) {
      toast.error("Minimum donation amount is 100 KOR_COINS");
      return;
    }

    if (donationAmount > korCoins) {
      toast.error("You don't have enough KOR_COINS");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await donateKorCoins(roomId, hostId, donationAmount);

      if (result.success) {
        // Update local KOR_COINS state
        setKorCoins(korCoins - donationAmount);

        // Close modal
        onClose();

        // Trigger success callback
        onDonationSuccess(result.donorName || "Anonymous", donationAmount);

        // Show success toast
        toast.success("Donation successful!");
      } else {
        toast.error(result.message || "Failed to process donation");
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      toast.error("An error occurred while processing your donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#1a1e27] border border-[#3f445c] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Donate KOR_COINS
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-yellow-500">
                Your Balance:{" "}
                {isLoading ? "Loading..." : formatNumber(korCoins)} KOR_COINS
              </div>
            </div>
            <Label htmlFor="amount" className="text-sm text-gray-400 pb-2">
              Donation Amount (min. 100)
            </Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="bg-[#212631] border-[#3f445c] text-white"
              placeholder="Enter amount (min. 100)"
              required
            />
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                className="border-[#3f445c] hover:bg-[#3f445c]/30 bg-transparent"
                onClick={() => handleQuickAmount(value)}
              >
                {formatNumber(value)}
              </Button>
            ))}
          </div>

          <div className="text-center text-sm text-gray-400 mt-4">
            You are donating to{" "}
            <span className="font-bold text-yellow-500">{hostName}</span>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#3f445c] bg-transparent hover:bg-[#3f445c]/30"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={
                isSubmitting ||
                isLoading ||
                Number.parseInt(amount, 10) < 100 ||
                Number.parseInt(amount, 10) > korCoins
              }
            >
              {isSubmitting ? "Processing..." : "Donate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
