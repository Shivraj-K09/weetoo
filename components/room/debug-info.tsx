"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface DebugInfoProps {
  roomId: string;
  isVisible?: boolean;
}

export function DebugInfo({ roomId, isVisible = false }: DebugInfoProps) {
  const [roomData, setRoomData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!roomId) return;

    setIsLoading(true);
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      // Fetch room data
      const { data: room, error: roomError } = await supabase
        .from("trading_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError) {
        console.error("Error fetching room data:", roomError);
      } else {
        setRoomData(room);
      }

      // Fetch user data if logged in
      if (userId) {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          setUserData(user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch debug data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchData();
    }
  }, [isVisible, roomId]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md max-h-96 overflow-auto">
      <h3 className="text-lg font-bold mb-2">Debug Info</h3>
      <Button
        size="sm"
        variant="outline"
        className="mb-2 text-xs"
        onClick={fetchData}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Refresh Data"}
      </Button>

      {userData && (
        <div className="mb-4">
          <h4 className="font-semibold">Current User:</h4>
          <pre className="text-xs bg-gray-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}

      {roomData && (
        <div>
          <h4 className="font-semibold">Room Data:</h4>
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
              <strong>Participants Array:</strong>
              <pre className="mt-1 bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(roomData.participants, null, 2)}
              </pre>
            </div>
            <div className="mb-2">
              <strong>Is Current User Owner:</strong>{" "}
              {userData && roomData.owner_id === userData.id ? "Yes" : "No"}
            </div>
            <div className="mb-2">
              <strong>Is Current User Participant:</strong>{" "}
              {userData && roomData.participants.includes(userData.id)
                ? "Yes"
                : "No"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
