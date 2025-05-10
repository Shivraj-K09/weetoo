"use client";
import { useParams } from "next/navigation";
import { usePriceData } from "@/hooks/use-price-data";
import { TradingForm } from "./trading-form";
import { useRoomPermissions } from "@/hooks/use-room-permission";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

// Create a placeholder component that looks like the trading form
function TradingFormSkeleton() {
  return (
    <div className="bg-[#212631] p-2 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
      <div className="flex gap-1.5 w-full mb-3">
        <div className="w-1/2 h-10 bg-[#1a1e27]/70 rounded animate-pulse"></div>
        <div className="w-1/2 h-10 bg-[#1a1e27]/70 rounded animate-pulse"></div>
      </div>

      {/* Price input skeleton */}
      <div className="mb-4">
        <div className="h-4 w-20 bg-[#1a1e27]/70 rounded animate-pulse mb-2"></div>
        <div className="h-8 bg-[#1a1e27]/70 rounded animate-pulse"></div>
      </div>

      {/* Amount input skeleton */}
      <div className="mb-4">
        <div className="h-4 w-20 bg-[#1a1e27]/70 rounded animate-pulse mb-2"></div>
        <div className="h-8 bg-[#1a1e27]/70 rounded animate-pulse"></div>
      </div>

      {/* Percentage buttons skeleton */}
      <div className="border border-white/20 rounded p-2 mb-4">
        <div className="flex justify-between">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-8 bg-[#1a1e27]/70 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Risk management skeleton */}
      <div className="border border-white/20 rounded p-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-[#1a1e27]/70 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-[#1a1e27]/70 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Position info skeleton */}
      <div className="border border-white/20 rounded p-2 mb-4 space-y-3">
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 bg-[#1a1e27]/70 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-[#1a1e27]/70 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-2 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 bg-[#1a1e27]/70 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-[#1a1e27]/70 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-10 bg-[#00C879]/30 rounded animate-pulse"></div>
        <div className="h-10 bg-[#FF5252]/30 rounded animate-pulse"></div>
      </div>

      {/* Balance info skeleton */}
      <div className="border-t border-white/20 pt-3 space-y-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-16 bg-[#1a1e27]/70 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-[#1a1e27]/70 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Additional info skeleton */}
      <div className="border-t border-white/20 pt-3 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-20 bg-[#1a1e27]/70 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-[#1a1e27]/70 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TradingMarketPlace() {
  // Debug render count
  const renderCount = useRef(0);
  renderCount.current++;

  const params = useParams();
  const fullRoomName =
    typeof params?.roomName === "string" ? params.roomName : "";

  // Extract the UUID from the full room name
  const roomId = useMemo(() => extractUUID(fullRoomName) || "", [fullRoomName]);
  console.log(`[DEBUG] TradingMarketPlace render #${renderCount.current}`, {
    fullRoomName,
    extractedRoomId: roomId,
  });

  const symbol = "BTCUSDT"; // Default symbol, could be made dynamic later

  // Use the room permissions hook with the extracted UUID
  const { isHost, isLoading: permissionsLoading } = useRoomPermissions(roomId);

  // Get price data for the selected symbol
  const { priceData, priceDataLoaded } = usePriceData(symbol);
  const currentPrice = useMemo(
    () => (priceDataLoaded ? Number.parseFloat(priceData.currentPrice) : 50000),
    [priceDataLoaded, priceData]
  );

  // For now, let's use a fixed value for virtual currency to avoid any potential issues
  // with the real-time updates causing infinite loops
  const virtualCurrency = 10000;

  // Force render after a short delay to ensure the form appears
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    // Force a re-render after a short delay
    const timer = setTimeout(() => {
      setForceRender(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Debug dependencies
  useEffect(() => {
    console.log("[DEBUG] TradingMarketPlace - roomId changed:", roomId);
  }, [roomId]);

  useEffect(() => {
    console.log(
      "[DEBUG] TradingMarketPlace - currentPrice changed:",
      currentPrice
    );
  }, [currentPrice]);

  useEffect(() => {
    console.log("[DEBUG] TradingMarketPlace - isHost changed:", isHost);
  }, [isHost]);

  // Show loading state while permissions are being determined
  if (permissionsLoading && !forceRender) {
    console.log("[DEBUG] TradingMarketPlace - showing loading state");
    return (
      <div className="flex max-w-[290px] w-full">
        <TradingFormSkeleton />
      </div>
    );
  }

  console.log("[DEBUG] TradingMarketPlace - about to render with:", {
    roomId,
    symbol,
    currentPrice,
    isHost,
    virtualCurrency,
    forceRender,
  });

  // For now, let's proceed with the trading interface regardless of permissions
  // This allows us to test the trading functionality
  return (
    <div className="flex max-w-[290px] w-full">
      {!roomId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not extract a valid room ID from the URL. Trading
            functionality may be limited.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col gap-4">
          <TradingForm
            roomId={roomId}
            symbol={symbol}
            currentPrice={currentPrice}
            isHost={isHost}
            virtualCurrency={virtualCurrency}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(TradingMarketPlace);
