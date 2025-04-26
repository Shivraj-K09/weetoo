"use server";

import { AccessToken } from "livekit-server-sdk";
import { createServerClient } from "@/lib/supabase/server";

// Add this function at the top of the file
const logLiveKit = (message: string, ...args: any[]) => {
  console.log(`[LIVEKIT CONSOLE] ${message}`, ...args);
};

// Token generation for LiveKit
// Update the createLivekitToken function with more logging
export async function createLivekitToken(roomId: string, isPublisher = false) {
  try {
    logLiveKit(
      "Creating LiveKit token for room:",
      roomId,
      "isPublisher:",
      isPublisher
    );

    // Get environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const apiUrl = process.env.NEXT_PUBLIC_LIVEKIT_API_URL;

    if (!apiKey || !apiSecret || !apiUrl) {
      logLiveKit("LiveKit API key, secret, or URL is missing");
      console.error("LiveKit API key, secret, or URL is missing");
      return { success: false, message: "Server configuration error" };
    }

    // Check if user is authenticated
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      logLiveKit("Authentication required - no session found");
      return { success: false, message: "Authentication required" };
    }

    const userId = session.user.id;
    logLiveKit("User authenticated:", userId);

    // Fetch user details for display name
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (userError) {
      logLiveKit("Error fetching user data:", userError);
      console.error("Error fetching user data:", userError);
      return { success: false, message: "Failed to fetch user data" };
    }

    // If this is a publisher (host), verify they are the room owner
    if (isPublisher) {
      logLiveKit("Verifying room ownership for publisher");
      const { data: roomData, error: roomError } = await supabase
        .from("trading_rooms")
        .select("owner_id")
        .eq("id", roomId)
        .single();

      if (roomError) {
        logLiveKit("Error fetching room data:", roomError);
        console.error("Error fetching room data:", roomError);
        return { success: false, message: "Failed to fetch room data" };
      }

      logLiveKit("Room owner:", roomData.owner_id, "Current user:", userId);
      if (roomData.owner_id !== userId) {
        logLiveKit("User is not room owner");
        return { success: false, message: "Only room owners can broadcast" };
      }
    }

    // Create display name from user data
    const displayName = `${userData.first_name} ${userData.last_name}`;
    logLiveKit("Creating token for user:", displayName);

    // Create token with appropriate permissions
    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: displayName,
      ttl: 3600 * 24, // 24 hours
    });

    // Add grants to the token with more explicit permissions
    token.addGrant({
      roomJoin: true,
      room: roomId,
      // Explicitly set canPublish based on isPublisher parameter
      canPublish: isPublisher,
      canSubscribe: true,
      canPublishData: true,
    });

    // Generate the JWT token
    const jwt = token.toJwt();

    logLiveKit(
      `Token generated for user ${userId} in room ${roomId}, isPublisher: ${isPublisher}`
    );
    console.log(
      `Token generated for user ${userId} in room ${roomId}, isPublisher: ${isPublisher}`
    );

    return {
      success: true,
      token: jwt,
      identity: userId,
      name: displayName,
    };
  } catch (error) {
    logLiveKit("Error creating LiveKit token:", error);
    console.error("Error creating LiveKit token:", error);
    return { success: false, message: "Failed to create access token" };
  }
}

// Function to get LiveKit token (client-side version)
export async function getLiveKitToken(roomId: string, isPublisher = false) {
  try {
    const result = await createLivekitToken(roomId, isPublisher);
    return result;
  } catch (error) {
    console.error("Error getting LiveKit token:", error);
    return {
      success: false,
      message: "Failed to get token",
      error: String(error),
    };
  }
}
