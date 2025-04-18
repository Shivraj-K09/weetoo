"use client";

import { togglePostLike } from "@/app/actions/like-actions";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
}

export function LikeButton({
  postId,
  initialLikeCount,
  initialLiked,
  isLoggedIn,
  isAuthor,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset state when props change
  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialLiked);
  }, [initialLikeCount, initialLiked]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to like posts");
      return;
    }

    if (isAuthor) {
      toast.error("You cannot like your own post");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      // Optimistically update UI
      const newLikeStatus = !isLiked;
      setIsLiked(newLikeStatus);
      setLikeCount((prevCount) =>
        newLikeStatus ? prevCount + 1 : Math.max(0, prevCount - 1)
      );

      if (newLikeStatus) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }

      // Call server action
      const result = await togglePostLike(postId);

      if (result.error) {
        // Revert optimistic update if there was an error
        setIsLiked(!newLikeStatus);
        setLikeCount((prevCount) =>
          !newLikeStatus ? prevCount + 1 : Math.max(0, prevCount - 1)
        );
        toast.error(result.error);
      } else if (newLikeStatus) {
        // Show toast notification for points when liking (not when unliking)
        toast.success(
          "You earned 50 EXP and 25 KOR Coins for liking this post!",
          {
            duration: 3000,
            position: "bottom-right",
          }
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Hint label={isAuthor ? "You cannot like your own post" : ""}>
      <Button
        onClick={isAuthor ? undefined : handleLike}
        disabled={isLoading}
        variant="ghost"
        size="lg"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
          isLiked
            ? "bg-pink-50 text-pink-500 hover:bg-pink-100 hover:text-pink-600"
            : "hover:bg-gray-100",
          isAuthor && "opacity-70 cursor-not-allowed"
        )}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-all",
            isLiked ? "fill-pink-500 text-pink-500" : "fill-none",
            isAnimating && "animate-heartbeat"
          )}
        />
        <span className={cn("font-medium", isLiked ? "text-pink-500" : "")}>
          {likeCount > 0 ? likeCount : "Like"}
        </span>
      </Button>
    </Hint>
  );
}
