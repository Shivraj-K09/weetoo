import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import RoomPage from "@/components/room/room-page";
import { RoomSkeleton } from "@/components/room/room-skeleton";

interface RoomPageProps {
  params: {
    roomName: string;
  };
}

export default async function Page({ params }: RoomPageProps) {
  // Properly handle params by awaiting it
  const { roomName } = await Promise.resolve(params);

  // The roomId is the entire part before the first hyphen that follows the UUID
  // This regex matches a UUID pattern
  const uuidRegex =
    /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = roomName.match(uuidRegex);

  // Extract the room ID (the full UUID)
  const roomId = match ? match[1] : null;

  if (!roomId) {
    console.error("Invalid room ID format:", roomName);
    notFound();
  }

  try {
    // Create a new Supabase client for each request
    const supabase = await createServerClient();

    // Fetch room data
    const { data: roomData, error } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error || !roomData) {
      console.error("Error fetching room:", error);
      notFound();
    }

    return (
      <Suspense fallback={<RoomSkeleton />}>
        <RoomPage roomData={roomData} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in room page:", error);
    notFound();
  }
}

// Disable caching for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;
