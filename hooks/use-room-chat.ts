"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { sendChatMessage, getChatMessages } from "@/app/actions/chat-actions";

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  user_name: string;
  created_at: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

export function useRoomChat(roomId: string, user: User | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Check if user is a participant in the room
  useEffect(() => {
    if (!roomId || !user) return;

    const checkParticipantStatus = async () => {
      try {
        console.log(
          "[ROOM CHAT] Checking if user is a participant in room:",
          roomId
        );
        const { data, error } = await supabase
          .from("trading_rooms")
          .select("participants, owner_id")
          .eq("id", roomId)
          .single();

        if (error) {
          console.error(
            "[ROOM CHAT] Error checking participant status:",
            error
          );
          return;
        }

        const isOwner = data.owner_id === user.id;
        const isInParticipants =
          Array.isArray(data.participants) &&
          data.participants.includes(user.id);

        console.log("[ROOM CHAT] User participant status:", {
          userId: user.id,
          isOwner,
          isInParticipants,
          participants: data.participants,
        });

        setIsParticipant(isOwner || isInParticipants);
      } catch (error) {
        console.error("[ROOM CHAT] Failed to check participant status:", error);
      }
    };

    checkParticipantStatus();

    // Set up a subscription to monitor participant changes
    const participantSubscription = supabase
      .channel(`participant-status:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as any;
          const isOwner = updatedRoom.owner_id === user.id;
          const isInParticipants =
            Array.isArray(updatedRoom.participants) &&
            updatedRoom.participants.includes(user.id);

          console.log("[ROOM CHAT] Participant status updated:", {
            userId: user.id,
            isOwner,
            isInParticipants,
            participants: updatedRoom.participants,
          });

          setIsParticipant(isOwner || isInParticipants);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantSubscription);
    };
  }, [roomId, user]);

  // Fetch initial messages
  useEffect(() => {
    if (!roomId || !user) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        console.log("[ROOM CHAT] Fetching messages for room:", roomId);
        const result = await getChatMessages(roomId);
        if (result.success) {
          console.log("[ROOM CHAT] Messages fetched:", result.messages.length);
          setMessages(result.messages);
        } else {
          console.error("[ROOM CHAT] Error fetching messages:", result.message);
        }
      } catch (error) {
        console.error("[ROOM CHAT] Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [roomId, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!roomId || !user) return;

    // Clean up any existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create a new subscription
    console.log(
      "[ROOM CHAT] Setting up real-time subscription for room:",
      roomId
    );
    const channel = supabase
      .channel(`room-chat:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("[ROOM CHAT] New message received:", payload.new);
          const newMessage = payload.new as ChatMessage;

          // Immediately update the messages state with the new message
          setMessages((prev) => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Scroll to bottom when new message arrives
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `[ROOM CHAT] Subscribed to chat messages for room ${roomId}`
          );
        }
      });

    channelRef.current = channel;

    return () => {
      console.log("[ROOM CHAT] Cleaning up chat subscription");
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message function
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !roomId) return;

    try {
      console.log("[ROOM CHAT] Sending message to room:", roomId);

      if (!isParticipant) {
        console.error("[ROOM CHAT] User is not a participant in this room");
        toast.error("You must be a participant in this room to send messages");
        return;
      }

      // Clear the input immediately for better UX
      const messageToSend = message;
      setMessage("");

      // Optimistically add the message to the UI
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        room_id: roomId,
        user_id: user.id,
        message: messageToSend,
        user_name: `${user.first_name} ${user.last_name}`,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Scroll to bottom immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);

      // Then send the message to the server
      const result = await sendChatMessage(roomId, messageToSend);

      if (!result.success) {
        console.error("[ROOM CHAT] Failed to send message:", result.message);
        toast.error(result.message || "Failed to send message");

        // If the error is about not being a participant, force a check
        if (result.message?.includes("participant")) {
          // Check participant status again
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("participants, owner_id")
            .eq("id", roomId)
            .single();

          if (!error) {
            console.log(
              "[ROOM CHAT] Current room participants:",
              data.participants
            );
            console.log("[ROOM CHAT] User ID:", user.id);
            console.log(
              "[ROOM CHAT] Is user in participants?",
              data.participants.includes(user.id)
            );
          }
        }
      }
    } catch (error) {
      console.error("[ROOM CHAT] Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  return {
    messages,
    message,
    setMessage,
    isLoading,
    isParticipant,
    handleSendMessage,
    messagesEndRef,
  };
}
