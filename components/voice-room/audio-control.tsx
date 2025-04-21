"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import {
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { useRoomContext as useRoom } from "@livekit/components-react";
import { Track } from "livekit-client";

interface AudioControlsProps {
  isHost: boolean;
  isBroadcasting: boolean;
  onStartBroadcast: () => void;
  onStopBroadcast: () => void;
  isConnecting?: boolean;
  isRoomConnected?: boolean;
}

export function AudioControls({
  isHost,
  isBroadcasting,
  onStartBroadcast,
  onStopBroadcast,
  isConnecting = false,
  isRoomConnected = false,
}: AudioControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const room = useRoom();
  const [isListening, setIsListening] = useState(true);

  // Add logging function
  const logVoice = (message: string, ...args: any[]) => {
    console.log(`[LIVEKIT CONSOLE] ${message}`, ...args);
  };

  // Update mute state based on actual microphone state
  useEffect(() => {
    if (localParticipant && isHost) {
      const updateMuteState = () => {
        const micEnabled = localParticipant.isMicrophoneEnabled;
        setIsMuted(!micEnabled);
      };

      // Initial state
      updateMuteState();

      // Instead of using events, we can poll the state periodically
      const intervalId = setInterval(updateMuteState, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [localParticipant, isHost]);

  // Toggle microphone mute state
  const toggleMute = async () => {
    if (!localParticipant || !isHost || !isBroadcasting) return;

    try {
      if (isMuted) {
        await localParticipant.setMicrophoneEnabled(true);
      } else {
        await localParticipant.setMicrophoneEnabled(false);
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    try {
      // Find all audio elements in the document
      const audioElements = document.querySelectorAll("audio[data-track-sid]");

      // Set the volume property on all audio elements
      audioElements.forEach((element) => {
        if (element instanceof HTMLAudioElement) {
          element.volume = newVolume / 100;
          logVoice(
            `Set volume to ${newVolume}% for audio element ${element.getAttribute("data-track-sid")}`
          );
        }
      });
    } catch (error) {
      console.error("Error changing volume:", error);
    }
  };

  // Handle broadcasting toggle
  const handleBroadcastToggle = () => {
    if (isBroadcasting) {
      onStopBroadcast();
    } else {
      onStartBroadcast();
    }
  };

  // Check if the button should be disabled
  const isButtonDisabled =
    isConnecting || (isHost && !isRoomConnected && !isBroadcasting);

  const toggleListening = () => {
    setIsListening(!isListening);

    try {
      // Find all audio elements in the document
      const audioElements = document.querySelectorAll("audio[data-track-sid]");

      // Set the muted property on all audio elements
      audioElements.forEach((element) => {
        if (element instanceof HTMLAudioElement) {
          element.muted = isListening;
          logVoice(
            `Set muted to ${isListening} for audio element ${element.getAttribute("data-track-sid")}`
          );
        }
      });

      // Also handle track publications properly
      remoteParticipants.forEach((participant) => {
        // Get all audio tracks using the correct API
        const audioPublications = Array.from(
          participant.trackPublications.values()
        ).filter((publication) => publication.kind === Track.Kind.Audio);

        // Toggle audio for each track by using the track's element
        audioPublications.forEach((publication) => {
          if (publication.track) {
            // For remote tracks, we need to mute/unmute the audio elements
            const audioElements = publication.track
              .attachedElements as HTMLMediaElement[];

            // Set the muted property on all attached audio elements
            audioElements.forEach((element) => {
              if (element instanceof HTMLMediaElement) {
                element.muted = isListening;
              }
            });
          }
        });
      });
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 lk-audio-controls">
      {isHost && (
        <Button
          onClick={handleBroadcastToggle}
          className={`${
            isBroadcasting
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white flex items-center gap-2 px-4 py-2 h-9 lk-button lk-button-primary`}
          disabled={isButtonDisabled}
          title={
            !isRoomConnected && !isBroadcasting
              ? "Waiting for connection..."
              : ""
          }
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></div>
              Connecting...
            </>
          ) : isBroadcasting ? (
            <>
              <span className="relative flex h-3 w-3 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Stop Broadcasting
            </>
          ) : (
            <>Start Broadcasting</>
          )}
        </Button>
      )}

      {isHost && isBroadcasting && (
        <Button
          onClick={toggleMute}
          variant="outline"
          className="border-gray-600 bg-transparent h-9 lk-button"
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}

      <Button
        onClick={toggleListening}
        variant="outline"
        className="border-gray-600 bg-transparent h-9 lk-button"
        title={isListening ? "Mute audio" : "Unmute audio"}
      >
        {isListening ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
