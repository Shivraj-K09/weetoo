import { Suspense } from "react";
import { notFound } from "next/navigation";
import RoomPage from "@/components/room/room-page";
import { RoomSkeleton } from "@/components/room/room-skeleton";
import { fetchAllRoomData } from "@/lib/data-fetching";

interface RoomPageProps {
  params: {
    roomName: string;
  };
}

export default async function Page({ params }: RoomPageProps) {
  // Properly handle params
  const roomName = params.roomName;

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
    // Fetch all room data in parallel using our optimized function
    const { roomData, participants, tradingRecords } =
      await fetchAllRoomData(roomId);

    return (
      <Suspense fallback={<RoomSkeleton />}>
        <RoomPage
          roomData={roomData}
          initialParticipants={participants}
          initialTradingRecords={tradingRecords}
        />
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
