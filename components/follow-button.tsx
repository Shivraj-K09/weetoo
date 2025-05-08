"use client";

import { useState, useEffect, useRef } from "react";
import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "@/app/actions/follow-actions";
import { UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  className,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const actionInProgress = useRef(false);

  // Fetch initial follow status
  useEffect(() => {
    if (!userId) return;

    const fetchFollowStatus = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getFollowStatus(userId);
        if (response.success) {
          setIsFollowing(response.isFollowing);
        } else {
          console.error("Error fetching follow status:", response.error);
          setError(response.error || "Failed to check follow status");
        }
      } catch (err) {
        console.error("Unexpected error checking follow status:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowStatus();
  }, [userId]);

  // Handle follow/unfollow action with optimistic updates
  const handleFollowAction = async () => {
    if (actionInProgress.current || !userId) return;
    actionInProgress.current = true;
    setError(null);

    const currentFollowState = isFollowing;
    const newFollowState = !currentFollowState;
    setIsFollowing(newFollowState);

    if (onFollowChange) {
      onFollowChange(newFollowState);
    }

    try {
      const response = newFollowState
        ? await followUser(userId)
        : await unfollowUser(userId);

      if (!response.success) {
        console.error("Error with follow action:", response.error);
        setError(
          response.error ||
            `Failed to ${newFollowState ? "follow" : "unfollow"} user`
        );
        setIsFollowing(currentFollowState);

        if (onFollowChange) {
          onFollowChange(currentFollowState);
        }
      }
    } catch (err) {
      console.error("Unexpected error with follow action:", err);
      setError("An unexpected error occurred");
      setIsFollowing(currentFollowState);

      if (onFollowChange) {
        onFollowChange(currentFollowState);
      }
    } finally {
      actionInProgress.current = false;
    }
  };

  if (isLoading) {
    return (
      <div className="inline-block h-9 w-[120px] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleFollowAction}
        disabled={actionInProgress.current}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          minWidth: "120px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
        className={cn(
          "inline-flex items-center justify-center h-9 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
          isFollowing
            ? isHovering
              ? "bg-red-50 text-red-500 border border-red-100" // Hover state when following
              : "bg-white text-gray-700 border border-gray-200" // Normal following state
            : "bg-[#e74c3c] text-white hover:bg-[#d44235]", // Not following state
          className
        )}
        aria-label={isFollowing ? "Unfollow user" : "Follow user"}
      >
        <div className="px-3 flex items-center justify-center">
          {isFollowing ? (
            isHovering ? (
              <span>Unfollow</span>
            ) : (
              <div className="flex items-center justify-center">
                <UserCheck className="h-4 w-4 mr-3" />
                <span>Following</span>
              </div>
            )
          ) : (
            <span>Follow</span>
          )}
        </div>
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
