"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const channelRef = useRef<any>(null);
  const messageIdSetRef = useRef(new Set<string>());
  const participantCheckAttempts = useRef(0);
  const maxParticipantCheckAttempts = 5;

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

          // If we've tried too many times, give up
          if (participantCheckAttempts.current >= maxParticipantCheckAttempts) {
            console.error(
              "[ROOM CHAT] Failed to check participant status after multiple attempts"
            );
            return;
          }

          // Otherwise, try again after a delay
          participantCheckAttempts.current++;
          setTimeout(checkParticipantStatus, 2000);
          return;
        }

        const isOwner = data.owner_id === user.id;

        // Ensure participants is always treated as an array
        const participantsArray = Array.isArray(data.participants)
          ? data.participants
          : [];
        const isInParticipants = participantsArray.includes(user.id);

        console.log("[ROOM CHAT] User participant status:", {
          userId: user.id,
          isOwner,
          isInParticipants,
          participants: participantsArray,
        });

        // Always set the owner as a participant
        if (isOwner) {
          setIsParticipant(true);
          return;
        }

        // If the user is in the participants array, they're a participant
        setIsParticipant(isInParticipants);

        // If user is not a participant but should be, try to fix it
        if (!isInParticipants && user.id) {
          console.log(
            "[ROOM CHAT] User not in participants list, checking join status..."
          );

          // Check if user has joined the room via the join_room_history table
          const { data: joinData, error: joinError } = await supabase
            .from("join_room_history")
            .select("*")
            .eq("room_id", roomId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (!joinError && joinData && joinData.length > 0) {
            console.log(
              "[ROOM CHAT] User has joined this room before, treating as participant"
            );
            setIsParticipant(true);
          }
        }
      } catch (error) {
        console.error("[ROOM CHAT] Failed to check participant status:", error);

        // If we've tried too many times, give up
        if (participantCheckAttempts.current >= maxParticipantCheckAttempts) {
          console.error(
            "[ROOM CHAT] Failed to check participant status after multiple attempts"
          );
          return;
        }

        // Otherwise, try again after a delay
        participantCheckAttempts.current++;
        setTimeout(checkParticipantStatus, 2000);
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

          // Ensure participants is always treated as an array
          const participantsArray = Array.isArray(updatedRoom.participants)
            ? updatedRoom.participants
            : [];
          const isInParticipants = participantsArray.includes(user.id);

          console.log("[ROOM CHAT] Participant status updated:", {
            userId: user.id,
            isOwner,
            isInParticipants,
            participants: participantsArray,
          });

          // Always set the owner as a participant
          if (isOwner) {
            setIsParticipant(true);
            return;
          }

          setIsParticipant(isInParticipants);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantSubscription);
    };
  }, [roomId, user]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;

      setIsLoading(true);
      try {
        console.log("[ROOM CHAT] Fetching messages for room:", roomId);
        const result = await getChatMessages(roomId);
        if (result.success) {
          console.log("[ROOM CHAT] Messages fetched:", result.messages.length);

          // Update the message ID set with existing messages
          const messageIdSet = new Set<string>();
          result.messages.forEach((msg) => messageIdSet.add(msg.id));
          messageIdSetRef.current = messageIdSet;

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
  }, [roomId]);

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

          // Check if we've already seen this message
          if (!messageIdSetRef.current.has(newMessage.id)) {
            messageIdSetRef.current.add(newMessage.id);

            // Update messages without causing a full re-render of parent components
            setMessages((prev) => [...prev, newMessage]);
          }
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

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
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
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        room_id: roomId,
        user_id: user.id,
        message: messageToSend,
        user_name: `${user.first_name} ${user.last_name}`,
        created_at: new Date().toISOString(),
      };

      // Add to the message ID set to prevent duplication
      messageIdSetRef.current.add(optimisticId);

      setMessages((prev) => [...prev, optimisticMessage]);

      // Then send the message to the server
      const result = await sendChatMessage(roomId, messageToSend);

      if (!result.success) {
        console.error("[ROOM CHAT] Failed to send message:", result.message);
        toast.error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("[ROOM CHAT] Error sending message:", error);
      toast.error("Failed to send message");
    }
  }, [message, user, roomId, isParticipant]);

  return {
    messages,
    message,
    setMessage,
    isLoading,
    isParticipant,
    handleSendMessage,
  };
}
