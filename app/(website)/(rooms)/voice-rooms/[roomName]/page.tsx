import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { User, Send } from "lucide-react";
import { format } from "date-fns";
import VoiceRoomClient from "@/components/broadcast/voice-room-client";
import { generateToken } from "@/lib/livekit-service";

// Update Props to match Next.js expected PageProps types
type Props = {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  try {
    // Wait for both promises
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { roomName } = resolvedParams;
    const isHost = resolvedSearchParams.host === "true";

    // Extract the UUID properly - UUIDs have a specific format
    // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
    const roomId = roomName.substring(0, 36);

    // Extract the actual room name from the slug (everything after the UUID and hyphen)
    const actualRoomName = roomName.substring(37); // Skip the UUID and the hyphen

    const supabase = await createClient();

    console.log("Fetching voice room with ID:", roomId);
    // Fetch room details with owner information
    const { data: room, error } = await supabase
      .from("trading_rooms")
      .select(
        `
        *,
        owner:owner_id (
          first_name,
          last_name
        )
      `
      )
      .eq("id", roomId)
      .single();

    // If room doesn't exist, redirect to home
    if (error || !room) {
      console.error("Voice room not found or error:", error);
      return redirect("/");
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If room is private, check if user is authenticated and has access
    if (room.room_type === "private" && !session) {
      // For testing purposes, we'll allow access even without authentication
      console.log(
        "Private voice room accessed without authentication - allowing for testing"
      );
      // In production, you would redirect to login:
      // return redirect("/login?redirect=/voice-rooms/" + roomName);
    }

    // Format date function
    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "PPP p");
      } catch (e) {
        return "Invalid date";
      }
    };

    // Calculate listeners count (current participants minus 1 for the host)
    const listenersCount = Math.max(0, room.current_participants - 1);

    // Generate token directly using the livekit-service
    // This is a secure approach as the token is generated on the server
    const livekitToken = await generateToken(roomId, isHost, {
      canSubscribe: true,
      canPublish: isHost,
      canPublishData: true,
      roomJoin: true,
    });

    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
            {/* Main content area - takes up 9/12 (75%) on large screens */}
            <div className="lg:col-span-12 h-full flex flex-col">
              <Card className="h-full border border-gray-200 shadow-none flex flex-col p-0">
                <CardContent className="flex-1 p-0">
                  {/* Voice room client - takes all remaining space */}
                  <div className="h-full">
                    <VoiceRoomClient
                      roomId={roomId}
                      isHost={isHost}
                      token={livekitToken}
                      roomName={room.room_name}
                      isPrivate={room.room_type === "private"}
                      listenersCount={listenersCount}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat sidebar - takes up 3/12 (25%) on large screens */}
            {/* <div className="lg:col-span-3 h-full flex flex-col">
              <Card className="h-full border border-gray-200 shadow-none flex flex-col p-0">
                <div className="border-b border-gray-200 py-4 px-4">
                  <h3 className="text-lg font-medium">
                    Chat with other participants
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 border border-blue-200">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 max-w-[85%] border border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {room.owner
                          ? `${room.owner.first_name} ${room.owner.last_name}`
                          : "Host"}
                      </div>
                      <div className="text-sm">
                        Welcome to the voice room! I'll be discussing{" "}
                        {room.trading_pairs[0]} trading strategies today.
                      </div>
                      <div className="text-xs text-gray-500 mt-1">10:30 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start justify-end">
                    <div className="bg-blue-100 rounded-lg p-2 max-w-[85%] border border-blue-200">
                      <div className="text-xs font-medium text-blue-700 mb-1">
                        You
                      </div>
                      <div className="text-sm">
                        Thanks for hosting! Looking forward to the discussion.
                      </div>
                      <div className="text-xs text-gray-500 mt-1">10:32 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 border border-gray-200">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 max-w-[85%] border border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        Participant
                      </div>
                      <div className="text-sm">
                        What's your take on the recent market movements?
                      </div>
                      <div className="text-xs text-gray-500 mt-1">10:35 AM</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button className="bg-blue-500 text-white p-2 rounded-r-md border border-blue-600">
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </div> */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in voice room page:", error);
    return (
      <div className="h-full flex flex-col items-center justify-center text-white">
        <h2 className="text-xl mb-4">Error loading voice room</h2>
        <p className="mb-6">There was a problem loading this voice room.</p>
        <Link
          href="/"
          className="bg-[#E74C3C] hover:bg-[#E74C3C]/90 px-4 py-2 rounded"
        >
          Return to Home
        </Link>
      </div>
    );
  }
}
