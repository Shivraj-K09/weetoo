"use client";

import { Users, MoreHorizontal, Send, Smile } from "lucide-react";
import { useState } from "react";

export function UserChat() {
  // Sample data
  const usersOnline = 3280;
  const [message, setMessage] = useState("");

  // Sample messages - short and concise like in the reference image
  const messages = [
    {
      id: 1,
      user: "Park View",
      content: "Eat noodles",
      avatar: "PV",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      user: "Park View",
      content: "It's chilly",
      avatar: "PV",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 3,
      user: "Real Investor 101025",
      content: "Let's have pork cutlet",
      avatar: "RI",
      color: "bg-green-100 text-green-600",
    },
    {
      id: 4,
      user: "Harrri",
      content:
        "I admit that I like noodles, I'm going to eat them right away, brother.",
      avatar: "Ha",
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: 5,
      user: "Harrri",
      content: "I'll be back soon",
      avatar: "Ha",
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: 6,
      user: "Park View",
      content: "Nod",
      avatar: "PV",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 7,
      user: "Spinach",
      content: "Jjamppong",
      avatar: "Sp",
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: 8,
      user: "System",
      content:
        "Wind Country 1 liquidated a Bitcoin buy position of +46,578.4894 USDT and earned +40 Bugs.",
      avatar: "",
      color: "bg-emerald-600 text-white",
      isSystem: true,
    },
  ];

  return (
    <section
      aria-label="Global Chat"
      className="w-full rounded-xl border border-gray-200 bg-whitese overflow-hidden"
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
                Users Online: {usersOnline.toLocaleString()}{" "}
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
        {/* Chat messages area - increased height to show more messages */}
        <div className="h-[400px] overflow-y-auto pb-16">
          {/* Messages - compact design with minimal spacing */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`px-4 py-2 ${
                message.isSystem ? "bg-emerald-600 text-white" : ""
              }`}
            >
              {!message.isSystem ? (
                <div className="flex items-start gap-2">
                  {message.avatar && (
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full ${message.color} flex items-center justify-center`}
                    >
                      <span className="text-xs font-medium">
                        {message.avatar}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-0.5">
                      {message.user}
                    </p>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="py-1 text-center">
                  <p className="text-xs">{message.content}</p>
                </div>
              )}
            </div>
          ))}

          {/* Empty space to show scrollability */}
          <div className="h-[50px]"></div>
        </div>

        {/* Input field (user is logged in) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-transparent pt-8">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c74135]/20"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="text-[#c74135] p-1.5 rounded-full hover:bg-[#f8e9e8] transition-colors cursor-pointer">
              <Smile className="h-5 w-5" />
            </button>
            <button className="text-white p-1.5 rounded-full bg-[#c74135] hover:bg-[#b33a2f] transition-colors cursor-pointer">
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Login button - commented out as requested */}
          {/* 
          <button className="w-full bg-[#ffebeb] rounded-full py-3 text-center">
            <span className="text-sm text-[#c74135]">Login to join the conversation</span>
          </button>
          */}
        </div>
      </div>
    </section>
  );
}
