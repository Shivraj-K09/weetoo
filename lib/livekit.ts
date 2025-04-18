import { AccessToken } from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";

export async function generateToken(
  roomId: string,
  isHost: boolean,
  additionalPermissions: {
    canSubscribe?: boolean;
    canPublish?: boolean;
    canPublishData?: boolean;
    roomJoin?: boolean;
  } = {}
): Promise<string> {
  // Get API key and secret from environment variables
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API key and secret must be provided");
  }

  // Create a new token with a unique identity
  const participantIdentity = uuidv4();

  // Create an access token
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    // Add metadata to help with debugging
    metadata: JSON.stringify({
      isHost: isHost,
      createdAt: new Date().toISOString(),
    }),
  });

  // Add grants to the token with more permissions
  at.addGrant({
    room: roomId,
    roomJoin: additionalPermissions.roomJoin ?? true,
    canPublish: additionalPermissions.canPublish ?? isHost, // Allow all participants to publish (though UI will restrict non-hosts)
    canSubscribe: additionalPermissions.canSubscribe ?? true, // Everyone can subscribe
    canPublishData: additionalPermissions.canPublishData ?? true, // Allow data publishing for chat
    roomAdmin: isHost, // Make host the room admin
    roomList: true, // Allow listing rooms
  });

  // Return the token
  return at.toJwt();
}
