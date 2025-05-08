"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, type UserProfile } from "@/app/actions/user-actions";
import { formatCurrency } from "@/utils/format-utils";
import { CalendarDays, Mail, User, Users } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FollowButton } from "@/components/follow-button";
import {
  getFollowerCount,
  getFollowingCount,
} from "@/app/actions/follow-actions";
import { createClient } from "@/lib/supabase/client";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [countsLoading, setCountsLoading] = useState(true);
  const [followUpdated, setFollowUpdated] = useState(false);

  // Get current user ID
  useEffect(() => {
    const supabase = createClient();

    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };

    getCurrentUser();
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUserProfile(userId).then((data) => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [userId, isOpen]);

  // Fetch follower and following counts
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchCounts = async () => {
      setCountsLoading(true);
      try {
        const [followerResponse, followingResponse] = await Promise.all([
          getFollowerCount(userId),
          getFollowingCount(userId),
        ]);

        setFollowerCount(followerResponse.success ? followerResponse.count : 0);
        setFollowingCount(
          followingResponse.success ? followingResponse.count : 0
        );
        // Reset the follow updated flag after fetching new counts
        setFollowUpdated(false);
      } catch (error) {
        console.error("Error fetching follow counts:", error);
      } finally {
        setCountsLoading(false);
      }
    };

    // Only fetch counts on initial load or when we need to validate after an optimistic update
    if (countsLoading || followUpdated) {
      fetchCounts();
    }
  }, [userId, isOpen, followUpdated, countsLoading]);

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

  // Handle follow status change with optimistic updates
  const handleFollowChange = (isFollowing: boolean) => {
    // Immediately update the follower count optimistically
    setFollowerCount((prev) =>
      isFollowing ? prev + 1 : Math.max(0, prev - 1)
    );

    // Schedule a validation after a short delay
    setTimeout(() => {
      setFollowUpdated(true);
    }, 2000); // Validate after 2 seconds
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm border-none p-0 shadow-sm">
        <VisuallyHidden>
          <DialogTitle>사용자 프로필</DialogTitle>
        </VisuallyHidden>

        {loading ? (
          <div className="p-6 space-y-8">
            <div className="flex items-start space-x-5 pt-2">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-3 flex-1 pt-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
            <div className="space-y-4 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : profile ? (
          <div>
            {/* Header with avatar and name */}
            <div className="p-6 pt-8 pb-6 space-y-6">
              <div className="flex items-start space-x-5">
                <Avatar className="h-20 w-20 border border-[#e74c3c]/20">
                  <AvatarImage
                    src={profile.avatar_url || ""}
                    alt={profile.nickname || "User"}
                  />
                  <AvatarFallback className="bg-[#e74c3c]/5 text-[#e74c3c] text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3 flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-medium leading-tight">
                        {profile.nickname ||
                          `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
                          "사용자"}
                      </h3>

                      <div className="mt-1.5 flex items-center space-x-2">
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

                    {/* Follow button - only show for other users */}
                    {currentUserId && currentUserId !== userId && (
                      <FollowButton
                        userId={userId}
                        className="h-9 w-24"
                        onFollowChange={handleFollowChange}
                      />
                    )}
                  </div>

                  {/* Level progress */}
                  <div className="pt-1">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        레벨 진행도
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {profile.exp % 10000} / 10000
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e74c3c]/10">
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

              {/* User stats with borders - first row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border p-4">
                  <div className="text-xs text-muted-foreground">코인</div>
                  <div className="mt-1.5 text-lg font-medium">
                    {formatCurrency(profile.kor_coins || 0)}
                  </div>
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="text-xs text-muted-foreground">경험치</div>
                  <div className="mt-1.5 text-lg font-medium">
                    {profile.exp?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              {/* User stats with borders - second row for followers/following */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>팔로워</span>
                  </div>
                  <div className="mt-1.5 text-lg font-medium">
                    {followerCount.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>팔로잉</span>
                  </div>
                  <div className="mt-1.5 text-lg font-medium">
                    {followingCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* User details */}
            <div className="border-t border-border p-6 space-y-4">
              {profile.email && (
                <div>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>이메일</span>
                  </div>
                  <div className="mt-1 text-sm">{profile.email}</div>
                </div>
              )}

              <div>
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>이름</span>
                </div>
                <div className="mt-1 text-sm">
                  {`${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
                    "이름 없음"}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>가입일</span>
                </div>
                <div className="mt-1 text-sm">
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
