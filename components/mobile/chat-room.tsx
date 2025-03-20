"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatsCircle } from "@phosphor-icons/react/dist/ssr";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatRoom() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "안녕하세요! 무엇을 도와드릴까요?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (inputValue.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages([...messages, newUserMessage]);
      setInputValue("");

      // Simulate response after a short delay
      setTimeout(() => {
        const newBotMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "메시지를 받았습니다. 곧 답변 드리겠습니다.",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newBotMessage]);
      }, 1000);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-[#E84C3D] text-white px-4 py-1.5 rounded-md shadow-lg z-50 flex items-center justify-center hover:bg-[#d13c2d] transition-colors"
      >
        <ChatsCircle size={24} className="mr-1.5" />
        <span className="text-xs">채팅</span>
      </button>

      {/* Chat window with AnimatePresence for smooth exit animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-17 right-6 w-86 bg-white rounded-lg shadow-xl z-50 flex flex-col h-[38rem]"
            style={{ maxHeight: "70vh" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="flex items-center justify-between p-3 bg-[#1A1E27] text-white rounded-t-lg">
              <h3 className="font-medium">채팅</h3>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-blue-700 rounded-full p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#212631]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[80%] p-2 rounded-lg",
                    message.isUser
                      ? "bg-blue-600 text-white ml-auto rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 block mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-[#1A1E27] p-3 flex gap-2 bg-[#212631]"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-white text-black"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send size={16} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
