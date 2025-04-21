"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoomRevalidatorProps {
  roomId: string;
  autoJoinResult?: {
    success: boolean;
    shouldRevalidate?: boolean;
    path?: string;
  };
}

export function RoomRevalidator({
  roomId,
  autoJoinResult,
}: RoomRevalidatorProps) {
  const router = useRouter();

  useEffect(() => {
    // If we need to revalidate, do it here on the client side
    if (autoJoinResult?.shouldRevalidate) {
      console.log("[REVALIDATOR] Refreshing room data");
      router.refresh();
    }
  }, [autoJoinResult, router]);

  return null; // This component doesn't render anything
}
