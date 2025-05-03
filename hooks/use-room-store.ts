"use client";

import { useEffect, useCallback } from "react";
import {
  useRoomStore,
  useRoomId,
  usePositionsData,
  useVirtualCurrencyValue,
  useVirtualCurrencyLoading,
  useVirtualCurrencyError,
  usePositionsLoading,
  usePositionsError,
  useTradeHistoryData,
  useConnectionStatusValue,
} from "@/lib/store/room-store";

// Add this helper function at the top of the file
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

export function useRoom(roomId: string) {
  const storeRoomId = useRoomId();
  const actions = useRoomStore((state) => ({
    setRoomId: state.setRoomId,
    fetchRoomDetails: state.fetchRoomDetails,
    fetchPositions: state.fetchPositions,
    fetchTradeHistory: state.fetchTradeHistory,
    fetchVirtualCurrency: state.fetchVirtualCurrency,
    setupSubscriptions: state.setupSubscriptions,
  }));

  // Initialize room data and subscriptions
  useEffect(() => {
    if (!roomId) return;

    console.log("Initializing room store for room:", roomId);

    // Set the current room ID
    actions.setRoomId(roomId);

    // Fetch initial data
    const fetchData = async () => {
      try {
        await Promise.all([
          actions.fetchRoomDetails(roomId),
          actions.fetchPositions(roomId),
          actions.fetchTradeHistory(roomId),
          actions.fetchVirtualCurrency(roomId),
        ]);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchData();

    // Set up subscriptions
    const cleanup = actions.setupSubscriptions(roomId);

    // Clean up on unmount
    return cleanup;
  }, [roomId, actions]);

  return {
    roomId: storeRoomId,
    actions,
  };
}

// Specialized hooks for specific parts of the room state
export function usePositions(roomId: string) {
  const positions = usePositionsData();
  const isLoading = usePositionsLoading();
  const error = usePositionsError();

  const fetchPositions = useRoomStore((state) => state.fetchPositions);

  useEffect(() => {
    if (!roomId) return;
    fetchPositions(roomId);
  }, [roomId, fetchPositions]);

  return { positions, isLoading, error };
}

export function useVirtualCurrency(roomId: string) {
  const virtualCurrency = useVirtualCurrencyValue();
  const isLoading = useVirtualCurrencyLoading();
  const error = useVirtualCurrencyError();

  const fetchVirtualCurrency = useRoomStore(
    (state) => state.fetchVirtualCurrency
  );

  const handleVirtualCurrencyUpdate = useCallback(() => {
    if (roomId) {
      fetchVirtualCurrency(roomId);
    }
  }, [roomId, fetchVirtualCurrency]);

  useEffect(() => {
    if (!roomId) return;

    // Extract UUID if needed
    const extractedUUID = extractUUID(roomId) || roomId;
    console.log(
      "[useVirtualCurrency] Fetching for room:",
      roomId,
      "Extracted UUID:",
      extractedUUID
    );

    fetchVirtualCurrency(extractedUUID);

    // Listen for virtual currency update events
    window.addEventListener(
      "virtual-currency-update",
      handleVirtualCurrencyUpdate
    );

    return () => {
      window.removeEventListener(
        "virtual-currency-update",
        handleVirtualCurrencyUpdate
      );
    };
  }, [roomId, fetchVirtualCurrency, handleVirtualCurrencyUpdate]);

  console.log("[useVirtualCurrency] Current value:", virtualCurrency);

  return { virtualCurrency, isLoading, error };
}

export function useTradeHistory(roomId: string) {
  const tradeHistory = useTradeHistoryData();
  const isLoading = useRoomStore((state) => state.isLoading.tradeHistory);
  const error = useRoomStore((state) => state.error.tradeHistory);

  const fetchTradeHistory = useRoomStore((state) => state.fetchTradeHistory);
  const addTradeHistory = useRoomStore((state) => state.addTradeHistory);

  const handlePositionClosed = useCallback(
    (event: any) => {
      if (event.detail?.roomId === roomId) {
        console.log(
          "[useTradeHistory] Position closed event detected, refreshing trade history"
        );
        // If we have the trade history in the event, add it directly
        if (event.detail?.tradeHistory) {
          addTradeHistory(event.detail.tradeHistory);
        } else {
          // Otherwise fetch the updated trade history
          fetchTradeHistory(roomId);
        }
      }
    },
    [roomId, addTradeHistory, fetchTradeHistory]
  );

  const handleRefreshHistory = useCallback(
    (event: any) => {
      if (event.detail?.roomId === roomId) {
        console.log("[useTradeHistory] Refresh history event detected");
        fetchTradeHistory(roomId);
      }
    },
    [roomId, fetchTradeHistory]
  );

  useEffect(() => {
    if (!roomId) return;
    console.log("[useTradeHistory] Initial fetch for room:", roomId);
    fetchTradeHistory(roomId);

    // Listen for position closed events to refresh trade history
    window.addEventListener("position-closed", handlePositionClosed);

    // Listen for explicit refresh requests
    window.addEventListener("refresh-trade-history", handleRefreshHistory);

    // Listen for new position events
    window.addEventListener("new-position-created", handleRefreshHistory);

    return () => {
      window.removeEventListener("position-closed", handlePositionClosed);
      window.removeEventListener("refresh-trade-history", handleRefreshHistory);
      window.removeEventListener("new-position-created", handleRefreshHistory);
    };
  }, [roomId, fetchTradeHistory, handlePositionClosed, handleRefreshHistory]);

  return { tradeHistory, isLoading, error };
}

export function useConnectionStatus() {
  const connectionStatus = useConnectionStatusValue();
  const reconnect = useRoomStore((state) => state.reconnect);
  const setConnectionStatus = useRoomStore(
    (state) => state.setConnectionStatus
  );

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      console.log("Tab became visible, checking connection status");
      if (connectionStatus !== "connected") {
        reconnect();
      }
    }
  }, [connectionStatus, reconnect]);

  const handleOnline = useCallback(() => {
    console.log("Browser went online, reconnecting");
    reconnect();
  }, [reconnect]);

  const handleOffline = useCallback(() => {
    console.log("Browser went offline");
    setConnectionStatus("disconnected");
  }, [setConnectionStatus]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleVisibilityChange, handleOnline, handleOffline]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
    isConnecting: connectionStatus === "connecting",
    isDisconnected: connectionStatus === "disconnected",
    reconnect,
  };
}
