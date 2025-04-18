"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share, Facebook, Twitter, Linkedin, Check, Copy } from "lucide-react";
import { trackShare } from "@/app/actions/share-actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Share as ShareType } from "@/app/actions/share-actions";

interface ShareDialogProps {
  postId: string;
  postTitle: string;
  isLoggedIn: boolean;
  recentShares: ShareType[];
}

export function ShareDialog({
  postId,
  postTitle,
  isLoggedIn,
  recentShares,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/free-board/${postId}`
      : `/free-board/${postId}`;

  const handleShare = async (platform: string) => {
    if (!isLoggedIn) {
      toast.error("Please log in to share this post");
      return;
    }

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }

    // Track the share
    if (platform !== "copy" || copied) {
      try {
        await trackShare(postId, platform);

        // Show toast notification for points
        toast.success(
          "You earned 100 EXP and 50 KOR Coins for sharing this post!",
          {
            duration: 3000,
            position: "bottom-right",
          }
        );
      } catch (error) {
        console.error("Error tracking share:", error);
      }
    }

    // Open share URL in new window
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full cursor-pointer"
        >
          <Share className="h-5 w-5 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to share this post with your friends and
            colleagues.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4 justify-between">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 flex-col h-auto py-4 gap-2"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-6 w-6 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 flex-col h-auto py-4 gap-2"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-6 w-6 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 flex-col h-auto py-4 gap-2"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-6 w-6 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
          </div>

          <div className="relative mt-2">
            <Input
              value={postUrl}
              readOnly
              className="pr-12 text-sm text-gray-500"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-8 px-2"
              onClick={() => handleShare("copy")}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
        </div>

        {recentShares.length > 0 && (
          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3">Recently shared by</h4>
            <div className="flex flex-wrap gap-2">
              {recentShares.map((share) => {
                const userName = share.user
                  ? `${share.user.first_name || ""} ${share.user.last_name || ""}`.trim()
                  : "Anonymous";

                return (
                  <div
                    key={share.id}
                    className="flex items-center"
                    title={`${userName} via ${share.share_type}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={share.user?.avatar_url || ""}
                        alt={userName}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
