import { AccessToken } from "livekit-server-sdk";
import { v4 as uuidv4 } from "uuid";

// Mock database for rooms - using global variable to persist across API calls
// In a real app, you would use a real database
const globalRooms = global as unknown as {
  rooms?: Record<
    string,
    { name: string; hostIdentity?: string; metadata?: string }
  >;
};

// Initialize rooms if it doesn't exist
if (!globalRooms.rooms) {
  globalRooms.rooms = {};
}

// Get the rooms object from global
const rooms = globalRooms.rooms;

export async function createRoom(name: string): Promise<string> {
  // In a real application, you would call the LiveKit API to create a room
  const roomId = uuidv4().substring(0, 8);

  // Store room in our global mock database
  rooms[roomId] = {
    name,
    metadata: JSON.stringify({ createdAt: new Date().toISOString() }),
  };

  console.log(`Created room ${roomId} with name ${name}`);
  console.log(`Current rooms:`, Object.keys(rooms));

  return roomId;
}

export async function getRoomInfo(roomId: string) {
  // In a real application, you would call the LiveKit API to get room info
  console.log(`Getting room info for ${roomId}`);
  console.log(`Available rooms:`, Object.keys(rooms));

  return rooms[roomId] || null;
}

export async function getRoomParticipants(roomId: string) {
  // In a real application, you would call the LiveKit API to get participants
  console.log(`Getting participants for room ${roomId}`);

  const room = rooms[roomId];

  if (!room || !room.hostIdentity) {
    console.log(`No host found for room ${roomId}`);
    return [];
  }

  console.log(`Found host ${room.hostIdentity} for room ${roomId}`);

  return [
    {
      identity: room.hostIdentity,
      metadata: JSON.stringify({ isHost: true }),
    },
  ];
}

// Update the generateToken function to include more explicit permissions
// Replace the generateToken function with this improved version:

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

  // Store the host identity if this is a host
  if (isHost && rooms[roomId]) {
    rooms[roomId].hostIdentity = participantIdentity;
    // Update metadata to indicate this room has a host
    rooms[roomId].metadata = JSON.stringify({
      isHost: true,
      hostIdentity: participantIdentity,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Set host ${participantIdentity} for room ${roomId}`);
  }

  // Return the token
  return at.toJwt();
}
