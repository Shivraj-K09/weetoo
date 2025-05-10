"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { CreateRoomPopover } from "./create-room-popover";
import { RoomsList } from "./rooms-list";
import { resetSupabaseClient } from "@/lib/supabase/utils";
import { useUser } from "@/hooks/use-user";
import type { Room } from "@/types/index";

export function TradingRooms() {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const { user } = useUser();

  // Use a ref to track the subscription to ensure proper cleanup
  const subscriptionRef = useRef<any>(null);

  // Function to force refresh the rooms list
  const refreshRooms = useCallback(() => {
    setLastRefresh(Date.now());
    console.log("[TRADING ROOMS] Manual refresh triggered");
  }, []);

  // Fetch rooms from Supabase
  const fetchRooms = useCallback(async () => {
    const isMounted = true;

    try {
      setIsRoomsLoading(true);

      // Reset Supabase client before fetching rooms
      resetSupabaseClient();

      // Force refresh the auth session
      try {
        await supabase.auth.refreshSession();
      } catch (error) {
        console.error("[TRADING ROOMS] Error refreshing auth session:", error);
      }

      const { data, error } = await supabase
        .from("trading_rooms")
        .select(
          `
          id,
          room_name,
          room_type,
          trading_pairs,
          current_participants,
          owner_id,
          created_at,
          room_category,
          users:owner_id (first_name, last_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[TRADING ROOMS] Error fetching rooms:", error);
        if (isMounted) {
          setIsRoomsLoading(false);
        }
        return;
      }

      if (!isMounted) return;

      // Transform data with proper typing
      const transformedRooms = (data || []).map((room: any) => {
        // Handle users as an array or single object
        const userObj = Array.isArray(room.users) ? room.users[0] : room.users;

        return {
          id: room.id,
          title: room.room_name,
          symbol: room.trading_pairs?.[0] || "BTCUSDT", // Use the first trading pair or default
          privacy: room.room_type,
          createdAt: new Date(room.created_at),
          username: userObj
            ? `${userObj.first_name} ${userObj.last_name}`
            : "Unknown",
          roomCategory: room.room_category || "regular",
          owner_id: room.owner_id,
        };
      });

      if (isMounted) {
        setRooms(transformedRooms);
        setIsRoomsLoading(false);
      }
    } catch (error) {
      console.error("[TRADING ROOMS] Error fetching rooms:", error);
      if (isMounted) {
        setIsRoomsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let channelSubscription: any = null;

    // Call fetchRooms immediately
    fetchRooms();

    // Set up real-time subscription for rooms
    try {
      // Create a channel for real-time updates
      const channel = supabase
        .channel("trading_rooms_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "trading_rooms" },
          () => {
            if (isMounted) {
              fetchRooms();
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            // Store the subscription reference for cleanup
            channelSubscription = channel;
            subscriptionRef.current = channel;
          }
        });
    } catch (subscriptionError) {
      console.error(
        "[TRADING ROOMS] Error setting up room subscription:",
        subscriptionError
      );
    }

    // Cleanup function - critical for preventing navigation issues
    return () => {
      isMounted = false;

      // Properly clean up the subscription
      if (subscriptionRef.current || channelSubscription) {
        try {
          const channelToRemove =
            subscriptionRef.current || channelSubscription;
          if (channelToRemove) {
            supabase.removeChannel(channelToRemove);
          }
        } catch (error) {
          console.error("[TRADING ROOMS] Error removing channel:", error);
        }
      }

      // Clear the ref
      subscriptionRef.current = null;
    };
  }, [fetchRooms, lastRefresh]);

  // Add a useEffect to handle room window closing
  useEffect(() => {
    // Check if we need to reset the Supabase client
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Page is now visible again, check if we need to reset
        const lastOpenedRoom = localStorage.getItem("lastOpenedRoom");
        const lastOpenTime = localStorage.getItem("roomOpenedAt");

        if (lastOpenedRoom && lastOpenTime) {
          const timeElapsed = Date.now() - Number.parseInt(lastOpenTime);
          // If it's been less than 10 seconds since a room was opened,
          // and we're back to the list view, we might need to reset
          if (timeElapsed < 10000) {
            console.log(
              "[TRADING ROOMS] Detected return from room view, resetting connections"
            );
            // Reset the Supabase client
            resetSupabaseClient();
            // Clear the localStorage values
            localStorage.removeItem("lastOpenedRoom");
            localStorage.removeItem("roomOpenedAt");
            // Refresh the rooms list
            fetchRooms();
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Add a listener for the custom event from rooms
    const handleRoomClosed = () => {
      console.log(
        "[TRADING ROOMS] Room closed event received, refreshing rooms"
      );
      fetchRooms();
    };

    window.addEventListener("room-closed", handleRoomClosed);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("room-closed", handleRoomClosed);
    };
  }, [fetchRooms]);

  return (
    <div className="w-full h-full">
      <div className="flex justify-between w-full py-3">
        <Button
          onClick={refreshRooms}
          className="bg-[#3498DB] hover:bg-[#3498DB]/90 text-white"
        >
          Refresh Rooms
        </Button>
        <CreateRoomPopover open={open} setOpen={setOpen} user={user} />
      </div>
      <RoomsList
        rooms={rooms}
        isLoading={isRoomsLoading}
        user={user}
        onCreateRoom={() => setOpen(true)}
        onRefresh={refreshRooms}
      />
    </div>
  );
}
