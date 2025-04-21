"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DonationModal } from "./donation-modal";
import { Coins } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface DonationButtonProps {
  roomId: string;
  hostId: string;
  hostName: string;
  userId: string;
}

export function DonationButton({
  roomId,
  hostId,
  hostName,
  userId,
}: DonationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show the button if the user is the host
  if (userId === hostId) {
    return null;
  }

  const handleDonationSuccess = (donorName: string, amount: number) => {
    // Broadcast the donation to all room participants via Supabase Realtime
    const channel = supabase.channel(`room:${roomId}`);

    channel.send({
      type: "broadcast",
      event: "donation",
      payload: {
        donorName,
        amount,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2"
      >
        <Coins className="h-4 w-4" />
        Donate KOR_COINS
      </Button>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={roomId}
        hostId={hostId}
        hostName={hostName}
        onDonationSuccess={handleDonationSuccess}
      />
    </>
  );
}
