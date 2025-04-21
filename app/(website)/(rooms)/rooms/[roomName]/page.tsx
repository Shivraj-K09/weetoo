import { createClient } from "@/lib/supabase/server";
import TradingRoomPage from "@/components/room/room-page";
import { redirect } from "next/navigation";
import { autoJoinRoom } from "@/app/actions/auto-join-room";

type Props = {
  params: Promise<{ roomName: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: Props) {
  try {
    // Await the params object before using it
    const resolvedParams = await params;
    const { roomName } = resolvedParams;

    // Extract the UUID properly - UUIDs have a specific format
    // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
    const roomId = roomName.substring(0, 36);

    const supabase = await createClient();

    console.log("Fetching room with ID:", roomId);

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let room;

    if (session) {
      // If authenticated, try to fetch the room with the user's session
      const { data, error } = await supabase
        .from("trading_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Error fetching room with auth:", error);
        // Don't redirect yet, try the public access method
      } else {
        room = data;

        // Auto-join the room if it's public
        if (room && room.room_type === "public") {
          await autoJoinRoom(roomId);
        }
      }
    }

    // If not authenticated or couldn't fetch with auth, try public access
    if (!room) {
      // For public rooms or testing, try without RLS
      const { data, error } = await supabase
        .from("trading_rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Room not found or error:", error);
        return redirect("/");
      }

      room = data;
    }

    if (!room) {
      console.error("Room data is null or undefined");
      return redirect("/");
    }

    console.log("Room found:", room.id, room.room_name);

    return <TradingRoomPage roomData={room} />;
  } catch (error) {
    console.error("Error in room page:", error);
    return (
      <div className="h-full flex flex-col items-center justify-center text-white">
        <h2 className="text-xl mb-4">Error loading room</h2>
        <p className="mb-6">There was a problem loading this trading room.</p>
        <a
          href="/"
          className="bg-[#E74C3C] hover:bg-[#E74C3C]/90 px-4 py-2 rounded"
        >
          Return to Home
        </a>
      </div>
    );
  }
}
