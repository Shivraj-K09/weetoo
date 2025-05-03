"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface HostActivityIndicatorProps {
  roomId: string;
  ownerId: string;
}

export function HostActivityIndicator({
  roomId,
  ownerId,
}: HostActivityIndicatorProps) {
  const [isActive, setIsActive] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      subscription = supabase
        .channel(`room:${roomId}:host:${ownerId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "trading_positions" },
          () => {
            setIsActive(true);
            setLastActivity(new Date());
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Listen for custom host trading events
    const handleHostTrading = (event: CustomEvent) => {
      const detail = event.detail;

      if (detail.action === "placing_order") {
        setIsActive(true);
        setLastActivity(new Date());
      } else if (
        detail.action === "order_complete" ||
        detail.action === "order_failed"
      ) {
        // Keep active for a short time after completion
        setTimeout(() => {
          setIsActive(false);
        }, 3000);
      }
    };

    // Add event listener
    window.addEventListener("host-trading", handleHostTrading as EventListener);

    // Clean up event listener
    return () => {
      supabase.removeChannel(subscription);
      window.removeEventListener(
        "host-trading",
        handleHostTrading as EventListener
      );
    };
  }, [roomId, ownerId]);

  return (
    <div>
      {isActive && (
        <div className="text-xs text-green-500">
          Host is trading!
          {lastActivity && (
            <p className="text-xs text-gray-400">
              Last activity: {lastActivity.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
