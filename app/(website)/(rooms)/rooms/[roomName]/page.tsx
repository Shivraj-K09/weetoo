import TradingRoomPage from "@/components/room/room-page";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { redirect } from "next/navigation";

// Update Props to match Next.js expected PageProps types
type Props = {
  params: Promise<{ roomName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params }: Props) {
  try {
    // Wait for both promises
    const resolvedParams = await params;
    // const resolvedSearchParams = await searchParams;
    const { roomName } = resolvedParams;

    // Extract the UUID properly - UUIDs have a specific format
    // A UUID is in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)
    const roomId = roomName.substring(0, 36);

    const supabase = await createClient();

    console.log("Fetching room with ID:", roomId);
    // Fetch room details
    const { data: room, error } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    // If room doesn't exist, redirect to home
    if (error || !room) {
      console.error("Room not found or error:", error);
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
        "Private room accessed without authentication - allowing for testing"
      );
      // In production, you would redirect to login:
      // return redirect("/login?redirect=/rooms/" + roomName);
    }

    return <TradingRoomPage roomData={room} />;
  } catch (error) {
    console.error("Error in room page:", error);
    return (
      <div className="h-full flex flex-col items-center justify-center text-white">
        <h2 className="text-xl mb-4">Error loading room</h2>
        <p className="mb-6">There was a problem loading this trading room.</p>
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
