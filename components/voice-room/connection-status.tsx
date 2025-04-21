"use client";

import { useEffect, useState } from "react";
import { ConnectionState, type Room, RoomEvent } from "livekit-client";

interface ConnectionStatusProps {
  room?: Room | null;
  connectionState?: ConnectionState | null;
  errorMessage?: string | null;
}

const logLiveKit = (message: string, ...args: any[]) => {
  console.log(`[LIVEKIT CONSOLE] ${message}`, ...args);
};

export function ConnectionStatus({
  room,
  connectionState: externalState,
  errorMessage: externalError,
}: ConnectionStatusProps) {
  const [internalState, setInternalState] = useState<ConnectionState | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use either the external state or the internal state from the room
  const connectionState = externalState || internalState;
  const errorMessage = externalError || error;

  useEffect(() => {
    if (!room) return;

    // Set initial state
    setInternalState(room.state);
    logLiveKit("Initial room state:", room.state);

    // If we have a room, we're at least initialized
    setIsInitialized(true);

    // Subscribe to state changes
    const handleStateChange = (state: ConnectionState) => {
      logLiveKit("LiveKit connection state changed:", state);
      console.log("LiveKit connection state changed:", state);
      setInternalState(state);

      if (state === ConnectionState.Connected) {
        setError(null);
        setReconnecting(false);
        setIsInitialized(true);
        logLiveKit("Room fully connected");
      } else if (state === ConnectionState.Reconnecting) {
        setReconnecting(true);
        logLiveKit("Room reconnecting");
      }
    };

    // Handle connection errors
    const handleError = (err: Error) => {
      logLiveKit("Room connection error:", err);
      console.error("Room connection error:", err);
      setError(err.message);
    };

    // Handle disconnection
    const handleDisconnect = () => {
      logLiveKit("Room disconnected");
      console.log("Room disconnected");
      setInternalState(ConnectionState.Disconnected);
      setReconnecting(false);
    };

    room.on(RoomEvent.ConnectionStateChanged, handleStateChange);
    room.on(RoomEvent.Disconnected, handleDisconnect);
    // Use a generic error event instead of MediaConnectionError
    room.on(RoomEvent.SignalConnected, () => {
      logLiveKit("Signal connected");
      console.log("Signal connected");
      setIsInitialized(true);
    });

    return () => {
      logLiveKit("Removing room event listeners");
      room.off(RoomEvent.ConnectionStateChanged, handleStateChange);
      room.off(RoomEvent.Disconnected, handleDisconnect);
      // Remove the generic event listener
      room.off(RoomEvent.SignalConnected, () => {
        console.log("Signal connected");
      });
    };
  }, [room]);

  // If we have an external error message, display it
  if (errorMessage) {
    return <div className="text-xs text-red-500">Error: {errorMessage}</div>;
  }

  if (!room && !connectionState && !isInitialized) {
    return (
      <div className="text-xs text-yellow-500">
        Initializing voice connection...
      </div>
    );
  }

  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="flex items-center text-xs text-yellow-500">
        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
        Connecting to voice server...
      </div>
    );
  }

  if (connectionState === ConnectionState.Reconnecting || reconnecting) {
    return (
      <div className="flex items-center text-xs text-yellow-500">
        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
        Reconnecting to voice server...
      </div>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className="text-xs text-red-500">Disconnected from voice server</div>
    );
  }

  if (connectionState === ConnectionState.Connected || isInitialized) {
    return (
      <div className="text-xs text-green-500">Connected to voice server</div>
    );
  }

  return (
    <div className="text-xs text-gray-500">
      Voice server status: {connectionState}
    </div>
  );
}
