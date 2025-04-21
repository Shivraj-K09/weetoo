"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { User, MessageSquare, Bell, Ban, Flag, X, Send } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Ranking() {
  const [messageDialog, setMessageDialog] = useState({
    visible: false,
    username: "",
  });
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("ranking1");
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rankingTitles = [
    "Top-5 Return Rate Ranking",
    "Top-5 Virtual Money Holding",
    "Top-5 Activity Ranking (XP)",
    "Top-5 Top Sponsored Users (Kor_coins)",
    // "Top-5 Most Followed Users",
  ];

  // Open message dialog
  const openMessageDialog = (username: string) => {
    setMessageDialog({
      visible: true,
      username,
    });

    // Focus the textarea after dialog is visible
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current?.focus?.();
      }
    }, 100);
  };

  // Close message dialog
  const closeMessageDialog = () => {
    setMessageDialog({
      visible: false,
      username: "",
    });
    setMessageText("");
  };

  // Send message
  const sendMessage = () => {
    if (messageText.trim()) {
      // Here you would handle sending the message
      console.log(
        `Sending message to ${messageDialog.username}: ${messageText}`
      );
      closeMessageDialog();
    }
  };

  // Handle Enter key in textarea
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        dialogRef.current?.contains?.(event.target as Node) === false
      ) {
        closeMessageDialog();
      }
    };

    if (messageDialog.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [messageDialog.visible]);

  // Render a single ranking column with a specific title
  const renderRankingColumn = (title: string, index: number) => (
    <div className="overflow-hidden">
      {/* Ranking Header */}
      <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-gradient-to-r dark:border-border from-[#f39c12]/20 to-white dark:bg-gradient-to-r dark:from-[#f39c12]/20 dark:to-background ">
        <span className="text-[#f39c12] mr-1.5">👑</span>
        <h3 className="text-xs font-medium text-gray-700 dark:text-white">
          {title}
        </h3>
        <span className="hidden">{index}</span>
      </div>

      {/* Ranking List with shadcn Context Menu */}
      <div className="overflow-y-auto">
        {[1, 2, 3, 4, 5].map((rank) => (
          <ContextMenu key={rank}>
            <ContextMenuTrigger>
              <div className="flex items-center px-3 py-2 text-xs border-b border-gray-100 dark: last:border-0 hover:bg-gray-50 dark:hover:bg-accent cursor-pointer transition-colors duration-150">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center mr-2.5">
                  <span className="text-white text-[10px] font-medium">
                    {rank}
                  </span>
                </div>
                <div className="flex-1 flex items-center">
                  <span className="text-gray-700 font-medium text-[0.6rem] dark:text-white">
                    나스닥 탑천
                  </span>
                  <span className="text-gray-400 text-[10px] ml-1.5 dark:text-muted-foreground">
                    NASDAQ
                  </span>
                </div>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-44 p-0 overflow-hidden shadow-lg rounded-md border border-gray-200">
              {/* Custom styled header */}
              <div className="bg-gradient-to-r from-[#e74c3c]/90 to-[#e74c3c]/80 text-white px-3 py-2.5">
                <div className="text-sm font-medium truncate">나스닥 탑천</div>
              </div>

              <div className="py-1">
                <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                  <User className="h-3.5 w-3.5 mr-2 text-[#e74c3c]" />
                  <span>프로필 보기</span>
                </ContextMenuItem>

                <ContextMenuItem
                  className="flex items-center px-3 py-2 text-xs cursor-pointer hover:bg-gray-50"
                  onClick={() => openMessageDialog("나스닥 탑천")}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-2 text-[#e74c3c]" />
                  <span>메시지 보내기</span>
                </ContextMenuItem>

                <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                  <Bell className="h-3.5 w-3.5 mr-2 text-[#e74c3c]" />
                  <span>구독하기</span>
                </ContextMenuItem>
              </div>

              <ContextMenuSeparator />

              <div className="bg-gray-50 py-1">
                <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                  <Ban className="h-3.5 w-3.5 mr-2 text-gray-500" />
                  <span>차단하기</span>
                </ContextMenuItem>

                <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer hover:bg-gray-50">
                  <Flag className="h-3.5 w-3.5 mr-2 text-gray-500" />
                  <span>신고하기</span>
                </ContextMenuItem>
              </div>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1168px] border border-gray-200 dark:border-border rounded-md overflow-hidden bg-white dark:bg-background">
      {/* Desktop View - Five column layout */}
      <div className="hidden lg:grid lg:grid-cols-4 divide-x divide-gray-200 dark:divide-border">
        {[0, 1, 2, 3].map((index) => (
          <div key={index}>
            {renderRankingColumn(rankingTitles[index], index)}
          </div>
        ))}
      </div>

      {/* Mobile View - Tab-based layout */}
      <div className="md:hidden">
        <Tabs
          defaultValue="ranking1"
          value={activeTab}
          onValueChange={setActiveTab}
          className="bg-gray-50"
        >
          <TabsList className="grid grid-cols-5 w-full rounded-none border-b border-gray-200">
            {[0, 1, 2, 3, 4].map((index) => (
              <TabsTrigger
                key={index}
                value={`ranking${index + 1}`}
                className="text-xs py-2 px-1 data-[state=active]:bg-white data-[state=active]:text-[#f39c12] data-[state=active]:border-b-2 data-[state=active]:border-[#f39c12] data-[state=active]:shadow-none rounded-none"
              >
                <div className="flex items-center justify-center">
                  <span className="text-[#f39c12] mr-1 text-xs">👑</span>
                  <span className="font-medium truncate">Rank {index + 1}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="ranking1" className="m-0 bg-white border-t-0">
            {renderRankingColumn(rankingTitles[0], 0)}
          </TabsContent>

          <TabsContent value="ranking2" className="m-0 bg-white border-t-0">
            {renderRankingColumn(rankingTitles[1], 1)}
          </TabsContent>

          <TabsContent value="ranking3" className="m-0 bg-white border-t-0">
            {renderRankingColumn(rankingTitles[2], 2)}
          </TabsContent>

          <TabsContent value="ranking4" className="m-0 bg-white border-t-0">
            {renderRankingColumn(rankingTitles[3], 3)}
          </TabsContent>

          <TabsContent value="ranking5" className="m-0 bg-white border-t-0">
            {renderRankingColumn(rankingTitles[4], 4)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Dialog - Responsive */}
      {messageDialog.visible && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div
            ref={dialogRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-[480px] overflow-hidden"
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#e74c3c] to-[#e74c3c]/90 text-white">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <h3 className="font-medium text-sm">메시지 보내기</h3>
              </div>
              <button
                onClick={closeMessageDialog}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-4 sm:p-5">
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1">
                  받는 사람
                </label>
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded border border-gray-200">
                  <User className="h-3.5 w-3.5 text-gray-400 mr-2" />
                  <span className="text-sm">{messageDialog.username}</span>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs text-gray-500 mb-1">
                  메시지
                </label>
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="메시지를 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-200 rounded resize-none h-24 sm:h-32 text-sm focus:outline-none focus:ring-1 focus:ring-[#e74c3c] focus:border-[#e74c3c]"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  Enter 키를 눌러 전송하거나 Shift+Enter로 줄바꿈
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeMessageDialog}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs border border-gray-200 rounded mr-2 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs rounded text-white flex items-center ${
                    messageText.trim()
                      ? "bg-[#e74c3c] hover:bg-[#e74c3c]/90"
                      : "bg-gray-300 cursor-not-allowed"
                  } transition-colors`}
                >
                  <Send className="h-3 w-3 mr-1" />
                  전송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
