"use server";

import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@/lib/supabase/server";

// Token generation for LiveKit
export async function createLivekitToken(roomId: string, isPublisher = false) {
  try {
    // Get environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const apiUrl = process.env.NEXT_PUBLIC_LIVEKIT_API_URL;

    if (!apiKey || !apiSecret || !apiUrl) {
      console.error("LiveKit API key, secret, or URL is missing");
      return { success: false, message: "Server configuration error" };
    }

    // Check if user is authenticated
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Authentication required" };
    }

    const userId = session.user.id;

    // Fetch user details for display name
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return { success: false, message: "Failed to fetch user data" };
    }

    // If this is a publisher (host), verify they are the room owner
    if (isPublisher) {
      const { data: roomData, error: roomError } = await supabase
        .from("trading_rooms")
        .select("owner_id")
        .eq("id", roomId)
        .single();

      if (roomError) {
        console.error("Error fetching room data:", roomError);
        return { success: false, message: "Failed to fetch room data" };
      }

      if (roomData.owner_id !== userId) {
        return { success: false, message: "Only room owners can broadcast" };
      }
    }

    // Create display name from user data
    const displayName = `${userData.first_name} ${userData.last_name}`;

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
      canPublish: isPublisher,
      canSubscribe: true,
      canPublishData: true,
    });

    // Generate the JWT token
    const jwt = token.toJwt();

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
    console.error("Error creating LiveKit token:", error);
    return { success: false, message: "Failed to create access token" };
  }
}
