"use client";

import { useMemo } from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { useRoomContext as useRoom } from "@livekit/components-react";
import { AudioControls } from "./audio-control";
import { LiveKitProvider } from "./livekit-provider";
import { toast } from "sonner";
import {
  ConnectionState,
  type LocalTrackPublication,
  RoomEvent,
  Track,
  type TrackPublication,
} from "livekit-client";
import { WaveVisualizer } from "./wave-visualizer";

interface VoiceChannelProps {
  roomId: string;
  isOwner: boolean;
  ownerId: string;
}

// Inner component that has access to LiveKit room context
function VoiceChannelInner({
  isOwner,
  ownerId,
}: {
  isOwner: boolean;
  ownerId: string;
}) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioTrack, setAudioTrack] = useState<LocalTrackPublication | null>(
    null
  );
  const [isRoomConnected, setIsRoomConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 3;
  const broadcastingRef = useRef(false);
  const hasInitialized = useRef(false);
  const audioElementsRef = useRef<HTMLDivElement>(null);

  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const room = useRoom();

  // Add this function at the top of the VoiceChannelInner component
  const logVoice = (message: string, ...args: any[]) => {
    console.log(`[LIVEKIT CONSOLE] ${message}`, ...args);
  };

  // Check if any remote participant is broadcasting
  const isAnyParticipantBroadcasting = useCallback(() => {
    logVoice(
      "Checking if any participant is broadcasting, count:",
      remoteParticipants.length
    );

    for (const participant of remoteParticipants) {
      // Check if this participant has any audio tracks
      const audioPublications = Array.from(
        participant.trackPublications.values()
      ).filter((publication) => publication.kind === Track.Kind.Audio);

      logVoice(
        "Participant:",
        participant.identity,
        "Audio tracks:",
        audioPublications.length
      );

      const hasAudioTrack = audioPublications.some(
        (publication) => publication.isSubscribed
      );

      if (hasAudioTrack) {
        logVoice("Found broadcasting participant:", participant.identity);
        return true;
      }
    }
    return false;
  }, [remoteParticipants]);

  // Update broadcasting state based on remote participants
  useEffect(() => {
    if (!isOwner) {
      const hostIsBroadcasting = isAnyParticipantBroadcasting();
      logVoice(
        "Checking if host is broadcasting:",
        hostIsBroadcasting,
        "Remote participants:",
        remoteParticipants.length
      );

      // Log details about each remote participant
      remoteParticipants.forEach((participant) => {
        logVoice("Remote participant:", participant.identity);

        // Log all tracks for this participant
        participant.trackPublications.forEach((publication) => {
          logVoice(
            "Track:",
            publication.trackSid,
            "Kind:",
            publication.kind,
            "Subscribed:",
            publication.isSubscribed
          );
        });
      });

      if (hostIsBroadcasting !== isBroadcasting) {
        setIsBroadcasting(hostIsBroadcasting);

        // If host is broadcasting, we're definitely connected
        if (hostIsBroadcasting) {
          hasInitialized.current = true;
        }
      }
    }
  }, [
    remoteParticipants,
    isOwner,
    isAnyParticipantBroadcasting,
    isBroadcasting,
  ]);

  // Explicitly handle track subscriptions for participants
  useEffect(() => {
    if (!room || isOwner) return;

    const handleTrackSubscribed = (
      track: Track,
      publication: TrackPublication,
      participant: any
    ) => {
      logVoice(
        "Track subscribed:",
        track.kind,
        "from participant:",
        participant.identity
      );

      if (track.kind === Track.Kind.Audio) {
        // Create an audio element for this track if it doesn't exist
        if (!audioElementsRef.current) return;

        // First, make sure we're not creating duplicate elements
        const existingElements = audioElementsRef.current.querySelectorAll(
          `audio[data-track-sid="${publication.trackSid}"]`
        );
        if (existingElements.length > 0) {
          logVoice(
            "Audio element already exists for track:",
            publication.trackSid
          );
          return;
        }

        // Create a new audio element
        const audioElement = document.createElement("audio");
        audioElement.autoplay = true;
        audioElement.setAttribute("data-track-sid", publication.trackSid);

        // Important: Set volume to 1 (full volume)
        audioElement.volume = 1.0;

        // Attach the track to the audio element
        track.attach(audioElement);

        // Add the audio element to the DOM
        audioElementsRef.current.appendChild(audioElement);

        logVoice(
          "Created and attached audio element for track:",
          publication.trackSid
        );

        // Force play the audio (to handle autoplay restrictions)
        audioElement.play().catch((err) => {
          logVoice("Error playing audio:", err);
        });
      }
    };

    const handleTrackUnsubscribed = (
      track: Track,
      publication: TrackPublication,
      participant: any
    ) => {
      logVoice(
        "Track unsubscribed:",
        track.kind,
        "from participant:",
        participant.identity
      );

      if (track.kind === Track.Kind.Audio && audioElementsRef.current) {
        // Find and remove the audio element for this track
        const audioElement = audioElementsRef.current.querySelector(
          `audio[data-track-sid="${publication.trackSid}"]`
        );
        if (audioElement) {
          track.detach(audioElement as HTMLAudioElement);
          audioElementsRef.current.removeChild(audioElement);
          logVoice("Removed audio element for track:", publication.trackSid);
        }
      }
    };

    // Add event listeners
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    // Check for any existing subscribed tracks
    remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.isSubscribed && publication.track) {
          handleTrackSubscribed(publication.track, publication, participant);
        }
      });
    });

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    };
  }, [room, isOwner, remoteParticipants]);

  // Monitor room connection state
  useEffect(() => {
    if (!room) return;

    const handleConnectionStateChanged = (state: ConnectionState) => {
      console.log("Room connection state changed:", state);
      setIsRoomConnected(state === ConnectionState.Connected);

      if (state === ConnectionState.Connected) {
        setConnectionError(null);
        connectionAttempts.current = 0;
        hasInitialized.current = true;
      }
    };

    // Set initial state
    setIsRoomConnected(room.state === ConnectionState.Connected);
    if (room.state === ConnectionState.Connected) {
      hasInitialized.current = true;
    }

    // Subscribe to connection state changes
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);

    // Listen for track publications from other participants
    const handleTrackPublished = (
      publication: TrackPublication,
      participant: any
    ) => {
      if (!isOwner && publication.kind === Track.Kind.Audio) {
        console.log("Audio track published by:", participant.identity);
        setIsBroadcasting(true);
        hasInitialized.current = true;
      }
    };

    // Listen for track unpublications from other participants
    const handleTrackUnpublished = (
      publication: TrackPublication,
      participant: any
    ) => {
      if (!isOwner && publication.kind === Track.Kind.Audio) {
        console.log("Audio track unpublished by:", participant.identity);
        // Check if there are any other audio tracks still active
        if (!isAnyParticipantBroadcasting()) {
          setIsBroadcasting(false);
        }
      }
    };

    room.on(RoomEvent.TrackPublished, handleTrackPublished);
    room.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);

    return () => {
      // Use function references for event handlers to ensure proper cleanup
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChanged);
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
      room.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
    };
  }, [room, isOwner, isAnyParticipantBroadcasting]);

  // Check microphone permission
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop all tracks to release the microphone
      stream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      return false;
    }
  };

  // Start broadcasting with retry logic
  const startBroadcasting = async () => {
    if (!localParticipant) {
      logVoice("Cannot start broadcasting. Room not connected.");
      toast.error("Cannot start broadcasting. Room not connected.");
      return;
    }

    // Check if the room is actually connected
    if (!room || room.state !== ConnectionState.Connected) {
      logVoice(
        "Voice room is not fully connected yet. Room state:",
        room?.state
      );
      toast.error(
        "Voice room is not fully connected yet. Please wait a moment and try again."
      );
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionError(null);
      connectionAttempts.current = 0;

      // Make sure we have microphone permissions first
      logVoice("Checking microphone permissions");
      const hasMicPermission = await checkMicrophonePermission();
      if (!hasMicPermission) {
        logVoice("Microphone permission denied");
        toast.error(
          "Microphone permission denied. Please allow microphone access."
        );
        setIsConnecting(false);
        return;
      }

      // Make sure room is connected
      if (!isRoomConnected) {
        logVoice("Voice room is not connected. Room state:", room?.state);
        toast.error(
          "Voice room is not connected. Please wait or refresh the page."
        );
        setIsConnecting(false);
        return;
      }

      // Attempt to publish with retry logic
      const attemptPublish =
        async (): Promise<LocalTrackPublication | null> => {
          try {
            connectionAttempts.current += 1;
            logVoice(
              `Publishing attempt ${connectionAttempts.current}/${maxConnectionAttempts}`
            );

            // Create and publish audio track
            logVoice("Enabling microphone");
            const track = await localParticipant.setMicrophoneEnabled(true);

            logVoice("Microphone enabled, track:", track);
            return track || null;
          } catch (error) {
            logVoice(
              `Error publishing (attempt ${connectionAttempts.current}):`,
              error
            );
            console.error(
              `Error publishing (attempt ${connectionAttempts.current}):`,
              error
            );

            if (connectionAttempts.current < maxConnectionAttempts) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 2000));
              return attemptPublish();
            }

            throw error;
          }
        };

      // Try to publish with retries
      const track = await attemptPublish();

      if (track) {
        logVoice("Audio track published successfully:", track);
        setAudioTrack(track);
        setIsBroadcasting(true);
        broadcastingRef.current = true;
        hasInitialized.current = true;
        toast.success("Broadcasting started");

        // Check if the track is actually active
        logVoice(
          "Track status - enabled:",
          track.isEnabled,
          "muted:",
          track.isMuted
        );

        // Get the MediaStreamTrack
        const mediaTrack = track.track;
        if (mediaTrack) {
          if (mediaTrack instanceof MediaStreamTrack) {
            logVoice(
              "MediaStreamTrack - readyState:",
              mediaTrack.readyState,
              "muted:",
              mediaTrack.muted
            );
          } else {
            logVoice("MediaStreamTrack is not an instance of MediaStreamTrack");
          }
        }
      } else {
        throw new Error("Failed to create audio track");
      }
    } catch (error) {
      logVoice("Error starting broadcast:", error);
      console.error("Error starting broadcast:", error);
      setConnectionError("Failed to start broadcasting. Please try again.");
      toast.error(
        "Failed to start broadcasting. Please check your microphone and try again."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Stop broadcasting
  const stopBroadcasting = async () => {
    if (!localParticipant || !isOwner) return;

    try {
      logVoice("Stopping broadcasting");
      await localParticipant.setMicrophoneEnabled(false);
      setAudioTrack(null);
      setIsBroadcasting(false);
      broadcastingRef.current = false;
      toast.success("Broadcasting stopped");
      logVoice("Broadcasting stopped successfully");
    } catch (error) {
      logVoice("Error stopping broadcast:", error);
      console.error("Error stopping broadcast:", error);
      toast.error("Failed to stop broadcasting");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Only attempt to stop broadcasting if we're actually broadcasting
      if (broadcastingRef.current && localParticipant) {
        try {
          console.log("Stopping broadcasting on unmount");
          localParticipant
            .setMicrophoneEnabled(false)
            .catch((err) => console.error("Error disabling microphone:", err));
        } catch (error) {
          console.error("Error in cleanup:", error);
        }
      }
    };
  }, [localParticipant]);

  // Get the actual Track object from the LocalTrackPublication
  const actualAudioTrack = audioTrack?.track || null;

  // Get the first remote audio track for participants
  const firstRemoteAudioTrack = useMemo(() => {
    if (isOwner) return null;

    for (const participant of remoteParticipants) {
      const audioPublications = Array.from(
        participant.trackPublications.values()
      ).filter(
        (publication) =>
          publication.kind === Track.Kind.Audio && publication.isSubscribed
      );

      if (audioPublications.length > 0 && audioPublications[0].track) {
        return audioPublications[0].track;
      }
    }

    return null;
  }, [isOwner, remoteParticipants]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-white/70">
            {isBroadcasting ? (
              <div className="flex items-center lk-status-indicator lk-status-indicator-live">
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                {isOwner ? "Live Broadcasting" : "Host is broadcasting"}
              </div>
            ) : isConnecting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Connecting microphone...</span>
              </div>
            ) : connectionError ? (
              <span className="text-red-400">{connectionError}</span>
            ) : isOwner ? (
              <span className="lk-status-indicator lk-status-indicator-offline">
                {isRoomConnected
                  ? "Click Start Broadcasting to speak"
                  : "Connecting to voice server..."}
              </span>
            ) : (
              <span className="lk-status-indicator lk-status-indicator-offline">
                {hasInitialized.current
                  ? "Waiting for host to start broadcasting"
                  : "Connecting to voice server..."}
              </span>
            )}
          </div>

          {/* Audio Visualizer - Now positioned to the right of the status text */}
          {isBroadcasting && (
            <div className="flex items-center">
              <WaveVisualizer
                track={isOwner ? actualAudioTrack : firstRemoteAudioTrack}
                width={900}
                height={40}
                color="#4ade80"
                backgroundColor="#1a1e27"
                showSimulated={!actualAudioTrack && !firstRemoteAudioTrack}
              />
            </div>
          )}
        </div>

        <AudioControls
          isHost={isOwner}
          isBroadcasting={isBroadcasting}
          onStartBroadcast={startBroadcasting}
          onStopBroadcast={stopBroadcasting}
          isConnecting={isConnecting}
          isRoomConnected={isRoomConnected}
        />
      </div>

      {/* Display connected participants count */}
      <div className="text-xs text-white/50 mt-1">
        {remoteParticipants.length} listener
        {remoteParticipants.length !== 1 ? "s" : ""} connected
      </div>

      {/* Hidden div to hold audio elements */}
      <div ref={audioElementsRef} className="hidden"></div>
    </div>
  );
}

// Main component that wraps everything with the LiveKit provider
export function VoiceChannel({ roomId, isOwner, ownerId }: VoiceChannelProps) {
  const [retryKey, setRetryKey] = useState(0);

  // Add a retry mechanism for the entire component
  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  return (
    <div className="bg-[#1a1e27] border border-[#3f445c] rounded-md p-3">
      <LiveKitProvider
        key={`livekit-provider-${retryKey}`}
        roomId={roomId}
        isHost={isOwner}
      >
        <VoiceChannelInner isOwner={isOwner} ownerId={ownerId} />
      </LiveKitProvider>

      {retryKey > 0 && (
        <div className="text-xs text-gray-400 mt-2 text-center">
          Connection retried {retryKey} time{retryKey !== 1 ? "s" : ""}
        </div>
      )}

      {retryKey > 2 && (
        <div className="text-xs text-red-400 mt-1 text-center">
          Having trouble connecting? Try refreshing the page.
        </div>
      )}
    </div>
  );
}
