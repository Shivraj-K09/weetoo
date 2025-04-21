"use client";

import { useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export function useChat(user: User | null, roomDetails: any) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !roomDetails) return;

    try {
      // In a real app, you would save this to a messages table
      // For now, we'll just add it to the local state
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        user_id: user.id,
        user_name: `${user.first_name} ${user.last_name}`,
        created_at: new Date().toISOString(),
      };

      setMessages([...messages, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return {
    message,
    setMessage,
    messages,
    handleSendMessage,
  };
}
