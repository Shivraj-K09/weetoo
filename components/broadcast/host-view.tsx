"use client";

import { useState, useEffect, useRef } from "react";
import {
  useLocalParticipant,
  useConnectionState,
  useRoomContext,
  useParticipants,
} from "@livekit/components-react";
import {
  RoomEvent,
  ConnectionState,
  type LocalTrackPublication,
  createLocalTracks,
  Track,
  type DisconnectReason,
  type LocalTrack,
  ParticipantEvent,
} from "livekit-client";
import { Mic, MicOff, Settings, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { deleteRoom } from "@/app/actions/delete-room";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { updateRoomParticipantCount } from "@/app/actions/update-room-participant-count";

interface MediaDevice {
  deviceId: string;
  label: string;
}

export function HostView({
  roomId,
  onBroadcastChange,
}: {
  roomId: string;
  onBroadcastChange?: (broadcasting: boolean) => void;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioTrack, setAudioTrack] = useState<LocalTrackPublication | null>(
    null
  );
  const [audioLevel, setAudioLevel] = useState(0);
  const [isClosingRoom, setIsClosingRoom] = useState(false);
  const [participantCount, setParticipantCount] = useState(1); // Start with 1 (the host)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reconnectingRef = useRef<boolean>(false);
  const publishAttemptRef = useRef<number>(0);
  const localAudioTrackRef = useRef<LocalTrack | null>(null); // Store the local audio track reference
  const lastParticipantCountRef = useRef<number>(1); // Track the last participant count for database updates

  // Device selection state
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Audio visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Track participants and update count
  useEffect(() => {
    if (!room) return;

    // Update participant count whenever it changes
    const handleParticipantConnected = () => {
      const count = room.numParticipants + 1; // +1 for local participant
      setParticipantCount(count);

      // Only update the database if the count has changed
      if (count !== lastParticipantCountRef.current) {
        lastParticipantCountRef.current = count;
        updateRoomParticipantCount(roomId, count).catch((err: any) => {
          console.error("Failed to update participant count:", err);
        });
      }
    };

    const handleParticipantDisconnected = () => {
      const count = room.numParticipants + 1; // +1 for local participant
      setParticipantCount(count);

      // Only update the database if the count has changed
      if (count !== lastParticipantCountRef.current) {
        lastParticipantCountRef.current = count;
        updateRoomParticipantCount(roomId, count).catch((err: any) => {
          console.error("Failed to update participant count:", err);
        });
      }
    };

    // Set initial count
    setParticipantCount(room.numParticipants + 1);
    lastParticipantCountRef.current = room.numParticipants + 1;

    // Update database with initial count
    updateRoomParticipantCount(roomId, room.numParticipants + 1).catch(
      (err: any) => {
        console.error("Failed to update initial participant count:", err);
      }
    );

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(
        RoomEvent.ParticipantDisconnected,
        handleParticipantDisconnected
      );
    };
  }, [room, roomId]);

  // Also update participant count based on the participants array from the hook
  useEffect(() => {
    const count = participants.length;
    setParticipantCount(count);

    // Only update the database if the count has changed
    if (count !== lastParticipantCountRef.current) {
      lastParticipantCountRef.current = count;
      updateRoomParticipantCount(roomId, count).catch((err: any) => {
        console.error("Failed to update participant count from hook:", err);
      });
    }
  }, [participants, roomId]);

  // Load available media devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Request permission to access devices
        await navigator.mediaDevices
          .getUserMedia({ audio: true })
          .catch((err) => {
            console.warn("Could not get initial media permissions:", err);
          });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const audioInputs = devices
          .filter((device) => device.kind === "audioinput")
          .map((device) => ({
            deviceId: device.deviceId,
            label:
              device.label || `Microphone ${device.deviceId.slice(0, 5)}...`,
          }));

        setAudioDevices(audioInputs);

        // Set defaults if available
        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error loading media devices:", error);
      }
    };

    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", loadDevices);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", loadDevices);
    };
  }, []);

  // Set up audio visualization
  useEffect(() => {
    if (!audioTrack?.track || !canvasRef.current) return;

    const setupAudioAnalyser = () => {
      try {
        // Clean up any existing audio context
        if (audioContextRef.current) {
          try {
            if (audioContextRef.current.state !== "closed") {
              audioContextRef.current.close();
            }
          } catch (e) {
            console.log("Error closing audio context:", e);
          }
        }

        // Create audio context
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Make sure track exists before accessing mediaStreamTrack
        if (!audioTrack?.track?.mediaStreamTrack) {
          console.error("No media stream track available");
          return;
        }

        // Get the audio track's media stream track
        const mediaStreamTrack = audioTrack.track.mediaStreamTrack;

        // Create a media stream with just this track
        const mediaStream = new MediaStream([mediaStreamTrack]);

        // Create a source node from the media stream
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);

        // Create an analyser node
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;

        // Connect the source to the analyser
        sourceNode.connect(analyserNode);

        // Save the analyser for later use
        audioAnalyserRef.current = analyserNode;

        // Start monitoring audio levels
        startAudioLevelMonitoring();
      } catch (error) {
        console.error("Error setting up audio analyser:", error);
      }
    };

    setupAudioAnalyser();

    return () => {
      stopAudioLevelMonitoring();
    };
  }, [audioTrack]);

  const stopAudioLevelMonitoring = () => {
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!audioAnalyserRef.current) return;

    const analyser = audioAnalyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioLevelIntervalRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;

      // Normalize to 0-100
      const level = Math.min(100, Math.max(0, avg * 1.5));
      setAudioLevel(level);
    }, 100);
  };

  // Monitor connection state and handle reconnection
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = (reason?: DisconnectReason) => {
      console.log("Room disconnected, reason:", reason);

      // If we were broadcasting, we need to reset the state
      if (isBroadcasting) {
        setIsBroadcasting(false);
        if (onBroadcastChange) onBroadcastChange(false);
      }

      // Mark that we're attempting to reconnect
      reconnectingRef.current = true;
    };

    const handleReconnected = () => {
      console.log("Room reconnected");
      reconnectingRef.current = false;

      // If we were broadcasting before, try to republish tracks
      if (
        isBroadcasting &&
        isAudioEnabled &&
        audioTrack?.track &&
        localParticipant
      ) {
        console.log("Attempting to republish audio track after reconnection");
        localParticipant
          .publishTrack(audioTrack.track, {
            name: "microphone",
            source: Track.Source.Microphone,
          })
          .then((publication) => {
            console.log(
              "Successfully republished audio track after reconnection"
            );
            setAudioTrack(publication);
            if (onBroadcastChange) onBroadcastChange(true);
          })
          .catch((error) => {
            console.error(
              "Failed to republish audio track after reconnection:",
              error
            );
          });
      }
    };

    const handleConnected = () => {
      console.log("Room connected");
      reconnectingRef.current = false;
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Connected, handleConnected);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.Connected, handleConnected);
    };
  }, [
    room,
    isBroadcasting,
    isAudioEnabled,
    audioTrack,
    localParticipant,
    onBroadcastChange,
  ]);

  // Clean up tracks on unmount
  useEffect(() => {
    return () => {
      // Clean up local tracks when component unmounts
      if (audioTrack?.track) {
        audioTrack.track.stop();
      }

      // Clean up audio monitoring
      stopAudioLevelMonitoring();

      // Clean up audio context
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
          }
        } catch (e) {
          console.log("Error closing audio context during cleanup:", e);
        }
      }
    };
  }, []);

  // Add debug logging for track publication
  useEffect(() => {
    if (!localParticipant) return;

    const handleLocalTrackPublished = (publication: LocalTrackPublication) => {
      console.log("Local track published:", {
        sid: publication.trackSid,
        kind: publication.kind,
        source: publication.source,
        name: publication.trackName,
      });
      setDebugInfo(
        `Track published: ${publication.trackSid} (${publication.kind})`
      );
    };

    const handleLocalTrackUnpublished = (
      publication: LocalTrackPublication
    ) => {
      console.log("Local track unpublished:", publication.trackSid);
      setDebugInfo(`Track unpublished: ${publication.trackSid}`);
    };

    localParticipant.on(
      ParticipantEvent.LocalTrackPublished,
      handleLocalTrackPublished
    );
    localParticipant.on(
      ParticipantEvent.LocalTrackUnpublished,
      handleLocalTrackUnpublished
    );

    return () => {
      localParticipant.off(
        ParticipantEvent.LocalTrackPublished,
        handleLocalTrackPublished
      );
      localParticipant.off(
        ParticipantEvent.LocalTrackUnpublished,
        handleLocalTrackUnpublished
      );
    };
  }, [localParticipant]);

  const toggleBroadcast = async () => {
    if (!localParticipant) return;

    if (isBroadcasting) {
      // Stop broadcasting but keep audio track active
      if (audioTrack && audioTrack.track) {
        try {
          await localParticipant.unpublishTrack(audioTrack.track);
          console.log("Audio track unpublished successfully");

          // Keep the audio track object but mark it as unpublished
          // Store the local track in the ref for later reuse
          localAudioTrackRef.current = audioTrack.track;
          setAudioTrack({ track: audioTrack.track } as LocalTrackPublication);
        } catch (error) {
          console.error("Error unpublishing audio track:", error);
        }
      }

      setIsBroadcasting(false);
      if (onBroadcastChange) onBroadcastChange(false);
    } else {
      // Start broadcasting with current settings

      // Ensure audio is enabled before broadcasting
      if (!isAudioEnabled) {
        console.log("Enabling audio before broadcasting");
        await toggleAudioHandler(true);
      }

      // Now publish the audio track if it exists
      if (audioTrack?.track || localAudioTrackRef.current) {
        try {
          console.log(
            "Publishing audio track for broadcast with consistent naming"
          );

          // Use the stored track if available, otherwise use the current track
          const trackToPublish =
            localAudioTrackRef.current || audioTrack?.track;

          if (!trackToPublish) {
            console.error("No audio track available to publish");
            setDebugInfo("No audio track available to publish");
            return;
          }

          // Ensure the track is not already published
          try {
            await localParticipant.unpublishTrack(trackToPublish);
            console.log("Unpublished existing track before republishing");
          } catch (e) {
            // Ignore errors if the track wasn't published
          }

          // Always use the same source and name for consistency
          const publication = await localParticipant.publishTrack(
            trackToPublish,
            {
              name: "microphone",
              source: Track.Source.Microphone,
            }
          );

          console.log("Audio track published successfully:", publication);
          setAudioTrack(publication);
          setIsBroadcasting(true);
          setDebugInfo(`Track published with ID: ${publication.trackSid}`);

          // Log additional details to help with debugging
          console.log("Published track details:", {
            sid: publication.trackSid,
            kind: publication.kind,
            source: publication.source,
            name: publication.trackName,
          });
        } catch (error) {
          console.error("Error publishing audio track:", error);
          setDebugInfo(
            `Error publishing: ${error instanceof Error ? error.message : String(error)}`
          );
          return;
        }
      } else {
        console.error("No audio track available to publish");
        setDebugInfo("No audio track available to publish");
        return;
      }

      setIsBroadcasting(true);
      if (onBroadcastChange) onBroadcastChange(true);
    }
  };

  const toggleAudioHandler = async (forceEnable?: boolean) => {
    if (!localParticipant) return;

    try {
      const currentAudioTrack = audioTrack;

      // If we're turning off audio
      if (isAudioEnabled && !forceEnable) {
        console.log("Unpublishing audio track");

        if (isBroadcasting && currentAudioTrack?.track) {
          try {
            await localParticipant.unpublishTrack(currentAudioTrack.track);
            console.log("Audio track unpublished successfully");
          } catch (error) {
            console.error("Error unpublishing audio track:", error);
          }
        }

        // Stop audio visualization
        stopAudioLevelMonitoring();

        // Stop the track with safety check
        if (currentAudioTrack?.track) {
          try {
            currentAudioTrack.track.stop();
            console.log("Audio track stopped successfully");
          } catch (error) {
            console.error("Error stopping audio track:", error);
          }
        }

        // Clear the local audio track reference
        localAudioTrackRef.current = null;
        setAudioTrack(null);
        setIsAudioEnabled(false);
      } else {
        // If we're turning on audio
        console.log("Creating and publishing audio track");

        // Stop any existing tracks first
        if (currentAudioTrack && currentAudioTrack.track) {
          currentAudioTrack.track.stop();
          if (isBroadcasting) {
            try {
              await localParticipant.unpublishTrack(currentAudioTrack.track);
              console.log("Previous audio track unpublished successfully");
            } catch (error) {
              console.error("Error unpublishing previous audio track:", error);
            }
          }
          setAudioTrack(null);
        }

        // Create a new audio track with the selected device
        try {
          const tracks = await createLocalTracks({
            audio: selectedAudioDevice
              ? {
                  deviceId: selectedAudioDevice,
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                }
              : true,
          });

          const audioTrackResult = tracks.find(
            (track) => track.kind === "audio"
          );
          if (audioTrackResult) {
            console.log("Audio track created successfully");

            // Store the track in the ref for later reuse
            localAudioTrackRef.current = audioTrackResult;

            // Create a track publication-like object for consistency
            setAudioTrack({ track: audioTrackResult } as LocalTrackPublication);
            setIsAudioEnabled(true);

            // Only publish if we're broadcasting
            if (isBroadcasting) {
              try {
                const publication = await localParticipant.publishTrack(
                  audioTrackResult,
                  {
                    name: "microphone",
                    source: Track.Source.Microphone,
                  }
                );
                console.log("Audio track published successfully:", publication);
                setAudioTrack(publication);
              } catch (error) {
                console.error("Error publishing audio track:", error);
              }
            }
          } else {
            console.error("No audio track was created");
          }
        } catch (error) {
          console.error("Error creating audio track:", error);
        }
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  // Wrapper function for onClick event
  const toggleAudio = () => {
    toggleAudioHandler();
  };

  // Handle device changes
  const changeAudioDevice = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);

    // If audio is already enabled, switch to the new device
    if (isAudioEnabled) {
      // Temporarily disable audio
      if (audioTrack && audioTrack.track && localParticipant) {
        if (isBroadcasting) {
          await localParticipant.unpublishTrack(audioTrack.track);
        }
        setAudioTrack(null);
      }

      // Re-enable with new device
      await toggleAudioHandler(true);
    }
  };

  // Force republish track - new function to help troubleshoot
  const forceRepublishTrack = async () => {
    if (
      !localParticipant ||
      (!audioTrack?.track && !localAudioTrackRef.current)
    ) {
      setDebugInfo("Cannot republish: No participant or track");
      return;
    }

    try {
      // Unpublish current track if it exists
      const trackToUnpublish = audioTrack?.track || localAudioTrackRef.current;
      if (trackToUnpublish) {
        try {
          await localParticipant.unpublishTrack(trackToUnpublish);
          console.log("Unpublished track for republishing");
        } catch (e) {
          console.log("Track wasn't published, continuing");
        }
      }

      // Create a new track to ensure fresh connection
      const tracks = await createLocalTracks({
        audio: selectedAudioDevice
          ? {
              deviceId: selectedAudioDevice,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : true,
      });

      const newAudioTrack = tracks.find(
        (track) => track.kind === "audio"
      ) as LocalTrack;

      if (!newAudioTrack) {
        setDebugInfo("Failed to create new audio track");
        return;
      }

      // Stop old track if it exists
      if (trackToUnpublish) {
        trackToUnpublish.stop();
      }

      // Store the new track in the ref
      localAudioTrackRef.current = newAudioTrack;

      // Publish new track with unique name
      const uniqueId = Date.now();
      const publication = await localParticipant.publishTrack(newAudioTrack, {
        name: `microphone-${uniqueId}`,
        source: Track.Source.Microphone,
      });

      setAudioTrack(publication);
      setIsAudioEnabled(true);
      setIsBroadcasting(true);
      if (onBroadcastChange) onBroadcastChange(true);
      setDebugInfo(`Republished track with ID: ${publication.trackSid}`);
    } catch (error) {
      console.error("Error republishing track:", error);
      setDebugInfo(
        `Republish error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Handle closing the room
  const handleCloseRoom = async () => {
    if (!room || !roomId) return;

    try {
      setIsClosingRoom(true);

      // First, stop broadcasting if active
      if (isBroadcasting && audioTrack?.track) {
        try {
          await localParticipant?.unpublishTrack(audioTrack.track);
          setIsBroadcasting(false);
          if (onBroadcastChange) onBroadcastChange(false);
        } catch (error) {
          console.error("Error stopping broadcast:", error);
        }
      }

      // Disconnect from the room
      room.disconnect();

      // Delete the room from the database
      const result = await deleteRoom(roomId);

      if (result.success) {
        toast.success("Room closed successfully");

        // Close the window after a short delay
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        toast.error(`Failed to close room: ${result.error || "Unknown error"}`);
        setIsClosingRoom(false);
      }
    } catch (error) {
      console.error("Error closing room:", error);
      toast.error("Failed to close room");
      setIsClosingRoom(false);
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  // Check if connected using the correct ConnectionState enum
  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Main audio visualization container */}
      <div className="w-[400px] bg-[#111827] rounded-lg overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center">
          {/* Microphone icon with radio waves */}
          <div className="relative mb-6">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#3b82f6]"
            >
              <path
                d="M32 40C38.6274 40 44 34.6274 44 28V16C44 9.37258 38.6274 4 32 4C25.3726 4 20 9.37258 20 16V28C20 34.6274 25.3726 40 32 40Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 40V52"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 28H48"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 52H44"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {isAudioEnabled && (
                <>
                  <path
                    d="M48 20C50.7614 20 53 17.7614 53 15C53 12.2386 50.7614 10 48 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 20C13.2386 20 11 17.7614 11 15C11 12.2386 13.2386 10 16 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M53 28C57.4183 28 61 24.4183 61 20C61 15.5817 57.4183 12 53 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11 28C6.58172 28 3 24.4183 3 20C3 15.5817 6.58172 12 11 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </div>

          {/* Microphone status text */}
          <h2 className="text-2xl font-medium mb-6 text-white">
            {isBroadcasting
              ? "Broadcasting Live"
              : isAudioEnabled
                ? "Microphone Ready"
                : "Microphone Off"}
          </h2>

          {/* Audio level indicator */}
          {isAudioEnabled && (
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              ></div>
            </div>
          )}

          {/* Live indicator */}
          {isBroadcasting && (
            <div className="mt-4 flex items-center text-white">
              <span className="animate-pulse mr-2 text-red-500">●</span>
              <span>Live</span>
            </div>
          )}

          {/* Debug info */}
          {debugInfo && (
            <div className="mt-2 text-xs text-gray-400 max-w-full overflow-hidden text-ellipsis">
              {debugInfo}
            </div>
          )}

          {/* Reconnecting indicator */}
          {connectionState === ConnectionState.Reconnecting && (
            <div className="mt-4 text-yellow-400 animate-pulse">
              Reconnecting...
            </div>
          )}
        </div>

        {/* Hidden canvas for visualization - will be used for audio processing but not displayed */}
        <canvas
          ref={canvasRef}
          width="400"
          height="100"
          className="hidden"
        ></canvas>
      </div>

      {/* Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setIsDeviceDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure Microphone
        </button>

        <button
          onClick={toggleAudio}
          disabled={!isConnected}
          className={`flex items-center px-4 py-2 rounded-md focus:outline-none ${
            isAudioEnabled
              ? "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] hover:bg-[#bae6fd]"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {isAudioEnabled ? (
            <MicOff className="mr-2 h-4 w-4" />
          ) : (
            <Mic className="mr-2 h-4 w-4" />
          )}
          {isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
        </button>

        <button
          onClick={toggleBroadcast}
          disabled={!isConnected || !isAudioEnabled}
          className={`flex items-center px-4 py-2 rounded-md text-white focus:outline-none ${
            isBroadcasting
              ? "bg-gray-600 hover:bg-gray-700"
              : "bg-[#111827] hover:bg-black"
          }`}
        >
          {isBroadcasting ? "Stop Broadcast" : "Start Broadcast"}
        </button>
      </div>

      {/* Close Room button */}
      <div className="mt-6">
        <button
          onClick={() => setIsConfirmDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none"
        >
          <X className="mr-2 h-4 w-4" />
          Close Room
        </button>
      </div>

      {/* Troubleshooting button */}
      <div className="mt-4">
        <button
          onClick={forceRepublishTrack}
          disabled={!isConnected}
          className="text-sm px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded hover:bg-amber-200"
        >
          Force Republish Track
        </button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Microphone Settings</DialogTitle>
            <DialogDescription>
              Select which microphone to use for your audio broadcast.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="microphone" className="text-right">
                Microphone
              </Label>
              <Select
                value={selectedAudioDevice}
                onValueChange={changeAudioDevice}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.length === 0 ? (
                    <SelectItem value="no-devices">
                      No microphones found
                    </SelectItem>
                  ) : (
                    audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Close Room"
        description="Are you sure you want to close this room? All participants will be disconnected and the room will be permanently deleted."
        onConfirm={handleCloseRoom}
        onCancel={() => setIsConfirmDialogOpen(false)}
        confirmText="Close Room"
        cancelText="Cancel"
        isLoading={isClosingRoom}
      />
    </div>
  );
}
