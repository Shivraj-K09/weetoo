"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Forward,
  Mail,
  MoreHorizontal,
  Reply,
  Search,
  Star,
  Trash,
  X,
} from "lucide-react";
import { useState } from "react";
import { messages } from "./profile-data";

export function MessagesTab() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [starredMessages, setStarredMessages] = useState<string[]>([]);

  const filteredMessages = messages.filter(
    (message) =>
      message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  const closeMessageDetail = () => {
    setSelectedMessage(null);
  };

  const toggleStar = (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    setStarredMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}`;
  };

  return (
    <div className="flex h-full bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
      {/* Message List */}
      <div
        className={cn(
          "border-r border-gray-200",
          selectedMessage ? "w-1/3" : "w-full"
        )}
      >
        {/* Search and Tabs */}
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="relative mb-2">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="메세지 검색..."
              className="h-9 pl-9 pr-9 text-sm border-gray-200 focus-visible:ring-0 focus-visible:border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex h-8 bg-white rounded-md border border-gray-200 text-sm divide-x divide-gray-200">
            <button
              className={cn(
                "px-4 h-full flex-1",
                activeTab === "all"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTab("all")}
            >
              전체
            </button>
            <button
              className={cn(
                "px-4 h-full flex-1",
                activeTab === "unread"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTab("unread")}
            >
              안읽음
            </button>
            <button
              className={cn(
                "px-4 h-full flex-1",
                activeTab === "starred"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setActiveTab("starred")}
            >
              즐겨찾기
            </button>
          </div>
        </div>

        {/* Message List */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100% - 85px)" }}
        >
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-4">
              <Mail className="h-5 w-5 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">메세지가 없습니다</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "px-3 py-2 border-b border-gray-100 cursor-pointer transition-all",
                  message.status === "unread"
                    ? "bg-blue-50/30"
                    : "hover:bg-gray-50",
                  selectedMessage?.id === message.id
                    ? "bg-blue-100/40 border-l-2 border-l-blue-500 pl-2.5"
                    : ""
                )}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-1.5">
                      {message.sender}
                    </span>
                    {message.status === "unread" && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">
                      {formatDate(message.date)}
                    </span>
                    <button
                      className={cn(
                        "text-gray-300 hover:text-amber-500 transition-colors",
                        starredMessages.includes(message.id) && "text-amber-500"
                      )}
                      onClick={(e) => toggleStar(e, message.id)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          starredMessages.includes(message.id) &&
                            "fill-amber-500 text-amber-500"
                        )}
                      />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-800 line-clamp-1 mb-0.5">
                  {message.title}
                </div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  안녕하세요, 피터팬입니다. 금일 진행될 무료 강연
                  안내드립니다...
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail */}
      {selectedMessage && (
        <div className="w-2/3 flex flex-col">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 gap-1.5 px-3"
              onClick={closeMessageDetail}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>뒤로</span>
            </Button>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-200"
              >
                <Reply className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-200"
              >
                <Forward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-200"
              >
                <Trash className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-200"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-sm">
                  <DropdownMenuItem>읽음으로 표시</DropdownMenuItem>
                  <DropdownMenuItem>안읽음으로 표시</DropdownMenuItem>
                  <DropdownMenuItem>
                    {starredMessages.includes(selectedMessage.id)
                      ? "즐겨찾기 해제"
                      : "즐겨찾기 추가"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <h2 className="text-base font-medium text-gray-900 mb-3">
              {selectedMessage.title}
            </h2>

            <div className="mb-3 flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {selectedMessage.sender}
                </span>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {selectedMessage.date} {selectedMessage.time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedMessage.type === "important" && (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 text-xs">
                    중요
                  </Badge>
                )}
                {selectedMessage.type === "ad" && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 text-xs">
                    광고
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0",
                    starredMessages.includes(selectedMessage.id)
                      ? "text-amber-500"
                      : "text-gray-400 hover:text-amber-500"
                  )}
                  onClick={(e) => toggleStar(e, selectedMessage.id)}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      starredMessages.includes(selectedMessage.id) &&
                        "fill-amber-500"
                    )}
                  />
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>
                안녕하세요, 피터팬입니다. 금일 진행될 무료 강연 안내드립니다.
              </p>
              <p>
                안녕하세요, 피터팬입니다. 금일 진행될 무료 강연 안내드립니다.
                많은 관심과 참여 부탁드립니다.
              </p>
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-3 mb-3">
                <p className="font-medium text-blue-800 mb-2 flex items-center text-sm">
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  강연 정보
                </p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex">
                    <span className="font-medium w-16">주제:</span>
                    <span>투자 전략과 시장 분석</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-16">일시:</span>
                    <span>
                      {selectedMessage.date} {selectedMessage.time}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-16">장소:</span>
                    <span>온라인 (Zoom)</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-16">참가비:</span>
                    <span>무료</span>
                  </li>
                </ul>
              </div>
              <p>참가를 원하시는 분들은 아래 링크를 통해 신청해주세요.</p>
              <a
                href="#"
                className="text-blue-600 hover:underline inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-md text-sm mt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                https://example.com/seminar
              </a>
              <p className="pt-2">
                감사합니다.
                <br />
                피터팬 드림
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm gap-1.5"
              >
                <Reply className="h-3.5 w-3.5" />
                답장하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
