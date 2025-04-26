"use client";
import { useParams } from "next/navigation";
import { usePriceData } from "@/hooks/use-price-data";
import { TradingForm } from "./trading-form";
import { useRoomPermissions } from "@/hooks/use-room-permission";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React, { useMemo } from "react";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

export function TradingMarketPlace() {
  const params = useParams();
  const fullRoomName =
    typeof params?.roomName === "string" ? params.roomName : "";

  // Extract the UUID from the full room name
  const roomId = useMemo(() => extractUUID(fullRoomName) || "", [fullRoomName]);
  console.log(
    "[TradingMarketPlace] Full room name:",
    fullRoomName,
    "Extracted UUID:",
    roomId
  );

  const symbol = "BTCUSDT"; // Default symbol, could be made dynamic later

  // Use the room permissions hook with the extracted UUID
  const { isHost, isLoading: permissionsLoading } = useRoomPermissions(roomId);

  // Get price data for the selected symbol
  const { priceData, priceDataLoaded } = usePriceData(symbol);
  const currentPrice = useMemo(
    () => (priceDataLoaded ? Number.parseFloat(priceData.currentPrice) : 50000),
    [priceDataLoaded, priceData]
  );

  // Show loading state while permissions are being determined
  if (permissionsLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

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
            isHost={true}
          />
        </div>

        {/* Removed the flex-1 div that contained PositionsPanel and TradeHistory */}
      </div>

      {/* Removed TradingTabsBottom component */}
    </div>
  );
}

export default React.memo(TradingMarketPlace);
