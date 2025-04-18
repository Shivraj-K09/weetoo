"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { RoomsList } from "./rooms-list";
import { CreateRoomPopover } from "./create-room-popover";
import { useUser } from "@/hooks/use-user";
import type { Room } from "@/types/index";

export function TradingRooms() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const { user } = useUser();

  // Use a ref to track the subscription to ensure proper cleanup
  const subscriptionRef = useRef<any>(null);

  // Fetch rooms from Supabase
  useEffect(() => {
    let isMounted = true;
    let channelSubscription: any = null;

    const fetchRooms = async () => {
      if (!isMounted) return;

      try {
        setIsRoomsLoading(true);
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
          console.error("Error fetching rooms:", error);
          if (isMounted) {
            setIsRoomsLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        // Transform data with proper typing
        const transformedRooms = (data || []).map((room: any) => {
          // Handle users as an array or single object
          const userObj = Array.isArray(room.users)
            ? room.users[0]
            : room.users;

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
        console.error("Error fetching rooms:", error);
        if (isMounted) {
          setIsRoomsLoading(false);
        }
      }
    };

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
      console.error("Error setting up room subscription:", subscriptionError);
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
          console.error("Error removing channel:", error);
        }
      }

      // Clear the ref
      subscriptionRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full">
      <div className="flex justify-end w-full py-3">
        <CreateRoomPopover open={open} setOpen={setOpen} user={user} />
      </div>
      <RoomsList
        rooms={rooms}
        isLoading={isRoomsLoading}
        user={user}
        onCreateRoom={() => setOpen(true)}
      />
    </div>
  );
}
