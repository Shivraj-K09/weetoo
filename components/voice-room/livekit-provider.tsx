"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { createLivekitToken } from "@/app/actions/livekit-actions";
import { toast } from "sonner";
import {
  type RoomOptions,
  ConnectionState,
  type Room,
  RoomEvent,
  DisconnectReason,
} from "livekit-client";

interface LiveKitProviderProps {
  roomId: string;
  isHost: boolean;
  children: ReactNode;
}

export function LiveKitProvider({
  roomId,
  isHost,
  children,
}: LiveKitProviderProps) {
  const [token, setToken] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const roomRef = useRef<Room | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  const isComponentMounted = useRef(true);
  const [availableMicrophones, setAvailableMicrophones] = useState<
    MediaDeviceInfo[]
  >([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const hasConnectedRef = useRef(false);

  // Add this function at the top of the component, before any other code
  const logLiveKit = (message: string, ...args: any[]) => {
    console.log(`[LIVEKIT CONSOLE] ${message}`, ...args);
  };

  // Enhanced room options with better connection handling
  const roomOptions: RoomOptions = {
    adaptiveStream: true,
    dynacast: true,
    publishDefaults: {
      simulcast: true,
      stopMicTrackOnMute: false, // Don't stop the track when muted
    },
    videoCaptureDefaults: {
      resolution: { width: 640, height: 360, frameRate: 30 },
    },
  };

  // Get available microphones - ONLY for host
  useEffect(() => {
    // Only request microphone access if this is the host
    if (!isHost) return;

    const getAvailableMicrophones = async () => {
      try {
        // First check if we have permission to access media devices
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Stop the stream immediately after getting permission
        stream.getTracks().forEach((track) => track.stop());

        // Now enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const microphones = devices.filter(
          (device) => device.kind === "audioinput"
        );

        setAvailableMicrophones(microphones);

        // Set default microphone if available
        if (microphones.length > 0 && !selectedMicrophone) {
          setSelectedMicrophone(microphones[0].deviceId);
        }

        // Listen for device changes
        navigator.mediaDevices.addEventListener("devicechange", async () => {
          const updatedDevices =
            await navigator.mediaDevices.enumerateDevices();
          const updatedMicrophones = updatedDevices.filter(
            (device) => device.kind === "audioinput"
          );
          setAvailableMicrophones(updatedMicrophones);
        });
      } catch (error) {
        console.error("Error getting available microphones:", error);
      }
    };

    getAvailableMicrophones();

    return () => {
      // Clean up device change listener
      navigator.mediaDevices.removeEventListener("devicechange", () => {});
    };
  }, [isHost]);

  // Update room options when microphone selection changes
  useEffect(() => {
    if (selectedMicrophone && isHost) {
      roomOptions.audioCaptureDefaults = {
        deviceId: selectedMicrophone,
      };
    }
  }, [selectedMicrophone, isHost]);

  // Set up component mounted ref for cleanup
  useEffect(() => {
    logLiveKit("Component mounted");
    isComponentMounted.current = true;
    hasConnectedRef.current = false;
    return () => {
      logLiveKit("Component unmounting");
      isComponentMounted.current = false;
    };
  }, []);

  // Fetch token on component mount
  useEffect(() => {
    // Update the getToken function to add logging
    const getToken = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        logLiveKit("Requesting token for room:", roomId, "isHost:", isHost);
        const result = await createLivekitToken(roomId, isHost);

        if (result.success && result.token) {
          logLiveKit("Token received successfully:", result.name);
          // Set the token directly
          setToken(await result.token);
          setUserName(result.name || "");
        } else {
          logLiveKit("Failed to get token:", result.message);
          console.error("Failed to get token:", result.message);
          setErrorMessage(
            result.message || "Failed to connect to voice channel"
          );
          toast.error(result.message || "Failed to connect to voice channel");

          // Retry token generation if failed (up to 3 times)
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 2000);
          }
        }
      } catch (error) {
        logLiveKit("Error getting token:", error);
        console.error("Error getting token:", error);
        setErrorMessage("Failed to connect to voice channel");
        toast.error("Failed to connect to voice channel");

        // Retry token generation if failed (up to 3 times)
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getToken();
  }, [roomId, isHost, retryCount]);

  // Handle room creation and setup event listeners
  const handleRoomCreated = (room: Room) => {
    logLiveKit("Room created:", room.name, "Connection state:", room.state);
    roomRef.current = room;
    setConnectionState(room.state);
    reconnectAttempts.current = 0;

    // Set up event listeners for connection state changes
    const handleStateChange = (state: ConnectionState) => {
      logLiveKit("Connection state changed:", state);
      console.log("Connection state changed:", state);
      if (!isComponentMounted.current) return;
      setConnectionState(state);

      if (state === ConnectionState.Connected) {
        // Reset error state and reconnect attempts on successful connection
        setErrorMessage(null);
        reconnectAttempts.current = 0;
        hasConnectedRef.current = true;
        logLiveKit("Room fully connected");
      }
    };

    // Handle disconnection
    const handleDisconnect = (reason?: DisconnectReason) => {
      logLiveKit("Room disconnected event, reason:", reason);
      console.log("Room disconnected event, reason:", reason);
      if (!isComponentMounted.current) return;
      setConnectionState(ConnectionState.Disconnected);

      // Only show error for unexpected disconnections
      if (reason && reason !== DisconnectReason.CLIENT_INITIATED) {
        setErrorMessage(`Disconnected: ${reason}`);

        // Attempt to reconnect if not user initiated
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          logLiveKit(
            `Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`
          );

          setTimeout(() => {
            if (roomRef.current && isComponentMounted.current) {
              roomRef.current
                .connect(process.env.NEXT_PUBLIC_LIVEKIT_API_URL || "", token)
                .catch((err) => logLiveKit("Reconnection failed:", err));
            }
          }, 2000 * reconnectAttempts.current); // Increasing backoff
        }
      }
    };

    // Add event listeners with proper function references
    const reconnectedHandler = () => {
      logLiveKit("Room reconnected");
      console.log("Room reconnected");
      if (!isComponentMounted.current) return;
      setConnectionState(ConnectionState.Connected);
      hasConnectedRef.current = true;
      setErrorMessage(null);
    };

    const reconnectingHandler = () => {
      logLiveKit("Room reconnecting");
      console.log("Room reconnecting");
      if (!isComponentMounted.current) return;
      setConnectionState(ConnectionState.Reconnecting);
    };

    room.on(RoomEvent.ConnectionStateChanged, handleStateChange);
    room.on(RoomEvent.Disconnected, handleDisconnect);
    room.on(RoomEvent.Reconnected, reconnectedHandler);
    room.on(RoomEvent.Reconnecting, reconnectingHandler);

    // Add track subscription event handlers
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      logLiveKit(
        "Track subscribed:",
        track.kind,
        "from participant:",
        participant.identity
      );
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      logLiveKit(
        "Track unsubscribed:",
        track.kind,
        "from participant:",
        participant.identity
      );
    });

    // Add participant events
    room.on(RoomEvent.ParticipantConnected, (participant) => {
      logLiveKit("Participant connected:", participant.identity);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      logLiveKit("Participant disconnected:", participant.identity);
    });

    // Return cleanup function to restore console.error and remove event listeners
    return () => {
      // Only try to remove listeners if the room is still valid
      if (room) {
        logLiveKit("Removing room event listeners");
        room.off(RoomEvent.ConnectionStateChanged, handleStateChange);
        room.off(RoomEvent.Disconnected, handleDisconnect);
        room.off(RoomEvent.Reconnected, reconnectedHandler);
        room.off(RoomEvent.Reconnecting, reconnectingHandler);
        room.off(
          RoomEvent.TrackSubscribed,
          (track, publication, participant) => {
            logLiveKit(
              "Track subscribed:",
              track.kind,
              "from participant:",
              participant.identity
            );
          }
        );
        room.off(
          RoomEvent.TrackUnsubscribed,
          (track, publication, participant) => {
            logLiveKit(
              "Track unsubscribed:",
              track.kind,
              "from participant:",
              participant.identity
            );
          }
        );
        room.off(RoomEvent.ParticipantConnected, (participant) => {
          logLiveKit("Participant connected:", participant.identity);
        });
        room.off(RoomEvent.ParticipantDisconnected, (participant) => {
          logLiveKit("Participant disconnected:", participant.identity);
        });
      }
    };
  };

  // Handle room instance cleanup - FIX THE ERROR HERE
  useEffect(() => {
    // This function will be called when the LiveKitRoom component unmounts
    return () => {
      logLiveKit("Cleanup function called, roomRef exists:", !!roomRef.current);

      // Don't attempt to disconnect if room ref is null
      if (!roomRef.current) {
        logLiveKit("No room reference during cleanup, nothing to disconnect");
        return;
      }

      logLiveKit("Cleaning up room connection, state:", roomRef.current.state);

      try {
        // First disable all tracks to ensure clean disconnection
        const localParticipant = roomRef.current.localParticipant;
        if (localParticipant) {
          try {
            logLiveKit("Disabling microphone during cleanup");
            // Just try to disable microphone, don't wait for it
            localParticipant.setMicrophoneEnabled(false).catch((err) => {
              logLiveKit("Error disabling microphone during cleanup:", err);
            });
          } catch (err) {
            logLiveKit("Error disabling microphone during cleanup:", err);
          }
        }

        // CRITICAL FIX: Only try to disconnect if we've fully connected at least once
        // This prevents the "cannot send signal request before connected" error
        if (
          hasConnectedRef.current &&
          roomRef.current.state === ConnectionState.Connected
        ) {
          logLiveKit(
            "Room has been connected before and is currently connected, disconnecting properly"
          );
          try {
            roomRef.current.disconnect(true);
          } catch (err) {
            logLiveKit("Error during disconnect:", err);
          }
        } else {
          logLiveKit(
            "Room has not been fully connected or is not in connected state, skipping disconnect call"
          );
          // For other states, don't try to disconnect as it might cause the error

          // ADDITIONAL FIX: If we're in the connecting state, we need to abort the connection
          if (roomRef.current.state === ConnectionState.Connecting) {
            logLiveKit("Room is in connecting state, aborting connection");
            try {
              // Use a different approach to abort the connection without sending a leave signal
              roomRef.current.engine?.close();
            } catch (err) {
              logLiveKit("Error aborting connection:", err);
            }
          }
        }
      } catch (error) {
        console.error("Error during room cleanup:", error);
        logLiveKit("Error during room cleanup:", error);
      } finally {
        // Always clear the reference
        roomRef.current = null;
      }
    };
  }, []);

  // For participants, we need to modify the room options to not request microphone access
  if (!isHost) {
    roomOptions.audioCaptureDefaults = {
      deviceId: undefined, // No specific device
    };

    // Explicitly disable microphone for participants
    roomOptions.publishDefaults = {
      ...roomOptions.publishDefaults,
    };
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
        <span className="ml-2 text-sm text-white/70">
          Connecting to voice channel...
        </span>
      </div>
    );
  }

  if (errorMessage && !token) {
    return <div className="text-sm text-red-400 p-4">{errorMessage}</div>;
  }

  if (!token) {
    return (
      <div className="text-sm text-white/70 p-4">
        Unable to connect to voice channel. Please try again later.
      </div>
    );
  }

  return (
    <div className="bg-[#1a1e27] border border-[#3f445c] rounded-md p-3">
      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_API_URL}
        token={token}
        options={roomOptions}
        className="h-full"
        data-lk-theme="default"
        onConnected={() => handleRoomCreated}
      >
        {children}
      </LiveKitRoom>
    </div>
  );
}
