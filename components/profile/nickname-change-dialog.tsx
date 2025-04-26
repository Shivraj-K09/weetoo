"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useUserStore, useUserActions } from "@/lib/store/user-store";
import { formatNumber } from "@/utils/format-utils";
import { NICKNAME_CHANGE_COST } from "./profile-data";

// Add TypeScript declaration for the window object
declare global {
  interface Window {
    nicknameCheckTimeout?: NodeJS.Timeout;
  }
}

interface NicknameChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNickname: string;
  onNicknameChanged: (newNickname: string) => void;
}

export function NicknameChangeDialog({
  open,
  onOpenChange,
  currentNickname,
  onNicknameChanged,
}: NicknameChangeDialogProps) {
  const [newNickname, setNewNickname] = useState("");
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<
    boolean | null
  >(null);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isChangingNickname, setIsChangingNickname] = useState(false);
  const [hasChangedNickname, setHasChangedNickname] = useState(false);

  const { profile } = useUserStore();
  const { checkNicknameAvailability, changeNickname } = useUserActions();

  useEffect(() => {
    if (open) {
      setNewNickname(currentNickname);
      setIsNicknameAvailable(null);
      setNicknameError(null);

      // Check if user has already changed their nickname
      if (profile) {
        setHasChangedNickname(
          !!profile.nickname &&
            profile.nickname !== profile?.email?.split("@")[0]
        );
      }
    }
  }, [open, currentNickname, profile]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewNickname(value);
    setIsNicknameAvailable(null);
    setNicknameError(null);

    // Clear any existing timeout
    if (window.nicknameCheckTimeout) {
      clearTimeout(window.nicknameCheckTimeout);
      window.nicknameCheckTimeout = undefined;
    }

    // If the input is empty or too short, don't check
    if (!value || value.length < 3) {
      setIsCheckingNickname(false);
      if (value && value.length < 3) {
        setNicknameError("Nickname must be at least 3 characters long.");
      }
      return;
    }

    // Check immediately for exact match with current nickname
    if (value === profile?.nickname) {
      setIsNicknameAvailable(true);
      return;
    }

    // Set checking state and perform check with minimal delay
    setIsCheckingNickname(true);
    checkNicknameAvailabilityHandler(value);
  };

  const checkNicknameAvailabilityHandler = async (nickname: string) => {
    try {
      // Direct database query through the action
      const isAvailable = await checkNicknameAvailability(nickname);

      setIsNicknameAvailable(isAvailable);

      if (!isAvailable) {
        setNicknameError("This nickname is already taken.");
      }
    } catch (error) {
      console.error("Error checking nickname:", error);
      setNicknameError("Failed to check nickname. Try again.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleNicknameChangeSubmit = async () => {
    if (!newNickname || isCheckingNickname || nicknameError) {
      return;
    }

    setIsChangingNickname(true);

    try {
      const result = await changeNickname(newNickname);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onNicknameChanged(newNickname);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(`Error changing nickname: ${error.message}`);
    } finally {
      setIsChangingNickname(false);
    }
  };

  // Check if this is the first nickname change (free) or if user has enough coins
  const isFirstNicknameChange = !hasChangedNickname;
  const hasEnoughCoins = (profile?.kor_coins || 0) >= NICKNAME_CHANGE_COST;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">닉네임 변경</DialogTitle>
          <DialogDescription className="text-center">
            닉네임 변경 비용:{" "}
            {isFirstNicknameChange
              ? "무료"
              : `${NICKNAME_CHANGE_COST.toLocaleString()} Kor_coins`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">현재 닉네임</span>
            <span className="font-medium text-gray-800">
              {profile?.nickname || profile?.email?.split("@")[0] || "user"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">보유 코코인</span>
            <span className="font-bold text-lg">
              {formatNumber(profile?.kor_coins || 0)}
            </span>
          </div>

          {!isFirstNicknameChange && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">닉네임 변경 비용</span>
                <span className="font-medium text-red-500">
                  -{formatNumber(NICKNAME_CHANGE_COST)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">변경 후 잔액</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatNumber(
                    Math.max(
                      0,
                      (profile?.kor_coins || 0) - NICKNAME_CHANGE_COST
                    )
                  )}
                </span>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="new-nickname" className="text-sm font-medium">
                새 닉네임
              </label>
              {isNicknameAvailable === true && (
                <span className="text-xs font-medium text-green-600">
                  코인이 충분합니다
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="new-nickname"
                placeholder="새 닉네임 입력"
                value={newNickname}
                onChange={handleNicknameChange}
                className={cn(
                  "pr-10 focus-visible:ring-[#E63946]",
                  isCheckingNickname && "pr-24 border-blue-300 bg-blue-50/30"
                )}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {isCheckingNickname && (
                  <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-blue-100 animate-spin"></div>
                    Checking...
                  </div>
                )}
                {!isCheckingNickname && isNicknameAvailable === true && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {!isCheckingNickname && isNicknameAvailable === false && (
                  <X className="h-5 w-5 text-red-500" />
                )}
                {!isCheckingNickname &&
                  nicknameError &&
                  nicknameError.includes("Failed to check") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
                      onClick={() =>
                        checkNicknameAvailabilityHandler(newNickname)
                      }
                    >
                      Retry
                    </Button>
                  )}
              </div>
            </div>
            {nicknameError && (
              <p className="text-xs text-red-500">{nicknameError}</p>
            )}
          </div>

          <div className="space-y-2 bg-gray-50 p-3 rounded-md">
            <div className="text-sm font-medium mb-2">닉네임 변경 안내</div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>• The first nickname change is free.</p>
              <p>
                • Subsequent nickname changes cost{" "}
                {NICKNAME_CHANGE_COST.toLocaleString()} kor_coins.
              </p>
              <p>• Nicknames must be unique and cannot be duplicated.</p>
              <p>• Nicknames must be at least 3 characters long.</p>
              <p>• Inappropriate nicknames may be changed by administrators.</p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#E63946] hover:bg-[#D62C39] text-white"
            onClick={handleNicknameChangeSubmit}
            disabled={
              isChangingNickname ||
              !newNickname ||
              isNicknameAvailable === false ||
              (!isFirstNicknameChange && !hasEnoughCoins)
            }
          >
            {isChangingNickname ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                처리 중...
              </div>
            ) : (
              "닉네임 변경"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
