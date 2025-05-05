"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, type UserProfile } from "@/app/actions/user-actions";
import { formatCurrency } from "@/utils/format-utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface UserProfileDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileDialog({
  userId,
  isOpen,
  onClose,
}: UserProfileDialogProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUserProfile(userId).then((data) => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [userId, isOpen]);

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile) return "?";
    const first = profile.first_name?.charAt(0) || "";
    const last = profile.last_name?.charAt(0) || "";
    return (first + last).toUpperCase() || "?";
  };

  // Calculate XP progress percentage
  const calculateXpProgress = (exp: number) => {
    const xpForNextLevel = 10000;
    const progress = ((exp % xpForNextLevel) / xpForNextLevel) * 100;
    return Math.min(100, progress);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm border-none p-6 shadow-sm">
        <VisuallyHidden>
          <DialogTitle>사용자 프로필</DialogTitle>
        </VisuallyHidden>

        {loading ? (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Header with avatar and name */}
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16 border border-[#e74c3c]/20">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.nickname || "User"}
                />
                <AvatarFallback className="bg-[#e74c3c]/5 text-[#e74c3c]">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 flex-1">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium leading-tight">
                    {profile.nickname ||
                      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
                      "사용자"}
                  </h3>

                  <div className="flex items-center space-x-2">
                    {profile.role && (
                      <span className="inline-flex rounded-sm bg-[#e74c3c]/10 px-2 py-0.5 text-xs font-medium text-[#e74c3c]">
                        {profile.role}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Lv. {Math.floor((profile.exp || 0) / 10000) + 1}
                    </span>
                  </div>
                </div>

                {/* Level progress moved to top */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground mt-2">
                      레벨 진행도
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {profile.exp % 10000} / 10000
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e74c3c]/10">
                    <div
                      className="h-full bg-[#e74c3c] transition-all duration-300"
                      style={{
                        width: `${calculateXpProgress(profile.exp || 0)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator line */}
            <div className="h-px w-full bg-border" />

            {/* User stats with borders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">코인</div>
                <div className="mt-1 text-lg font-medium">
                  {formatCurrency(profile.kor_coins || 0)}
                </div>
              </div>
              <div className="rounded-md border border-border p-3">
                <div className="text-xs text-muted-foreground">경험치</div>
                <div className="mt-1 text-lg font-medium">
                  {profile.exp?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* User details */}
            <div className="space-y-3">
              {profile.email && (
                <div>
                  <div className="text-xs text-muted-foreground">이메일</div>
                  <div className="mt-0.5 text-sm">{profile.email}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-muted-foreground">이름</div>
                <div className="mt-0.5 text-sm">
                  {`${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
                    "이름 없음"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">가입일</div>
                <div className="mt-0.5 text-sm">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              사용자 정보를 불러올 수 없습니다.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
