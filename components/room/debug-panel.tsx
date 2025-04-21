"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface DebugPanelProps {
  roomId: string;
  isVisible?: boolean;
}

export function DebugPanel({ roomId, isVisible = false }: DebugPanelProps) {
  const [roomData, setRoomData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoomData = async () => {
    if (!roomId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("trading_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Error fetching room data:", error);
      } else {
        setRoomData(data);
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchRoomData();
    }
  }, [isVisible, roomId]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md max-h-96 overflow-auto">
      <h3 className="text-lg font-bold mb-2">Room Debug Info</h3>
      <Button
        size="sm"
        variant="outline"
        className="mb-2 text-xs"
        onClick={fetchRoomData}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Refresh Data"}
      </Button>
      {roomData ? (
        <div className="text-xs">
          <div className="mb-2">
            <strong>Room ID:</strong> {roomData.id}
          </div>
          <div className="mb-2">
            <strong>Room Name:</strong> {roomData.room_name}
          </div>
          <div className="mb-2">
            <strong>Owner ID:</strong> {roomData.owner_id}
          </div>
          <div className="mb-2">
            <strong>Current Participants:</strong>{" "}
            {roomData.current_participants}
          </div>
          <div className="mb-2">
            <strong>Max Participants:</strong> {roomData.max_participants}
          </div>
          <div className="mb-2">
            <strong>Participants Array:</strong>
            <pre className="mt-1 bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(roomData.participants, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-sm">No room data available</div>
      )}
    </div>
  );
}
