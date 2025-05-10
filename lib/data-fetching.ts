import { createServerClient } from "@/lib/supabase/server";

export async function fetchAllRoomData(roomId: string) {
  if (!roomId || !isValidUUID(roomId)) {
    throw new Error(`Invalid room ID format: ${roomId}`);
  }

  const supabase = await createServerClient();

  try {
    // Fetch all data in parallel
    const [roomResponse, participantsResponse, tradingRecordsResponse] =
      await Promise.all([
        // Fetch room data
        supabase.from("trading_rooms").select("*").eq("id", roomId).single(),

        // Fetch participants data - we need to get the participants array first
        supabase
          .from("trading_rooms")
          .select("participants")
          .eq("id", roomId)
          .single()
          .then(async (result) => {
            if (result.error || !result.data?.participants?.length) {
              return { data: [] };
            }

            return supabase
              .from("users")
              .select("id, first_name, last_name, avatar_url")
              .in("id", result.data.participants);
          }),

        // Fetch trading records
        supabase
          .from("trading_records")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

    if (roomResponse.error) {
      console.error(
        `Error fetching room data for ID ${roomId}:`,
        roomResponse.error
      );
      throw new Error(
        `Error fetching room data: ${roomResponse.error.message}`
      );
    }

    return {
      roomData: roomResponse.data,
      participants: participantsResponse.data || [],
      tradingRecords: tradingRecordsResponse.data || [],
    };
  } catch (error) {
    console.error(`Error in fetchAllRoomData for room ID ${roomId}:`, error);
    throw error;
  }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
