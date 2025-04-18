"use client";

import { useState, useEffect } from "react";
import {
  LiveKitRoom,
  useRoomContext,
  useParticipants,
} from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { HostView } from "./host-view";
import { ParticipantView } from "./participant-view";
import VoiceRoomHeader from "./voice-room-header";

interface VoiceRoomClientProps {
  roomId: string;
  isHost: boolean;
  token: string;
  roomName: string;
  isPrivate?: boolean;
  listenersCount?: number;
}

export default function VoiceRoomClient({
  roomId,
  isHost,
  token,
  roomName,
  isPrivate = false,
  listenersCount = 0,
}: VoiceRoomClientProps) {
  const [userInteracted, setUserInteracted] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [participantCount, setParticipantCount] = useState(1); // Start with 1 (the host)

  // Add a global click handler to mark user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
    };

    // Add event listeners for common user interactions
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  // This component will handle tracking participants and passing the count to the header
  const ParticipantCounter = () => {
    const room = useRoomContext();
    const participants = useParticipants();

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

    // REMOVE THIS EFFECT - it's causing the infinite loop
    // useEffect(() => {
    //   setParticipantCount(participants.length + 1) // +1 for local participant
    // }, [participants])

    return null; // This component doesn't render anything
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header at the top */}
      <div className="py-4 border-b px-4">
        <VoiceRoomHeader
          roomName={roomName}
          isHost={isHost}
          isPrivate={isPrivate}
          participantCount={participantCount} // Pass the real-time participant count
          isBroadcasting={isBroadcasting}
        />
      </div>

      {/* Main content area with blue background - everything centered */}
      <div className="flex-1 bg-blue-50 flex items-center justify-center overflow-hidden rounded-b-xl">
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ""}
          connect={true}
          video={false}
          audio={false}
          data-lk-theme="default"
          onConnected={() => console.log("LiveKitRoom connected successfully")}
          onDisconnected={(reason) =>
            console.log("LiveKitRoom disconnected, reason:", reason)
          }
          options={{
            adaptiveStream: true,
            dynacast: true,
            publishDefaults: {
              simulcast: true,
              stopMicTrackOnMute: false, // Important: don't stop the track when muted
            },
            audioCaptureDefaults: {
              autoGainControl: true,
              echoCancellation: true,
              noiseSuppression: true,
            },
          }}
        >
          <ParticipantCounter />
          {isHost ? (
            <HostView
              roomId={roomId}
              onBroadcastChange={(broadcasting) =>
                setIsBroadcasting(broadcasting)
              }
            />
          ) : (
            <ParticipantView
              roomId={roomId}
              onAudioTrackDetected={(hasTrack) => setIsBroadcasting(hasTrack)}
            />
          )}
        </LiveKitRoom>

        {!userInteracted && (
          <div
            className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setUserInteracted(true)}
          >
            <div className="bg-white p-8 rounded-lg text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Enable Audio</h2>
              <p className="mb-6">
                Click anywhere to enable audio for this trading room.
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
    </div>
  );
}
