"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useConnectionState,
  useRemoteParticipant,
  useTracks,
  AudioTrack as LKAudioTrack,
  useRoomContext,
  useParticipants,
} from "@livekit/components-react";
import {
  Track,
  ConnectionState,
  RoomEvent,
  type RemoteTrack,
  type RemoteParticipant,
  type RemoteTrackPublication,
  type ParticipantTrackPermission,
} from "livekit-client";
import { Volume2, VolumeX, RefreshCw } from "lucide-react";

export function ParticipantView({
  roomId,
  onAudioTrackDetected,
}: {
  roomId: string;
  onAudioTrackDetected?: (hasTrack: boolean) => void;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const [hostId, setHostId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasAudioTrack, setHasAudioTrack] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [foundHostInRoom, setFoundHostInRoom] = useState<boolean>(false);
  const [participantCount, setParticipantCount] = useState(0);

  // Audio analysis
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track which audio elements we've already connected to
  const connectedAudioElementsRef = useRef<Set<HTMLAudioElement>>(new Set());
  // Track if visualization is already set up
  const isVisualizationSetupRef = useRef<boolean>(false);
  // Reference to audio elements
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);

  // Enhanced approach to find the host participant
  const hostParticipant = useRemoteParticipant(hostId || "");

  // Track participants and update count
  useEffect(() => {
    if (!room) return;

    // Update participant count whenever it changes
    const handleParticipantConnected = () => {
      const count = room.numParticipants + 1; // +1 for local participant
      setParticipantCount(count);
    };

    const handleParticipantDisconnected = () => {
      const count = room.numParticipants + 1; // +1 for local participant
      setParticipantCount(count);
    };

    // Set initial count
    setParticipantCount(room.numParticipants + 1);

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(
        RoomEvent.ParticipantDisconnected,
        handleParticipantDisconnected
      );
    };
  }, [room]);

  // Also update participant count based on the participants array from the hook
  useEffect(() => {
    setParticipantCount(participants.length);
  }, [participants]);

  // Scan for hosts in the room
  const scanForHostsInRoom = useCallback(() => {
    if (!room) return false;

    console.log("Scanning for hosts in room...");
    const remoteParticipants = Array.from(room.remoteParticipants.values());

    // First, look for participants with isHost=true in metadata
    for (const participant of remoteParticipants) {
      try {
        const metadata = participant.metadata
          ? JSON.parse(participant.metadata)
          : {};
        if (metadata.isHost === true) {
          console.log(`Found host by metadata: ${participant.identity}`);
          setHostId(participant.identity);
          setFoundHostInRoom(true);
          return true;
        }
      } catch (e) {
        console.error("Error parsing metadata:", e);
      }
    }

    // Next, look for participants publishing audio tracks
    for (const participant of remoteParticipants) {
      const publications = Array.from(participant.trackPublications.values());
      const hasAudioPublication = publications.some(
        (pub: RemoteTrackPublication) =>
          pub.kind === "audio" && pub.source === Track.Source.Microphone
      );

      if (hasAudioPublication) {
        console.log(
          `Found participant publishing audio: ${participant.identity}`
        );
        setHostId(participant.identity);
        setFoundHostInRoom(true);
        return true;
      }
    }

    console.log("No host found in room scan");
    return false;
  }, [room]);

  // Get host information from the server
  const getHostInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching host info for room:", roomId);
      const response = await fetch(`/api/rooms/${roomId}/host`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Error fetching host info: ${response.status} ${response.statusText}`,
          errorText
        );
        setError(`Failed to get host info: ${response.statusText}`);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Host info received:", data);

      if (data.hostId) {
        setHostId(data.hostId);
        console.log("Host ID set to:", data.hostId);
      } else {
        console.warn("No host ID in response:", data);
        setError("No host ID found");
      }
    } catch (error) {
      console.error("Error fetching host info:", error);
      setError("Error connecting to host");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Define refreshConnection type ahead of time to avoid circular reference
  type RefreshConnectionType = () => void;

  // Define forceTrackSubscription type ahead of time
  type ForceTrackSubscriptionType = () => void;

  // We'll use a reference to store the function to avoid the reassignment issue
  const refreshConnectionRef = useRef<RefreshConnectionType | null>(null);
  // This function will call the current reference
  const refreshConnection: RefreshConnectionType = () => {
    if (refreshConnectionRef.current) {
      refreshConnectionRef.current();
    }
  };

  // Forward declaration of refreshConnection
  //let refreshConnection: RefreshConnectionType

  // Force subscription to all tracks from the host
  const forceTrackSubscription: ForceTrackSubscriptionType = useCallback(() => {
    if (!room) return;

    // If we don't have a host participant but we're connected, try to scan for hosts
    if (!hostParticipant && room.state === ConnectionState.Connected) {
      scanForHostsInRoom();
      return;
    }

    if (!hostParticipant) return;

    console.log(
      "Forcing track subscription for host:",
      hostParticipant.identity
    );

    try {
      // Only set permissions if the room is connected
      if (room.state === ConnectionState.Connected) {
        // First, enable all track subscriptions globally
        room.localParticipant.setTrackSubscriptionPermissions(true);

        // Then, specifically set permissions for the host participant
        if (hostParticipant.identity) {
          const permissions: ParticipantTrackPermission[] = [
            {
              participantIdentity: hostParticipant.identity,
              allowAll: true,
            },
          ];

          // Set specific permissions for the host participant
          room.localParticipant.setTrackSubscriptionPermissions(
            true,
            permissions
          );
          console.log(
            "Set explicit track permissions for host:",
            hostParticipant.identity
          );
        }

        // Manually subscribe to all tracks from the host
        const publications = Array.from(
          hostParticipant.trackPublications.values()
        );

        if (publications.length > 0) {
          console.log(
            `Found ${publications.length} tracks from host, attempting to subscribe`
          );

          publications.forEach((pub) => {
            if (!pub.isSubscribed && pub.kind === "audio") {
              console.log(`Manually subscribing to track: ${pub.trackSid}`);
              pub.setSubscribed(true);

              // Try to force a track subscription update
              setTimeout(() => {
                if (!pub.isSubscribed) {
                  console.log(`Retry subscribing to track: ${pub.trackSid}`);
                  pub.setSubscribed(true);
                }
              }, 500);
            }
          });

          // Try to update the participant count
          setTimeout(() => {
            if (room.numParticipants > 0) {
              console.log(`Room has ${room.numParticipants} participants`);
            }
          }, 500);
        } else {
          console.log("No publications found from host to subscribe to");

          // If no publications found, try to reconnect to the room
          setTimeout(() => {
            console.log("No tracks found, trying to reconnect to room");
            if (refreshConnection) refreshConnection();
          }, 2000);
        }
      } else {
        console.log("Room not connected, cannot set track permissions yet");
      }
    } catch (err) {
      console.error("Error in forceTrackSubscription:", err);
      setDebugInfo(
        `Error setting track permissions: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // Update debug info
    setDebugInfo(
      `Forced subscription to host tracks at ${new Date().toLocaleTimeString()}`
    );
  }, [room, hostParticipant, scanForHostsInRoom]);

  // Force refresh connection to host
  refreshConnectionRef.current = useCallback(() => {
    // Prevent rapid refreshing
    const now = Date.now();
    if (now - lastRefreshTime < 3000) {
      setDebugInfo("Please wait before refreshing again");
      return;
    }

    setLastRefreshTime(now);
    setDebugInfo("Refreshing connection...");

    // Scan for hosts in the room first
    scanForHostsInRoom();

    // Only attempt to force track subscription if the room is connected
    if (room && room.state === ConnectionState.Connected) {
      // Force track subscription
      forceTrackSubscription();

      // Resubscribe to tracks
      if (hostParticipant) {
        // Set subscription permissions to true to ensure we can receive tracks
        room.localParticipant.setTrackSubscriptionPermissions(true);

        // Force resubscription by toggling permissions
        setTimeout(() => {
          // Toggle permissions to force a refresh
          room.localParticipant.setTrackSubscriptionPermissions(false);
          setTimeout(() => {
            room.localParticipant.setTrackSubscriptionPermissions(true);

            // Create a proper ParticipantTrackPermission object
            if (hostParticipant.identity) {
              const permissions: ParticipantTrackPermission[] = [
                {
                  participantIdentity: hostParticipant.identity,
                  allowAll: true,
                },
              ];

              // Set specific permissions for the host participant
              room.localParticipant.setTrackSubscriptionPermissions(
                true,
                permissions
              );
            }

            setDebugInfo("Refreshed connection. Waiting for audio...");
          }, 300);
        }, 300);
      } else {
        setDebugInfo("Cannot refresh: No host found");
      }
    } else if (room && room.state !== ConnectionState.Connected) {
      // If room exists but is not connected, try to reconnect
      setDebugInfo("Room not connected, attempting to reconnect...");

      try {
        // Get the token from the LiveKit room component
        // We need to fetch a new token from the server
        fetch(`/api/get-token?room=${roomId}&host=false`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to get token: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (!data.token) {
              throw new Error("No token returned from server");
            }

            // Reconnect with the new token
            return room.connect(
              process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
              data.token
            );
          })
          .then(() => {
            setDebugInfo("Reconnected successfully");
            // After reconnection, try to force track subscription
            setTimeout(() => {
              scanForHostsInRoom();
            }, 1000);
          })
          .catch((err) => {
            setDebugInfo(`Reconnection failed: ${err.message}`);
          });
      } catch (err) {
        console.error("Error reconnecting:", err);
        setDebugInfo(
          `Error reconnecting: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } else {
      setDebugInfo("Cannot refresh: No room available");
    }
  }, [
    room,
    hostParticipant,
    lastRefreshTime,
    roomId,
    scanForHostsInRoom,
    forceTrackSubscription,
  ]);

  // Ensure audio elements are playing
  const ensureAudioPlayback = useCallback(() => {
    const audioElements = document.querySelectorAll("audio");

    if (audioElements.length === 0) {
      console.log("No audio elements found to play");
      return;
    }

    console.log(`Attempting to play ${audioElements.length} audio elements`);

    audioElements.forEach((audio, index) => {
      if (audio.paused) {
        // Try to play with user activation
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Successfully playing audio element ${index}`);
              setHasAudioTrack(true);
              if (onAudioTrackDetected) onAudioTrackDetected(true);
            })
            .catch((err) => {
              console.error(`Error playing audio element ${index}:`, err);
              // If autoplay was prevented, we need user interaction
              if (err.name === "NotAllowedError") {
                setDebugInfo(
                  "Audio playback requires user interaction. Please click anywhere."
                );
              }
            });
        }
      } else {
        console.log(`Audio element ${index} is already playing`);
      }
    });
  }, [onAudioTrackDetected]);

  // Initialize AudioContext on component mount
  useEffect(() => {
    // Create a dummy silent audio context to prepare for later use
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        try {
          const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
          const context = new AudioContext();
          audioContextRef.current = context;

          // Immediately suspend it until user interaction
          if (context.state !== "suspended") {
            context.suspend();
          }

          console.log(
            "AudioContext created and suspended until user interaction"
          );
        } catch (error) {
          console.error("Failed to create initial AudioContext:", error);
        }
      }
    };

    initAudioContext();

    // Add global click handler to resume AudioContext
    const handleUserInteraction = () => {
      setUserInteracted(true);

      // Try to play audio elements when user interacts
      ensureAudioPlayback();

      if (
        audioContextRef.current &&
        audioContextRef.current.state === "suspended"
      ) {
        audioContextRef.current
          .resume()
          .then(() => {
            console.log("AudioContext resumed on user interaction");
            ensureAudioPlayback();
          })
          .catch((err) => {
            console.error("Failed to resume AudioContext:", err);
          });
      }
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [ensureAudioPlayback]);

  // Monitor connection state
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = () => {
      console.log("Room disconnected");
      setReconnecting(true);
      setHasAudioTrack(false);
      if (onAudioTrackDetected) onAudioTrackDetected(false);
      cleanupAudioContext();
    };

    const handleReconnected = () => {
      console.log("Room reconnected");
      setReconnecting(false);
      // Scan for hosts first, then fall back to API
      if (!scanForHostsInRoom()) {
        getHostInfo();
      }
    };

    const handleConnected = () => {
      console.log("Room connected");
      setReconnecting(false);
      // Scan for hosts immediately upon connection
      scanForHostsInRoom();
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Connected, handleConnected);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.Connected, handleConnected);
    };
  }, [room, scanForHostsInRoom, getHostInfo, onAudioTrackDetected]);

  // Poll for host info
  useEffect(() => {
    // First try to scan for hosts in the room
    if (room && room.state === ConnectionState.Connected) {
      const foundHost = scanForHostsInRoom();
      if (!foundHost) {
        // If no host found in room, get from API
        getHostInfo();
      }
    } else {
      // If not connected, just get from API
      getHostInfo();
    }

    // Poll less frequently (every 5 seconds)
    const interval = setInterval(() => {
      // Only poll API if we haven't found a host in the room
      if (!foundHostInRoom) {
        getHostInfo();
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      cleanupAudioContext();
    };
  }, [roomId, room, scanForHostsInRoom, foundHostInRoom, getHostInfo]);

  // Cleanup function for audio context
  const cleanupAudioContext = () => {
    // Safely close audio context if it exists
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
      } catch (e) {
        console.log("Error closing audio context:", e);
      }
      audioContextRef.current = null;
    }

    // Clear the source reference
    audioSourceRef.current = null;

    // Reset the connected elements tracking
    connectedAudioElementsRef.current.clear();

    // Reset visualization setup flag
    isVisualizationSetupRef.current = false;

    // Clear audio level monitoring
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
  };

  // When host ID changes, attempt to find the host participant and subscribe to tracks
  useEffect(() => {
    if (!room || !hostId) return;

    // Log all participants for debugging
    const remoteParticipants = Array.from(room.remoteParticipants.values());
    console.log(
      "All participants:",
      remoteParticipants.map((p) => ({
        identity: p.identity,
        name: p.name,
        metadata: p.metadata,
      }))
    );

    // Check if we can find the host by identity
    const foundHost = room.remoteParticipants.get(hostId);
    if (foundHost) {
      console.log("Found host by ID:", foundHost.identity);
      setFoundHostInRoom(true);

      // Force subscription to host tracks
      setTimeout(() => {
        forceTrackSubscription();
      }, 500);
    } else {
      console.log("Host not found by ID, checking all participants...");
      setFoundHostInRoom(false);

      // If we can't find by ID, try to scan for hosts
      scanForHostsInRoom();
    }
  }, [room, hostId, forceTrackSubscription, scanForHostsInRoom]);

  // Log when host participant changes
  useEffect(() => {
    console.log(
      "Host participant updated:",
      hostParticipant ? hostParticipant.identity : "none"
    );

    // If we have a host participant, check their tracks and force subscription
    if (hostParticipant) {
      const trackPublications = Array.from(
        hostParticipant.trackPublications.values()
      );
      console.log(
        "Host track publications:",
        trackPublications.map((pub: RemoteTrackPublication) => ({
          kind: pub.kind,
          source: pub.source,
          isSubscribed: pub.isSubscribed,
          track: pub.track ? "exists" : "null",
        }))
      );

      // Force subscription when host participant is found
      if (room && room.state === ConnectionState.Connected) {
        forceTrackSubscription();
      }
    }
  }, [hostParticipant, forceTrackSubscription, room]);

  // Listen for participant events to detect when the host joins
  useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log("Participant connected:", participant.identity);

      // Check if this is the host we're waiting for
      if (hostId && participant.identity === hostId) {
        console.log("Host participant connected, forcing track subscription");
        setFoundHostInRoom(true);
        setTimeout(() => {
          if (room.state === ConnectionState.Connected) {
            forceTrackSubscription();
          }
        }, 500);
      } else {
        // Check if this might be a host by metadata
        try {
          const metadata = participant.metadata
            ? JSON.parse(participant.metadata)
            : {};
          if (metadata.isHost === true) {
            console.log("Host detected by metadata:", participant.identity);
            setHostId(participant.identity);
            setFoundHostInRoom(true);
          }
        } catch (e) {
          console.error("Error parsing metadata:", e);
        }
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [room, hostId, forceTrackSubscription]);

  // Listen for track publications from the host
  useEffect(() => {
    if (!room) return;

    const handleTrackPublished = (
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log("Track published detected:", {
        trackId: publication.trackSid,
        kind: publication.kind,
        participantId: participant.identity,
        isHost: participant.identity === hostId,
      });

      // If this is from the host, try to subscribe to it
      if (participant.identity === hostId && publication.kind === "audio") {
        console.log(
          `Host published a track: ${publication.trackSid}, attempting to subscribe`
        );

        // Force subscription
        publication.setSubscribed(true);

        // Set hasAudioTrack to true
        setHasAudioTrack(true);
        if (onAudioTrackDetected) onAudioTrackDetected(true);

        // Try to play audio elements
        setTimeout(ensureAudioPlayback, 500);
      }

      // If this is an audio track and we don't have a host yet, this might be the host
      if (
        publication.kind === "audio" &&
        publication.source === Track.Source.Microphone &&
        !hostId
      ) {
        console.log(
          `Audio publisher detected, might be host: ${participant.identity}`
        );

        // Check metadata
        try {
          const metadata = participant.metadata
            ? JSON.parse(participant.metadata)
            : {};
          if (metadata.isHost === true) {
            console.log("Confirmed host by metadata:", participant.identity);
            setHostId(participant.identity);
            setFoundHostInRoom(true);
          } else {
            // Even if not marked as host, if publishing audio, treat as host
            console.log(
              "Treating audio publisher as host:",
              participant.identity
            );
            setHostId(participant.identity);
            setFoundHostInRoom(true);
          }
        } catch (e) {
          console.error("Error parsing metadata:", e);
          // Still treat as host if publishing audio
          setHostId(participant.identity);
          setFoundHostInRoom(true);
        }

        // Force subscription
        publication.setSubscribed(true);
        setHasAudioTrack(true);
        if (onAudioTrackDetected) onAudioTrackDetected(true);
        setTimeout(ensureAudioPlayback, 500);
      }
    };

    room.on(RoomEvent.TrackPublished, handleTrackPublished);

    return () => {
      room.off(RoomEvent.TrackPublished, handleTrackPublished);
    };
  }, [room, hostId, ensureAudioPlayback, onAudioTrackDetected]);

  // Get all tracks from the host with improved track selection
  const tracks = useTracks(
    hostParticipant
      ? [
          // Try all possible audio sources in order of preference
          {
            participantIdentity: hostParticipant.identity,
            source: Track.Source.Microphone,
          },
          {
            participantIdentity: hostParticipant.identity,
            source: Track.Source.ScreenShareAudio,
          },
          { participantIdentity: hostParticipant.identity, kind: "audio" }, // Fallback to any audio track
          // Add a wildcard track subscription as last resort
          { source: Track.Source.Microphone },
          { kind: "audio" },
        ]
      : []
  );

  // Add this debug logging after the useTracks hook
  useEffect(() => {
    if (hostParticipant) {
      console.log("Host participant found:", hostParticipant.identity);
      console.log("Host participant metadata:", hostParticipant.metadata);

      // Log all publications from the host
      const publications = Array.from(
        hostParticipant.trackPublications.values()
      );
      console.log(
        "Host publications:",
        publications.map((pub) => ({
          sid: pub.trackSid,
          kind: pub.kind,
          source: pub.source,
          isSubscribed: pub.isSubscribed,
          trackName: pub.trackName,
        }))
      );
    }
  }, [hostParticipant, tracks]);

  // Log when tracks change with more details
  useEffect(() => {
    console.log(
      "Tracks updated:",
      tracks.length > 0 ? "has tracks" : "no tracks"
    );
    if (tracks.length > 0) {
      console.log(
        "Track details:",
        tracks.map((track) => ({
          sid: track.sid,
          kind: track.kind,
          source: track.source,
          mediaStreamTrack: track.mediaStreamTrack ? "exists" : "null",
        }))
      );

      // Update debug info
      setDebugInfo(
        `Found ${tracks.length} tracks. SIDs: ${tracks.map((t) => t.sid).join(", ")}`
      );

      // Set hasAudioTrack to true if we have audio tracks
      if (tracks.some((track) => track.kind === "audio")) {
        setHasAudioTrack(true);
        if (onAudioTrackDetected) onAudioTrackDetected(true);
      }
    } else {
      setDebugInfo("No tracks found from host");

      // If we have a host but no tracks, try to force subscription again
      if (hostParticipant && room && room.state === ConnectionState.Connected) {
        console.log(
          "No tracks found but host exists, forcing subscription again"
        );
        forceTrackSubscription();
      }
    }
  }, [
    tracks,
    hostParticipant,
    room,
    forceTrackSubscription,
    onAudioTrackDetected,
  ]);

  // Also call ensureAudioPlayback when tracks change
  useEffect(() => {
    if (tracks.length > 0 && userInteracted) {
      console.log("Tracks changed, ensuring audio playback");
      setTimeout(ensureAudioPlayback, 500);
    }
  }, [tracks, userInteracted, ensureAudioPlayback]);

  // Listen for track subscription events with improved logging
  useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log("Track subscribed:", {
        kind: track.kind,
        sid: track.sid,
        source: track.source,
        participant: participant.identity,
        isHost: participant.identity === hostId,
      });

      if (track.kind === "audio") {
        setHasAudioTrack(true);
        if (onAudioTrackDetected) onAudioTrackDetected(true);

        // If this is from the host, make sure we update our state
        if (participant.identity === hostId) {
          console.log("Host audio track subscribed!");
        } else if (!hostId) {
          // If we don't have a host yet, this might be the host
          console.log(
            "Audio track subscribed from potential host:",
            participant.identity
          );
          setHostId(participant.identity);
          setFoundHostInRoom(true);
        }

        // If user has already interacted, try to set up audio level monitoring
        if (userInteracted) {
          setTimeout(() => {
            setupAudioLevelMonitoring();
          }, 500);
        }

        // Try to play the track immediately
        setTimeout(() => {
          const audioElements = document.querySelectorAll("audio");
          audioElements.forEach((audio) => {
            if (audio.paused) {
              audio.play().catch((err) => {
                console.log("Couldn't play audio after subscription:", err);
              });
            }
          });
        }, 100);
      }
    };

    const handleTrackUnsubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      console.log(
        "Track unsubscribed:",
        track.kind,
        "from participant:",
        participant.identity
      );
      if (track.kind === "audio" && participant.identity === hostId) {
        setHasAudioTrack(false);
        if (onAudioTrackDetected) onAudioTrackDetected(false);
      }
    };

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log("Participant connected:", participant.identity);
    };

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [room, userInteracted, hostId, onAudioTrackDetected]);

  // Update hasAudioTrack based on tracks
  useEffect(() => {
    const audioTrackExists = tracks.some((track) => track.kind === "audio");

    if (audioTrackExists) {
      setHasAudioTrack(true);
      console.log("Audio track detected");
      if (onAudioTrackDetected) onAudioTrackDetected(true);
    } else if (hasAudioTrack && tracks.length === 0) {
      // If we previously had an audio track but now don't
      setHasAudioTrack(false);
      if (onAudioTrackDetected) onAudioTrackDetected(false);
    }
  }, [tracks, hasAudioTrack, onAudioTrackDetected]);

  // Find and store audio elements when they're created
  useEffect(() => {
    if (!hasAudioTrack) return;

    const findAudioElements = () => {
      const elements = document.querySelectorAll("audio");
      if (elements.length > 0) {
        console.log("Found", elements.length, "audio elements");
        audioElementsRef.current = Array.from(elements) as HTMLAudioElement[];

        // If user has interacted, try to play the audio elements
        if (userInteracted && audioContextRef.current) {
          elements.forEach((audio) => {
            audio.muted = isMuted;
            if (audio.paused) {
              audio.play().catch((err) => {
                console.log("Couldn't play audio element:", err);
              });
            }
          });

          // Set up audio level monitoring if not already set up
          if (!isVisualizationSetupRef.current) {
            setupAudioLevelMonitoring();
          }
        }
      }
    };

    // Check immediately and then periodically
    findAudioElements();
    const interval = setInterval(findAudioElements, 1000);

    return () => clearInterval(interval);
  }, [hasAudioTrack, userInteracted, isMuted]);

  // Set up audio level monitoring
  const setupAudioLevelMonitoring = useCallback(() => {
    // If monitoring is already set up, don't try to set it up again
    if (isVisualizationSetupRef.current || !userInteracted) {
      return;
    }

    try {
      // Find audio elements on the page
      const audioElements = document.querySelectorAll("audio");
      if (!audioElements.length) {
        console.log("No audio elements found, will try again later");
        return;
      }

      // Find an audio element we haven't connected to yet
      let audioElement: HTMLAudioElement | null = null;
      for (let i = 0; i < audioElements.length; i++) {
        const element = audioElements[i] as HTMLAudioElement;
        if (!connectedAudioElementsRef.current.has(element)) {
          audioElement = element;
          break;
        }
      }

      if (!audioElement) {
        console.log("All audio elements already connected");
        return;
      }

      // Make sure we have an AudioContext and it's running
      if (!audioContextRef.current) {
        console.log("No AudioContext available");
        return;
      }

      // Resume the AudioContext if it's suspended
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current
          .resume()
          .then(() => {
            console.log("AudioContext resumed during setup");
            completeAudioSetup(audioElement as HTMLAudioElement);
          })
          .catch((err) => {
            console.error("Failed to resume AudioContext:", err);
          });
      } else {
        completeAudioSetup(audioElement as HTMLAudioElement);
      }

      // Try to play the audio element
      if (audioElement.paused) {
        audioElement.play().catch((err) => {
          console.log("Couldn't play audio during setup:", err);
        });
      }
    } catch (error) {
      console.error("Error setting up audio level monitoring:", error);
      isVisualizationSetupRef.current = false;
    }
  }, [userInteracted]);

  const completeAudioSetup = (audioElement: HTMLAudioElement) => {
    if (!audioContextRef.current) return;

    try {
      // Create an analyser node
      const analyserNode = audioContextRef.current.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      audioAnalyserRef.current = analyserNode;

      // Connect the audio element to the analyser
      try {
        const source =
          audioContextRef.current.createMediaElementSource(audioElement);
        audioSourceRef.current = source;
        source.connect(analyserNode);
        // Connect the analyser to the destination to ensure audio still plays
        analyserNode.connect(audioContextRef.current.destination);

        // Mark this audio element as connected
        connectedAudioElementsRef.current.add(audioElement);

        // Mark monitoring as set up
        isVisualizationSetupRef.current = true;

        console.log("Audio level monitoring setup completed successfully");

        // Start monitoring audio levels
        startAudioLevelMonitoring();
      } catch (error) {
        console.error("Error connecting to audio element:", error);
      }
    } catch (error) {
      console.error("Error completing audio setup:", error);
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!audioAnalyserRef.current) return;

    const analyser = audioAnalyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioLevelIntervalRef.current = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average level for the audio meter
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setAudioLevel(Math.min(100, Math.max(0, avg * 1.5)));
    }, 100);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudioContext();
    };
  }, []);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    // Resume AudioContext if it exists and is suspended
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      audioContextRef.current
        .resume()
        .then(() => {
          console.log("AudioContext resumed on mute toggle");
        })
        .catch((err) => {
          console.error("Failed to resume AudioContext:", err);
        });
    }

    // Find all audio elements and mute/unmute them
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.muted = newMuteState;

      // If unmuting, try to play the audio
      if (!newMuteState && audio.paused) {
        audio.play().catch((err) => {
          console.log("Couldn't play audio on unmute:", err);
        });
      }
    });

    console.log(
      `Audio ${newMuteState ? "muted" : "unmuted"}, found ${audioElements.length} audio elements`
    );
  };

  // Debug function to manually check for participants and tracks
  const debugCheckParticipants = useCallback(() => {
    if (!room) {
      setDebugInfo("No room available for debug");
      return;
    }

    const remoteParticipants = Array.from(room.remoteParticipants.values());
    console.log(
      `Debug: Found ${remoteParticipants.length} remote participants`
    );

    remoteParticipants.forEach((participant) => {
      const tracks = Array.from(participant.trackPublications.values());
      console.log(
        `Debug: Participant ${participant.identity} has ${tracks.length} tracks:`,
        tracks.map((t) => ({
          sid: t.trackSid,
          kind: t.kind,
          isSubscribed: t.isSubscribed,
          source: t.source,
        }))
      );
    });

    if (hostParticipant) {
      console.log(
        `Debug: Host participant ${hostParticipant.identity} details:`,
        {
          connected: hostParticipant.connectionQuality,
          tracks: Array.from(hostParticipant.trackPublications.values()).map(
            (t) => t.trackSid
          ),
        }
      );
    } else {
      console.log("Debug: No host participant found");
    }

    setDebugInfo(`Debug check completed at ${new Date().toLocaleTimeString()}`);
  }, [room, hostParticipant]);

  const isConnected = connectionState === ConnectionState.Connected;
  const audioTracks = tracks.map((track, index) => (
    <LKAudioTrack
      key={track.sid ? `audio-${track.sid}` : `audio-fallback-${index}`}
      trackRef={track}
    />
  ));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
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
              className={
                hasAudioTrack && isConnected
                  ? "text-[#3b82f6]"
                  : "text-gray-500"
              }
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
              {hasAudioTrack && isConnected && (
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

          {/* Status text */}
          <h2 className="text-2xl font-medium mb-6 text-white">
            {reconnecting
              ? "Reconnecting..."
              : isConnected
                ? hasAudioTrack
                  ? "Live Audio"
                  : "Waiting for host to start audio..."
                : "Connecting..."}
          </h2>

          {/* Audio level indicator */}
          {hasAudioTrack && isConnected && (
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              ></div>
            </div>
          )}

          {/* Live indicator */}
          {hasAudioTrack && isConnected && (
            <div className="mt-4 flex items-center text-white">
              <span className="animate-pulse mr-2 text-red-500">●</span>
              <span>Live</span>
            </div>
          )}

          {/* User interaction prompt */}
          {!userInteracted && (
            <div className="mt-4 text-yellow-300 font-medium animate-pulse">
              Click anywhere to enable audio
            </div>
          )}

          {/* Error message */}
          {error && <div className="mt-4 text-red-400">{error}</div>}

          {/* Debug info */}
          {debugInfo && (
            <div className="mt-2 text-xs text-gray-400 max-w-full overflow-hidden text-ellipsis">
              {debugInfo}
            </div>
          )}

          {/* Reconnecting indicator */}
          {reconnecting && (
            <div className="mt-4 text-yellow-400 animate-pulse">
              Reconnecting...
            </div>
          )}
        </div>
      </div>

      {/* Audio tracks are rendered but visually hidden */}
      <div
        className="audio-container"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        {isConnected && audioTracks}
      </div>

      {/* Controls */}
      {isConnected && (
        <div className="flex justify-center mt-6 space-x-2">
          {isConnected && hasAudioTrack && (
            <button
              onClick={toggleMute}
              className={`flex items-center px-4 py-2 rounded-md focus:outline-none ${
                isMuted
                  ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] hover:bg-[#bae6fd]"
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Unmute Audio
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Mute Audio
                </>
              )}
            </button>
          )}

          <button
            onClick={refreshConnection}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Connection
          </button>

          {/* Add debug button */}
          <button
            onClick={debugCheckParticipants}
            className="flex items-center px-4 py-2 bg-amber-100 border border-amber-200 rounded-md text-amber-800 hover:bg-amber-200 focus:outline-none text-sm"
          >
            Debug Tracks
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !reconnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-80">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700">
              Connecting to the voice room...
            </p>
          </div>
        </div>
      )}

      {/* Audio permission overlay */}
      {!userInteracted && (
        <div
          className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setUserInteracted(true)}
        >
          <div className="bg-white p-8 rounded-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Enable Audio</h2>
            <p className="mb-6">
              Click anywhere to enable audio for this voice room.
            </p>
            <button
              onClick={() => setUserInteracted(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Enable Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
