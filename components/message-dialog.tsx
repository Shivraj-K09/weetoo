"use client";

import { useState, useEffect } from "react";
import { X, Minus, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
}

export function MessageDialog({
  isOpen,
  onClose,
  recipient,
}: MessageDialogProps) {
  const [message, setMessage] = useState("");
  const [saveToSent, setSaveToSent] = useState(true);

  const characterCount = message.length;
  const maxCharacters = 1000;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSubmit = () => {
    // Handle message submission logic here
    console.log({
      recipient,
      message,
      saveToSent,
    });

    // Reset form and close dialog
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-[600px] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#f0f0f0] border-b px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="font-medium text-sm">폭지 쓰기</span>
          </div>
          <div className="flex items-center">
            <button
              className="p-1 hover:bg-gray-300"
              onClick={(e) => e.preventDefault()}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              className="p-1 hover:bg-gray-300"
              onClick={(e) => e.preventDefault()}
            >
              <Square className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-gray-300" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Recipient */}
        <div className="flex items-center border-b p-4">
          <span className="font-bold mr-4">받는사람</span>
          <span>{recipient}</span>
        </div>

        {/* Message area */}
        <div className="p-4">
          <textarea
            className="w-full h-[300px] border rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={maxCharacters}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex items-center gap-2">
            <Checkbox
              id="save-to-sent"
              checked={saveToSent}
              onCheckedChange={(checked) => setSaveToSent(checked as boolean)}
              className="data-[state=checked]:bg-blue-500"
            />
            <label htmlFor="save-to-sent" className="text-sm">
              보낸폭지함에 저장{" "}
              <span className="text-gray-500 text-xs">
                (보낸폭지함에 저장하면 수신확인/철회취소가 가능합니다.)
              </span>
            </label>
          </div>
          <div className="text-sm text-gray-500">
            {characterCount}/{maxCharacters}자
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-2 p-4">
          <Button variant="outline" className="w-24" onClick={onClose}>
            취소
          </Button>
          <Button
            className="w-24 bg-gray-200 hover:bg-gray-300 text-black"
            onClick={handleSubmit}
          >
            보내기
          </Button>
        </div>
      </div>
    </div>
  );
}
