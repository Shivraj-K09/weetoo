import { useState, useEffect, useRef } from "react";
import { User, MessageSquare, Bell, Ban, Flag, X, Send } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function Ranking() {
  const [messageDialog, setMessageDialog] = useState({
    visible: false,
    username: "",
  });
  const [messageText, setMessageText] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  return (
    <div className="w-[1168px] border border-gray-200 rounded-md overflow-hidden bg-white mt-4">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {[1, 2, 3, 4].map((section) => (
          <div key={section} className="overflow-hidden">
            {/* Ranking Header */}
            <div className="flex items-center px-3 py-1.5 border-b border-gray-200 bg-gradient-to-r from-[#f39c12]/20 to-white">
              <span className="text-[#f39c12] mr-1">👑</span>
              <h3 className="text-xs font-medium text-gray-700">
                일간 수익률 순위 TOP5
              </h3>
            </div>

            {/* Ranking List with shadcn Context Menu */}
            <div className="overflow-y-auto">
              {[1, 2, 3, 4, 5].map((rank) => (
                <ContextMenu key={rank}>
                  <ContextMenuTrigger>
                    <div className="flex items-center px-3 py-1.5 text-xs border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center mr-2">
                        <span className="text-white text-[10px]">{rank}</span>
                      </div>
                      <div className="flex-1 flex items-center">
                        <span className="text-gray-700">나스닥 탑천</span>
                        <span className="text-gray-400 text-[10px] ml-1">
                          NASDAQ
                        </span>
                      </div>
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-44 p-0 overflow-hidden">
                    {/* Custom styled header */}
                    <div className="bg-gradient-to-r from-[#e74c3c]/90 to-[#e74c3c]/80 text-white px-3 py-2">
                      <div className="text-sm font-medium truncate">
                        나스닥 탑천
                      </div>
                    </div>

                    <div className="py-1">
                      <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer">
                        <User className="h-3 w-3 mr-2 text-[#e74c3c]" />
                        <span>프로필 보기</span>
                      </ContextMenuItem>

                      <ContextMenuItem
                        className="flex items-center px-3 py-2 text-xs cursor-pointer"
                        onClick={() => openMessageDialog("나스닥 탑천")}
                      >
                        <MessageSquare className="h-3 w-3 mr-2 text-[#e74c3c]" />
                        <span>메시지 보내기</span>
                      </ContextMenuItem>

                      <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer">
                        <Bell className="h-3 w-3 mr-2 text-[#e74c3c]" />
                        <span>구독하기</span>
                      </ContextMenuItem>
                    </div>

                    <ContextMenuSeparator />

                    <div className="bg-gray-50 py-1">
                      <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer">
                        <Ban className="h-3 w-3 mr-2 text-gray-500" />
                        <span>차단하기</span>
                      </ContextMenuItem>

                      <ContextMenuItem className="flex items-center px-3 py-2 text-xs cursor-pointer">
                        <Flag className="h-3 w-3 mr-2 text-gray-500" />
                        <span>신고하기</span>
                      </ContextMenuItem>
                    </div>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Message Dialog - Now more rectangular */}
      {messageDialog.visible && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div
            ref={dialogRef}
            className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden"
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
            <div className="p-5">
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
                  className="w-full px-3 py-2 border border-gray-200 rounded resize-none h-32 text-sm focus:outline-none focus:ring-1 focus:ring-[#e74c3c] focus:border-[#e74c3c]"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">
                  Enter 키를 눌러 전송하거나 Shift+Enter로 줄바꿈
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeMessageDialog}
                  className="px-4 py-2 text-xs border border-gray-200 rounded mr-2 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  className={`px-4 py-2 text-xs rounded text-white flex items-center ${
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
