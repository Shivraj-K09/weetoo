"use client";

import { useEffect } from "react";

interface BroadcastingStatusUpdaterProps {
  isBroadcasting: boolean;
  onStatusChange: (isBroadcasting: boolean) => void;
}

export default function BroadcastingStatusUpdater({
  isBroadcasting,
  onStatusChange,
}: BroadcastingStatusUpdaterProps) {
  useEffect(() => {
    // Update the parent component with the broadcasting status
    onStatusChange(isBroadcasting);
  }, [isBroadcasting, onStatusChange]);

  // This component doesn't render anything
  return null;
}
