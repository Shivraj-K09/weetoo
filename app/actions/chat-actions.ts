"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendChatMessage(roomId: string, message: string) {
  try {
    if (!message.trim()) {
      return { success: false, message: "Message cannot be empty" };
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: "You must be logged in to send messages",
      };
    }

    // Call the database function to send the message
    const { data, error } = await supabase.rpc("send_chat_message", {
      p_room_id: roomId,
      p_message: message,
    });

    if (error) {
      console.error("Error sending message:", error);
      return { success: false, message: error.message };
    }

    // Don't revalidate the path to prevent page refresh
    // revalidatePath(`/rooms/${roomId}`)

    return { success: true, messageId: data };
  } catch (error) {
    console.error("Unexpected error in sendChatMessage:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function getChatMessages(roomId: string, limit = 50) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        messages: [],
        message: "You must be logged in to view messages",
      };
    }

    // Fetch messages for the room
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching messages:", error);
      return { success: false, messages: [], message: error.message };
    }

    return { success: true, messages: data.reverse() };
  } catch (error) {
    console.error("Unexpected error in getChatMessages:", error);
    return {
      success: false,
      messages: [],
      message: "An unexpected error occurred",
    };
  }
}
