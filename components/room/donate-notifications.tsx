"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";
import { formatNumber } from "@/utils/format-utils";
import { supabase } from "@/lib/supabase/client";

interface DonationNotificationProps {
  roomId: string;
}

interface DonationEvent {
  id: string;
  donorName: string;
  amount: number;
  timestamp: string;
}

export function DonationNotification({ roomId }: DonationNotificationProps) {
  const [donations, setDonations] = useState<DonationEvent[]>([]);
  const [visibleDonation, setVisibleDonation] = useState<DonationEvent | null>(
    null
  );

  useEffect(() => {
    // Subscribe to donation events
    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on("broadcast", { event: "donation" }, (payload) => {
        const newDonation: DonationEvent = {
          id: Date.now().toString(),
          donorName: payload.payload.donorName,
          amount: payload.payload.amount,
          timestamp: payload.payload.timestamp,
        };

        // Add to queue
        setDonations((prev) => [...prev, newDonation]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Process donation queue
  useEffect(() => {
    if (donations.length > 0 && !visibleDonation) {
      // Show the next donation
      setVisibleDonation(donations[0]);

      // Remove it from the queue
      setDonations((prev) => prev.slice(1));
    }
  }, [donations, visibleDonation]);

  // Handle auto-dismissal of visible donation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (visibleDonation) {
      // Set a timer to clear the visible donation after 5 seconds
      timer = setTimeout(() => {
        setVisibleDonation(null);
      }, 5000);
    }

    // Clean up timer on component unmount or when visibleDonation changes
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visibleDonation]);

  return (
    <AnimatePresence>
      {visibleDonation && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4">
            <div className="bg-yellow-500 p-2 rounded-full">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">
                {visibleDonation.donorName} donated
              </div>
              <div className="text-2xl font-extrabold">
                {formatNumber(visibleDonation.amount)} KOR_COINS
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
