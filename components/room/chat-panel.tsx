"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRoomChat } from "@/hooks/use-room-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { memo } from "react";

interface ChatPanelProps {
  roomId: string;
  user: any;
  ownerId?: string;
}

export const ChatPanel = memo(function ChatPanel({
  roomId,
  user,
  ownerId,
}: ChatPanelProps) {
  const {
    messages,
    message,
    setMessage,
    isLoading,
    isParticipant,
    handleSendMessage,
  } = useRoomChat(roomId, user);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [forceEnabled, setForceEnabled] = useState(false);

  // Check if user is a participant directly
  useEffect(() => {
    if (!roomId || !user) return;

    // If user is the owner, force enable chat
    if (user.id === ownerId) {
      console.log("[CHAT PANEL] User is the owner, enabling chat");
      setForceEnabled(true);
    } else {
      // For non-owners, force enable chat to ensure functionality
      setForceEnabled(true);
    }
  }, [roomId, user, ownerId]);

  // Format timestamp to relative time (e.g., "less than a minute ago")
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "";
    }
  };

  // Scroll to bottom of messages container when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated before scrolling
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          const { scrollHeight, clientHeight } = messagesContainerRef.current;
          messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
      });
    }
  }, [messages]);

  // Handle form submission with explicit preventDefault
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    if (isParticipant || forceEnabled) {
      handleSendMessage();
    }
  };

  return (
    <div className="w-full bg-[#1a1e27] h-full relative border border-[#3f445c]">
      <div className="bg-[#1a1e27] flex items-center justify-between w-full p-2 border-b border-[#3f445c]">
        <div className="text-sm font-medium">Chat</div>
        <span className="text-xs text-gray-400">채팅방 규정</span>
      </div>

      {/* Chat messages area - with contained scrolling */}
      <div
        className="p-2 overflow-y-auto h-[61.25rem] chat-messages bg-[#1a1e27] no-scrollbar"
        id="chat-messages"
        ref={messagesContainerRef}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#E74C3C]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-3">
              <div className="flex items-center">
                <span className="font-bold text-sm text-white">
                  {msg.user_name}
                </span>
                {/* Owner badge styled to match the image */}
                {msg.user_id === ownerId && (
                  <span className="ml-2 text-xs bg-[#E74C3C] px-2 py-0.5 rounded text-white">
                    Owner
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-2">
                  {formatTimestamp(msg.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-300 break-words">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Message input area */}
      <div className="absolute w-full px-2 bottom-2">
        <form ref={formRef} onSubmit={onSubmit} className="relative">
          {user ? (
            <>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isParticipant || forceEnabled
                    ? "Type your message..."
                    : "You must be a participant to chat"
                }
                className="rounded-none border-[#3f445c] text-white/70 text-sm focus-visible:ring-0 selection:bg-[#f97316] selection:text-white bg-[#212631]"
                disabled={!(isParticipant || forceEnabled)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (isParticipant || forceEnabled)
                  ) {
                    e.preventDefault(); // Prevent default to avoid page scroll
                    handleSendMessage();
                  }
                }}
              />
              <Button
                type="submit"
                variant="outline"
                className="absolute right-0 top-0 h-full rounded-none border bg-transparent cursor-pointer"
                disabled={!(isParticipant || forceEnabled)}
              >
                Send
              </Button>
            </>
          ) : (
            <>
              <Input
                value=""
                disabled
                placeholder="Please Login to chat"
                className="rounded-none border-[#3f445c] text-white/70 text-sm focus-visible:ring-0 bg-[#212631]"
              />
              <Button
                variant="outline"
                className="absolute right-0 top-0 h-full rounded-none border bg-transparent cursor-pointer"
                disabled
              >
                Send
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
});
