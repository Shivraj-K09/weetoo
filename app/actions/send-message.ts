"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function sendMessage(
  roomId: string,
  userId: string,
  userName: string,
  isHost: boolean,
  message: string
) {
  try {
    if (!message.trim()) {
      return { success: false, error: "Message cannot be empty" };
    }

    const supabase = await createClient();

    // Create a new message object
    const newMessage = {
      id: uuidv4(),
      room_id: roomId,
      user_id: userId,
      user_name: userName,
      is_host: isHost,
      message: message.trim(),
      timestamp: Date.now(),
    };

    // Store the message in Supabase
    const { error } = await supabase
      .from("voice_room_messages")
      .insert(newMessage);

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Error in sendMessage action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
