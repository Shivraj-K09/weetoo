"use client";

import type React from "react";

import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOnlinePresence } from "@/hooks/user-online-presence";
import { supabase } from "@/lib/supabase/client";
import {
  ArrowRight,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Send,
  Smile,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Message = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar?: string;
  user_avatar_color?: string;
  isSystem?: boolean;
};

type UserWithAvatar = {
  id: string;
  avatar_url?: string;
};

// Queue for pending messages
type PendingMessage = {
  id: string; // Unique ID for the pending message
  content: string;
  retryCount: number;
  timestamp: number;
  status: "pending" | "sending" | "failed";
};

export function UserChat() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { onlineUsers, isConnecting } = useOnlinePresence();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const realtimeChannelRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const processingPendingRef = useRef<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userDataRef = useRef<any>(null);
  const messageTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Set up real-time subscription for new messages
  const setupRealtimeSubscription = useCallback(() => {
    // Clean up existing subscription if any
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe();
      realtimeChannelRef.current = null;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    console.log("Setting up realtime subscription for messages");

    try {
      // Create a new subscription with minimal configuration
      realtimeChannelRef.current = supabase
        .channel("chat_messages", {
          config: {
            // Add broadcast and presence recovery options
            broadcast: { self: true },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "global_chat_messages",
          },
          async (payload) => {
            console.log("Received new message:", payload);
            const newMessage = payload.new as Message;

            // Check if we've already processed this message ID
            if (processedMessageIdsRef.current.has(newMessage.id)) {
              console.log("Skipping already processed message:", newMessage.id);
              return;
            }

            // Add this message ID to our processed set
            processedMessageIdsRef.current.add(newMessage.id);

            // Fetch user avatar for the new message if we don't already have it
            if (newMessage.user_id && !userAvatars[newMessage.user_id]) {
              try {
                const { data, error } = await supabase
                  .from("users")
                  .select("avatar_url")
                  .eq("id", newMessage.user_id)
                  .single();

                if (!error && data && data.avatar_url) {
                  setUserAvatars((prev) => ({
                    ...prev,
                    [newMessage.user_id]: data.avatar_url,
                  }));
                }
              } catch (err) {
                console.error("Error fetching user avatar:", err);
              }
            }

            // Add the new message to our state
            setMessages((prevMessages) => {
              // Check if message already exists in the array
              if (prevMessages.some((msg) => msg.id === newMessage.id)) {
                return prevMessages;
              }
              return [...prevMessages, newMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);

          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to messages");
            // Reset retry count on successful subscription
            retryCountRef.current = 0;
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to messages");

            // Retry logic with exponential backoff
            if (retryCountRef.current < 5) {
              const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000);
              console.log(
                `Retrying message subscription in ${delay}ms (attempt ${
                  retryCountRef.current + 1
                })`
              );

              retryTimeoutRef.current = setTimeout(() => {
                retryCountRef.current++;
                setupRealtimeSubscription();
              }, delay);
            }
          } else if (status === "TIMED_OUT") {
            console.error("Channel connection timed out");

            // Retry immediately on timeout
            retryTimeoutRef.current = setTimeout(() => {
              setupRealtimeSubscription();
            }, 1000);
          } else if (status === "CLOSED") {
            console.log("Channel closed, attempting to reconnect");

            // Retry with a short delay
            retryTimeoutRef.current = setTimeout(() => {
              setupRealtimeSubscription();
            }, 2000);
          }
        });
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);

      // Retry after error
      retryTimeoutRef.current = setTimeout(() => {
        setupRealtimeSubscription();
      }, 5000);
    }
  }, [userAvatars]);

  // Function to generate a unique ID for pending messages
  const generatePendingId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9);
  };

  // Function to process pending messages
  const processPendingMessages = async () => {
    if (
      processingPendingRef.current ||
      pendingMessages.length === 0 ||
      !isLoggedIn ||
      !userId
    ) {
      return;
    }

    // Find the next pending message that's not already being sent
    const nextPendingIndex = pendingMessages.findIndex(
      (msg) => msg.status === "pending"
    );
    if (nextPendingIndex === -1) {
      return; // No pending messages to process
    }

    processingPendingRef.current = true;

    try {
      // Get the next pending message
      const pendingMessage = pendingMessages[nextPendingIndex];

      // Update status to sending
      setPendingMessages((prev) =>
        prev.map((msg, i) =>
          i === nextPendingIndex ? { ...msg, status: "sending" } : msg
        )
      );

      console.log(
        `Processing pending message: ${pendingMessage.content} (retry: ${pendingMessage.retryCount})`
      );

      // Set a timeout to mark the message as failed if it takes too long
      if (messageTimeoutsRef.current[pendingMessage.id]) {
        clearTimeout(messageTimeoutsRef.current[pendingMessage.id]);
      }

      messageTimeoutsRef.current[pendingMessage.id] = setTimeout(() => {
        console.log(`Message send timeout for: ${pendingMessage.id}`);
        setPendingMessages((prev) =>
          prev.map((msg) =>
            msg.id === pendingMessage.id ? { ...msg, status: "failed" } : msg
          )
        );
        delete messageTimeoutsRef.current[pendingMessage.id];
        processingPendingRef.current = false;
      }, 10000); // 10 second timeout

      // Ensure we have user data
      if (!userDataRef.current) {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name, avatar_url")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user data for pending message:", error);

          // Mark message as failed
          setPendingMessages((prev) =>
            prev.map((msg) =>
              msg.id === pendingMessage.id
                ? { ...msg, status: "failed", retryCount: msg.retryCount + 1 }
                : msg
            )
          );

          // Clear the timeout
          if (messageTimeoutsRef.current[pendingMessage.id]) {
            clearTimeout(messageTimeoutsRef.current[pendingMessage.id]);
            delete messageTimeoutsRef.current[pendingMessage.id];
          }

          processingPendingRef.current = false;
          return;
        }

        userDataRef.current = data;
      }

      // Generate avatar text and color
      const userData = userDataRef.current;
      const avatarText =
        userData.first_name.charAt(0) +
        (userData.last_name ? userData.last_name.charAt(0) : "");

      // List of possible colors
      const colors = [
        "bg-blue-100 text-blue-600",
        "bg-green-100 text-green-600",
        "bg-amber-100 text-amber-600",
        "bg-purple-100 text-purple-600",
        "bg-pink-100 text-pink-600",
        "bg-indigo-100 text-indigo-600",
      ];

      // Select a color based on user ID
      const colorIndex =
        userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;
      const avatarColor = colors[colorIndex];

      // Insert message
      const { data: insertedMessage, error: insertError } = await supabase
        .from("global_chat_messages")
        .insert({
          user_id: userId,
          content: pendingMessage.content,
          user_name: `${userData.first_name} ${
            userData.last_name || ""
          }`.trim(),
          user_avatar: avatarText,
          user_avatar_color: avatarColor,
        })
        .select();

      // Clear the timeout
      if (messageTimeoutsRef.current[pendingMessage.id]) {
        clearTimeout(messageTimeoutsRef.current[pendingMessage.id]);
        delete messageTimeoutsRef.current[pendingMessage.id];
      }

      if (insertError) {
        console.error("Error sending pending message:", insertError);

        // If we've tried too many times, mark as failed but keep in the list
        if (pendingMessage.retryCount >= 2) {
          setPendingMessages((prev) =>
            prev.map((msg) =>
              msg.id === pendingMessage.id
                ? { ...msg, status: "failed", retryCount: msg.retryCount + 1 }
                : msg
            )
          );
          toast.error("Failed to send message after multiple attempts");
        } else {
          // Increment retry count and mark as pending again for retry
          setPendingMessages((prev) =>
            prev.map((msg) =>
              msg.id === pendingMessage.id
                ? { ...msg, status: "pending", retryCount: msg.retryCount + 1 }
                : msg
            )
          );
        }

        processingPendingRef.current = false;
        return;
      }

      // Update avatar map if needed
      if (userData.avatar_url && !userAvatars[userId]) {
        setUserAvatars((prev) => ({
          ...prev,
          [userId]: userData.avatar_url,
        }));
      }

      // Message sent successfully, remove from pending list
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.id !== pendingMessage.id)
      );

      // Add the message to the local state
      if (insertedMessage && insertedMessage.length > 0) {
        const newMessage = insertedMessage[0] as Message;

        // Add this message ID to our processed set to prevent duplication
        processedMessageIdsRef.current.add(newMessage.id);

        setMessages((prevMessages) => {
          // Check if message already exists in the array
          if (prevMessages.some((msg) => msg.id === newMessage.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      }
    } catch (error) {
      console.error("Error processing pending message:", error);

      // Mark the current message as failed
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.status === "sending" ? { ...msg, status: "failed" } : msg
        )
      );
    } finally {
      processingPendingRef.current = false;
    }
  };

  // Retry a failed message
  const retryMessage = (messageId: string) => {
    setPendingMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "pending" } : msg
      )
    );

    // Start processing if not already
    if (!processingPendingRef.current) {
      processPendingMessages();
    }
  };

  // Cancel a failed or pending message
  const cancelMessage = (messageId: string) => {
    setPendingMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // Clear any timeout for this message
    if (messageTimeoutsRef.current[messageId]) {
      clearTimeout(messageTimeoutsRef.current[messageId]);
      delete messageTimeoutsRef.current[messageId];
    }
  };

  // Watch for pending messages and process them
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        pendingMessages.some((msg) => msg.status === "pending") &&
        !processingPendingRef.current
      ) {
        processPendingMessages();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingMessages]);

  // Fetch initial messages and set up real-time subscription
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);

        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        const isAuthenticated = !!sessionData.session;
        setIsLoggedIn(isAuthenticated);

        if (isAuthenticated && sessionData.session) {
          setUserId(sessionData.session.user.id);

          // Pre-fetch user data
          try {
            const { data, error } = await supabase
              .from("users")
              .select("first_name, last_name, avatar_url")
              .eq("id", sessionData.session.user.id)
              .single();

            if (!error && data) {
              userDataRef.current = data;
            }
          } catch (err) {
            console.error("Error pre-fetching user data:", err);
          }
        }

        // Fetch the most recent messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("global_chat_messages")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          return;
        }

        // Reverse to show oldest first
        const sortedMessages = messagesData.reverse();

        // Add all fetched message IDs to our processed set
        sortedMessages.forEach((msg) => {
          processedMessageIdsRef.current.add(msg.id);
        });

        setMessages(sortedMessages);

        // Extract unique user IDs from messages
        const userIds = [...new Set(sortedMessages.map((msg) => msg.user_id))];

        // Fetch avatars for these users
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, avatar_url")
            .in("id", userIds);

          if (usersError) {
            console.error("Error fetching user avatars:", usersError);
          } else if (usersData) {
            // Create a map of user_id to avatar_url
            const avatarMap: Record<string, string> = {};
            usersData.forEach((user: UserWithAvatar) => {
              if (user.avatar_url) {
                avatarMap[user.id] = user.avatar_url;
              }
            });
            setUserAvatars(avatarMap);
          }
        }

        // Set up realtime subscription after fetching initial data
        setupRealtimeSubscription();
      } catch (error) {
        console.error("Error in chat initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);

          // Reset user data
          userDataRef.current = null;
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setUserId(null);
          userDataRef.current = null;
        }
      }
    );

    // Cleanup function
    return () => {
      console.log("Cleaning up chat resources");

      if (realtimeChannelRef.current) {
        try {
          realtimeChannelRef.current.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing from channel:", error);
        }
        realtimeChannelRef.current = null;
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Clear all message timeouts
      Object.values(messageTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
      messageTimeoutsRef.current = {};

      if (authListener?.subscription) {
        try {
          authListener.subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing from auth listener:", error);
        }
      }
    };
  }, []);

  // Add this new effect to handle visibility changes
  // Add this after the other useEffect hooks
  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab is now visible, checking connection status");

        // Check if we need to reconnect
        if (realtimeChannelRef.current) {
          try {
            // Try to ping the channel to see if it's still alive
            const status = realtimeChannelRef.current.state;
            console.log("Current channel status:", status);

            if (status !== "SUBSCRIBED") {
              console.log("Channel not in SUBSCRIBED state, reconnecting");
              setupRealtimeSubscription();
            }
          } catch (error) {
            console.error("Error checking channel status:", error);
            // If there's any error, just reconnect
            setupRealtimeSubscription();
          }
        } else {
          // No channel reference, create a new one
          console.log("No channel reference, creating new subscription");
          setupRealtimeSubscription();
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up a periodic connection check when the tab is visible
    const intervalId = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        realtimeChannelRef.current
      ) {
        try {
          const status = realtimeChannelRef.current.state;
          if (status !== "SUBSCRIBED") {
            console.log(
              "Periodic check: Channel not in SUBSCRIBED state, reconnecting"
            );
            setupRealtimeSubscription();
          }
        } catch (error) {
          console.error("Error in periodic channel check:", error);
          setupRealtimeSubscription();
        }
      }
    }, 60000); // Check every minute

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [setupRealtimeSubscription]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Only scroll if container exists and we have messages
    if (messagesContainerRef.current && messages.length > 0) {
      // Scroll the container to the bottom
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, pendingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !isLoggedIn || !userId || isSending) return;

    const messageContent = message.trim();

    // Clear input field immediately for better UX
    setMessage("");

    // Create a new pending message with unique ID
    const newPendingMessage: PendingMessage = {
      id: generatePendingId(),
      content: messageContent,
      retryCount: 0,
      timestamp: Date.now(),
      status: "pending",
    };

    // Add to pending messages
    setPendingMessages((prev) => [...prev, newPendingMessage]);

    // Show temporary sending state
    setIsSending(true);

    // Start processing the queue if not already processing
    if (!processingPendingRef.current) {
      processPendingMessages();
    }

    // Reset sending state after a short delay
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  // Format the message data for display
  const formatMessages = (messages: Message[]) => {
    return messages.map((msg) => {
      // Check if it's a system message (you can add criteria here)
      const isSystem = msg.user_name === "System";

      // Format the timestamp
      const messageDate = new Date(msg.created_at);
      const formattedTime = messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: msg.id,
        userId: msg.user_id,
        user: msg.user_name,
        content: msg.content,
        avatar: msg.user_avatar || "",
        avatarUrl: userAvatars[msg.user_id] || "",
        color: msg.user_avatar_color || "bg-gray-100 text-gray-600",
        isSystem,
        time: formattedTime,
      };
    });
  };

  const displayMessages = formatMessages(messages);

  // Handle emoji selection
  // const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
  //   setMessage((prev) => prev + emoji);
  //   setIsOpen(false);
  // };

  return (
    <section
      aria-label="Global Chat"
      className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-border"
    >
      {/* Chat header */}
      <header className="bg-[#c74135] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-full p-1">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Global Chat</h3>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <p className="text-xs text-white/80">
                Users Online:{" "}
                {isConnecting
                  ? "Connecting..."
                  : onlineUsers.toLocaleString()}{" "}
              </p>
            </div>
          </div>
        </div>
        <button className="text-white/80 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* Chat content */}
      <div className="relative">
        {/* Chat messages area */}
        <div
          ref={messagesContainerRef}
          className="h-[400px] overflow-y-auto pb-16 scroll-smooth bg-background"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-gray-400">
                Loading messages...
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-2 ${
                    message.isSystem ? "bg-emerald-600" : ""
                  }`}
                >
                  {!message.isSystem ? (
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden">
                        {message.avatarUrl ? (
                          <Image
                            src={message.avatarUrl || "/placeholder.svg"}
                            alt={`${message.user}'s avatar`}
                            width={24}
                            height={24}
                            className="h-6 w-6 object-cover"
                          />
                        ) : (
                          <div
                            className={`h-full w-full ${message.color} flex items-center justify-center`}
                          >
                            <span className="text-xs font-medium">
                              {message.avatar}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs text-gray-500">
                            {message.user}
                          </p>
                          <span className="text-xs text-gray-400">
                            {message.time}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-1 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-xs">{message.content}</p>
                        <span className="text-xs opacity-80">
                          {message.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pending messages */}
              {pendingMessages.map((pendingMsg) => (
                <div key={pendingMsg.id} className="px-4 py-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500">
                        ...
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs text-gray-400">
                          {pendingMsg.status === "sending"
                            ? "Sending..."
                            : pendingMsg.status === "failed"
                              ? "Failed to send"
                              : "Pending..."}
                        </p>
                        {pendingMsg.status === "failed" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => retryMessage(pendingMsg.id)}
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                            >
                              <RefreshCw className="h-3 w-3" /> Retry
                            </button>
                            <button
                              onClick={() => cancelMessage(pendingMsg.id)}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {pendingMsg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input field or login button based on auth state */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-transparent pt-8 dark:bg-gradient-to-t dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
          {isLoggedIn ? (
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-gray-100 dark:bg-background border dark:border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c74135]/20 dark:placeholder:text-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
              />

              <Popover onOpenChange={setIsOpen} open={isOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-[#c74135] p-1.5 rounded-full hover:bg-[#f8e9e8] transition-colors cursor-pointer"
                    disabled={isSending}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0">
                  <EmojiPicker
                    className="h-[342px]"
                    onEmojiSelect={({ emoji }) => {
                      setMessage((prev) => prev + emoji);
                      setIsOpen(false);
                    }}
                  >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                  </EmojiPicker>
                </PopoverContent>
              </Popover>

              <button
                type="submit"
                className="p-1.5 rounded-full bg-[#c74135] hover:bg-[#b33a2f] transition-colors cursor-pointer disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!message.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          ) : (
            <button
              className="w-full bg-[#ffebeb] rounded-full py-3 text-center group hover:bg-[#fde2e2] transition-colors"
              onClick={() => router.push("/login")}
            >
              <span className="text-sm text-[#c74135] flex items-center justify-center gap-1.5">
                Login to join the conversation
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
